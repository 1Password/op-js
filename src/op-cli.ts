import { spawnSync } from "child_process";
import { lookpath } from "lookpath";
import semverCoerce from "semver/functions/coerce";
import semverSatisfies from "semver/functions/satisfies";
import { version } from "../package.json";

import { CLIError, ExecutionError, VerificationError } from "./errors";
import { buildCommand, type Arg, type Flags } from "./build-command";

import { AccountCommand, ListAccount } from "./commands/account";
import { DocumentCommand } from "./commands/document";
import { ItemCommand } from "./commands/item";
import { VaultCommand } from "./commands/vault";
import { UserCommand } from "./commands/user";
import { GroupCommand } from "./commands/group";
import { ConnectCommand } from "./commands/connect";
import { EventsApiCommand } from "./commands/events-api";
import { InjectCommand } from "./commands/inject";
import { ReadCommand } from "./commands/read";
import { RunCommand } from "./commands/run";
import { ServiceAccountCommand } from "./commands/service-account";
import { WhoamiCommand } from "./commands/whoami";

export { type Flags } from "./build-command";

export interface ConnectConfig {
	host: string;
	token: string;
}

export interface ServiceAccountConfig {
	saToken: string;
}

type AuthConfig = ConnectConfig | ServiceAccountConfig;

export interface GlobalFlags {
	account: string;
	cache: boolean;
	config: string;
	encoding:
		| "utf-8"
		| "shift-jis"
		| "shiftjis"
		| "sjis"
		| "s-jis"
		| "shift_jis"
		| "s_jis"
		| "gbk";
	isoTimestamps: boolean;
	session: string;
}

interface ClientInfo {
	name: string;
	id: string;
	build: string;
}

interface OpCliConfig {
	globalFlags?: Partial<GlobalFlags>;
	authConfig?: AuthConfig;
	clientInfo?: ClientInfo;
	opPath?: string;
}

export const semverToInt = (input: string) =>
	input
		.split(".")
		.map((n) => n.padStart(2, "0"))
		.join("");

export const defaultClientInfo: ClientInfo = {
	name: "1Password for JavaScript",
	id: "JS",
	build: semverToInt(version),
};

export class OpCli {
	public globalFlags?: Partial<GlobalFlags>;
	public authConfig?: AuthConfig;
	public opPath?: string;
	public clientInfo?: ClientInfo;

	public readonly account: AccountCommand;
	public readonly document: DocumentCommand;
	public readonly item: ItemCommand;
	public readonly vault: VaultCommand;
	public readonly user: UserCommand;
	public readonly group: GroupCommand;
	public readonly connect: ConnectCommand;
	public readonly eventsApi: EventsApiCommand;
	public readonly inject: InjectCommand;
	public readonly read: ReadCommand;
	public readonly run: RunCommand;
	public readonly serviceAccount: ServiceAccountCommand;
	public readonly whoami: WhoamiCommand;

	constructor(config: OpCliConfig = {}) {
		if (config.globalFlags) {
			this.globalFlags = config.globalFlags;
		}

		if (config.authConfig) {
			this.authConfig = config.authConfig;
		}

		if (config.opPath) {
			this.opPath = config.opPath;
		}

		this.clientInfo = config.clientInfo ?? defaultClientInfo;

		this.account = new AccountCommand(this);
		this.document = new DocumentCommand(this);
		this.item = new ItemCommand(this);
		this.vault = new VaultCommand(this);
		this.user = new UserCommand(this);
		this.group = new GroupCommand(this);
		this.connect = new ConnectCommand(this);
		this.eventsApi = new EventsApiCommand(this);
		this.inject = new InjectCommand(this);
		this.read = new ReadCommand(this);
		this.run = new RunCommand(this);
		this.serviceAccount = new ServiceAccountCommand(this);
		this.whoami = new WhoamiCommand(this);
	}

	public async verify(requiredVersion?: string) {
		const opExecutable = this.opPath || "op";
		const cliExists = !!(await lookpath(opExecutable));

		if (!cliExists) {
			throw new VerificationError("not-found");
		}

		if (requiredVersion) {
			const version = this.version();
			const semVersion = semverCoerce(version);

			if (!semverSatisfies(semVersion, requiredVersion)) {
				throw new VerificationError("version", requiredVersion, version);
			}
		}
	}

	public execute<TData extends string | Record<string, any> | void>(
		subCommand: string[],
		{
			args = [],
			flags = {},
			stdin,
			json = true,
			returnRaw = false,
		}: {
			args?: Arg[];
			flags?: Flags;
			stdin?: string | Record<string, any>;
			json?: boolean;
			returnRaw?: boolean;
		} = {},
	): TData {
		const { parts, input } = buildCommand(
			subCommand,
			args,
			flags,
			json,
			this.globalFlags,
			stdin,
		);

		const env: Record<string, string> = {
			...process.env,
			OP_INTEGRATION_NAME: this.clientInfo.name,
			OP_INTEGRATION_ID: this.clientInfo.id,
			OP_INTEGRATION_BUILDNUMBER: this.clientInfo.build,
		};

		if (this.authConfig) {
			if ("saToken" in this.authConfig) {
				env.OP_SERVICE_ACCOUNT_TOKEN = this.authConfig.saToken;
			} else {
				env.OP_CONNECT_HOST = this.authConfig.host;
				env.OP_CONNECT_TOKEN = this.authConfig.token;
			}
		}

		const opExecutable = this.opPath || "op";
		const { status, error, stdout, stderr } = spawnSync(opExecutable, parts, {
			stdio: input ? "pipe" : ["ignore", "pipe", "pipe"],
			input: input as NodeJS.ArrayBufferView,
			env,
		});

		if (returnRaw) {
			return {
				stdout: stdout.toString(),
				stderr: stderr.toString(),
				exitCode: status || 0,
			} as unknown as TData;
		}

		if (error) {
			throw new ExecutionError(error.message, status);
		}

		const cliError = stderr.toString();
		if (cliError.length > 0) {
			throw new CLIError(cliError, status);
		}

		const output = stdout.toString().trim();

		if (output.length === 0) {
			return;
		}

		if (!json) {
			return output as TData;
		}

		try {
			return JSON.parse(output) as TData;
		} catch (error) {
			console.log(output);
			throw error;
		}
	}

	public executeRun(
		subCommand: string[],
		{
			args = [],
			flags = {},
		}: {
			args?: string[];
			flags?: Flags;
		} = {},
	): { stdout: string; stderr: string; exitCode: number } {
		return this.execute(subCommand, {
			args,
			flags,
			json: false,
			returnRaw: true,
		});
	}

	/**
	 * Get the version of the CLI.
	 */
	public version(): string {
		return this.execute<string>([], { flags: { version: true }, json: false });
	}
}
