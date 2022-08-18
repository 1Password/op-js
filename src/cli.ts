import { spawnSync } from "child_process";
import { lookpath } from "lookpath";
import semverCoerce from "semver/functions/coerce";
import semverSatisfies from "semver/functions/satisfies";
import { version } from "../package.json";
import {
	FieldAssignment,
	FieldLabelSelector,
	FieldTypeSelector,
	GlobalFlags,
} from "./index";

export type FlagValue =
	| string
	| string[]
	| boolean
	| FieldLabelSelector
	| FieldTypeSelector;
export type Flags = Record<string, FlagValue>;

export interface ClientInfo {
	name: string;
	id: string;
	build: string;
}

export class ValidationError extends Error {
	public constructor(
		type: "not-found" | "version",
		public requiredVersion?: string,
		public currentVersion?: string,
	) {
		let message: string;
		switch (type) {
			case "not-found":
				message = "Could not find `op` executable";
				break;
			case "version":
				message = `CLI version ${currentVersion} does not satisfy required version ${requiredVersion}`;
				break;
		}

		super(message);
		this.name = "ValidationError";
	}
}

export class ExecutionError extends Error {
	public constructor(message: string, public status: number) {
		super(message);
		this.name = "ExecutionError";
	}
}

export class CLIError extends ExecutionError {
	static errorRegex = /\[ERROR] (\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) (.+)/;
	public timestamp?: Date;

	public constructor(public originalMessage: string, status: number) {
		const errorMatch = originalMessage.match(CLIError.errorRegex);
		let parsedMessage: string;
		let parsedTimestamp: Date;

		if (errorMatch) {
			parsedMessage = errorMatch[2];
			parsedTimestamp = new Date(errorMatch[1]);
		} else {
			parsedMessage = "Unknown error";
		}

		super(parsedMessage, status);
		this.name = "CLIError";
		this.timestamp = parsedTimestamp;
	}
}

export const semverToInt = (input: string) =>
	input
		.split(".")
		.map((n) => n.padStart(2, "0"))
		.join("");

export const camelToHyphen = (str: string) =>
	str.replace(/([A-Za-z])(?=[A-Z])/g, "$1-").toLowerCase();

export const sanitizeInput = (str: string) =>
	str.replace(/(["$'\\`])/g, "\\$1");

export const parseFlagValue = (value: FlagValue) => {
	if (typeof value === "string") {
		return `=${sanitizeInput(value)}`;
	}

	if (Array.isArray(value)) {
		return `=${value.join(",")}`;
	}

	if (typeof value === "object") {
		let fields = "";

		if ("label" in value) {
			fields += (value.label || []).map((label) => `label=${label}`).join(",");
		}

		if ("type" in value) {
			fields += (value.type || []).map((type) => `type=${type}`).join(",");
		}

		if (fields.length > 0) {
			return `=${sanitizeInput(fields)}`;
		}
	}

	// If we get here, it's a boolean and boolean CLI flags don't have a value
	return "";
};

export const createFlags = (flags: Flags): string[] =>
	Object.entries(flags)
		.filter(([_, value]) => Boolean(value))
		.map(
			([flag, value]) =>
				`--${camelToHyphen(sanitizeInput(flag))}${parseFlagValue(value)}`,
		);

export const createFieldAssignment = ([
	label,
	type,
	value,
]: FieldAssignment): string =>
	`${sanitizeInput(label)}[${sanitizeInput(type)}]=${sanitizeInput(value)}`;

export const defaultClientInfo: ClientInfo = {
	name: "1Password for JavaScript",
	id: "JS",
	build: semverToInt(version),
};

export class CLI {
	public static recommendedVersion = ">=2.6.2";
	public clientInfo: ClientInfo = defaultClientInfo;
	public globalFlags: Partial<GlobalFlags> = {};

	public setClientInfo(clientInfo: ClientInfo) {
		this.clientInfo = clientInfo;
	}

	public getVersion(): string {
		return this.execute<string>([], { flags: { version: true }, json: false });
	}

	public async validate(requiredVersion: string = CLI.recommendedVersion) {
		const cliExists = !!(await lookpath("op"));

		if (!cliExists) {
			throw new ValidationError("not-found");
		}

		const version = this.getVersion();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
		const semVersion = semverCoerce(version);

		if (!semverSatisfies(semVersion, requiredVersion)) {
			throw new ValidationError("version", requiredVersion, version);
		}
	}

	public execute<TData extends string | Record<string, any> | void>(
		command: string[],
		{
			args = [],
			flags = {},
			stdin,
			json = true,
		}: {
			args?: (string | null | FieldAssignment)[];
			flags?: Flags;
			stdin?: string | Record<string, any>;
			json?: boolean;
		} = {},
	): TData {
		let input: NodeJS.ArrayBufferView;
		command = command.map((part) => sanitizeInput(part));

		for (const arg of args) {
			if (typeof arg === "string") {
				command.push(sanitizeInput(arg));
				// If it's an array assume it's a field assignment
			} else if (Array.isArray(arg)) {
				command.push(createFieldAssignment(arg));
			}

			// arg can be null, but that's just so we can lazily
			// set the value, safely dropping if it remains null
		}

		if (json) {
			flags = { ...flags, format: "json" };
		}

		command = [
			...command,
			...createFlags({
				...this.globalFlags,
				...flags,
			}),
		];

		if (stdin) {
			input = Buffer.from(
				typeof stdin === "string" ? stdin : JSON.stringify(stdin),
			);
		}

		const { status, error, stdout, stderr } = spawnSync("op", command, {
			stdio: "pipe",
			input,
			env: {
				...process.env,
				OP_INTEGRATION_NAME: this.clientInfo.name,
				OP_INTEGRATION_ID: this.clientInfo.id,
				OP_INTEGRATION_BUILDNUMBER: this.clientInfo.build,
			},
		});

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
}

export const cli = new CLI();
