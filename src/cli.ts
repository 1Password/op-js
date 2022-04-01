import { spawnSync } from "child_process";
import { FieldAssignment, GlobalFlags } from "./index";

export type Flags = Record<string, FlagValue>;
export type FlagValue = string | string[] | boolean;

export const camelToHyphen = (str: string) =>
	str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);

export const parseFlagValue = (value: FlagValue) => {
	if (typeof value === "string") {
		return `="${value}"`;
	}

	if (Array.isArray(value)) {
		return `="${value.join(",")}"`;
	}

	return "";
};

export class CLI {
	public globalFlags: Partial<GlobalFlags> = {};

	private createFieldAssignment([field, type, value]: FieldAssignment): string {
		return `"${field}[${type}]=${value}"`;
	}

	private createFlags(flags: Record<string, FlagValue>): string[] {
		return Object.entries(flags)
			.filter(([_, value]) => Boolean(value))
			.map(
				([flag, value]) => `--${camelToHyphen(flag)}${parseFlagValue(value)}`,
			);
	}

	public execute<TData extends string | Record<string, any> | void>(
		command: string[],
		{
			args = [],
			flags = {},
			json = true,
		}: {
			args?: (string | null | FieldAssignment)[];
			flags?: Record<string, FlagValue>;
			json?: boolean;
		} = {},
	): TData {
		for (const arg of args) {
			if (typeof arg === "string") {
				command.push(`"${arg}"`);
			} else if (arg !== null) {
				command.push(this.createFieldAssignment(arg));
			}
		}

		if (json) {
			flags = { ...flags, format: "json" };
		}

		command = [
			...command,
			...this.createFlags({
				...this.globalFlags,
				...flags,
			}),
		];

		if (process.env.NODE_ENV === "development") {
			console.info("op", command.join(" "));
		}

		const result = spawnSync("op", command, {
			shell: true,
			stdio: ["inherit", "pipe", "pipe"],
		});

		if (result.error) {
			throw result.error;
		}

		const stderr = result.stderr.toString();
		if (stderr.length > 0) {
			throw new Error(stderr);
		}

		const output = result.stdout.toString().trim();

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
