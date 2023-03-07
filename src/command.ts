import { spawnSync } from "child_process";
import { type GlobalFlags } from ".";
import { CLIError, ExecutionError } from "./errors";
import Flag, { type Flags } from "./flag";

export default class Command {
	public constructor(
		private binaryPath: string,
		private globalFlags: Partial<GlobalFlags>,
		private env: NodeJS.ProcessEnv,
	) {}

	public execute<TData extends string | Record<string, any> | void>(
		command: string[],
		{
			args = [],
			flags = {},
			json = true,
			stdin,
		}: {
			args?: string[];
			flags?: Flags;
			json?: boolean;
			stdin?: string | Record<string, any>;
		} = {},
	): TData {
		let input: NodeJS.ArrayBufferView;
		const parts = this.buildParts(command, args, flags, json);

		if (stdin) {
			input = Buffer.from(
				typeof stdin === "string" ? stdin : JSON.stringify(stdin),
			);
		}

		const { status, error, stdout, stderr } = spawnSync(
			this.binaryPath,
			parts,
			{
				stdio: "pipe",
				input,
				env: {
					...process.env,
					...this.env,
				},
			},
		);

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

		return JSON.parse(output) as TData;
	}

	private buildParts(
		command: string[],
		args: string[],
		flags: Flags,
		json: boolean,
	): string[] {
		const parts = command;

		for (const arg of args) {
			if (typeof arg !== "string") {
				throw new TypeError("Invalid argument");
			}

			parts.push(arg);
		}

		flags = { ...this.globalFlags, ...flags };

		if (json) {
			flags = { ...flags, format: new Flag("json") };
		}

		return [
			...parts,
			...Object.entries(flags).map(([name, flag]) => {
				if (!(flag instanceof Flag)) {
					flag = new Flag(flag);
				}

				return flag.toCommandFlag(name);
			}),
		];
	}
}
