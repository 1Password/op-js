import { spawnSync } from "child_process";
import { FieldAssignment, GlobalFlags } from "./index";

type CLIResponse<T> = T | { message: string };

export const camelToHyphen = (str: string) =>
	str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);

export class CLI {
	public globalFlags: Partial<GlobalFlags> = {};

	private createFieldAssignment([field, type, value]: FieldAssignment): string {
		return `"${field}[${type}]=${value}"`;
	}

	private createFlags(flags: Record<string, string | boolean>): string[] {
		return (
			Object.entries(flags)
				// eslint-disable-next-line @typescript-eslint/naming-convention
				.filter(([_, value]) => Boolean(value))
				.map(
					([flag, value]) =>
						`--${camelToHyphen(flag)}${
							typeof value === "string" ? `="${value}"` : ""
						}`,
				)
		);
	}

	public execute<TData = Record<string, any>>(
		command: string[],
		{
			args = [],
			flags = {},
		}: {
			args?: (string | null | FieldAssignment)[];
			flags?: Record<string, string | boolean>;
		} = {},
	): CLIResponse<TData> {
		for (const arg of args) {
			if (typeof arg === "string") {
				command.push(`"${arg}"`);
			} else if (arg !== null) {
				command.push(this.createFieldAssignment(arg));
			}
		}

		command = [
			...command,
			...this.createFlags({
				...this.globalFlags,
				...flags,
				// We always want to use JSON format
				format: "json",
			}),
		];

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
		try {
			return JSON.parse(output) as TData;
		} catch {
			return {
				message: output,
			} as unknown as TData;
		}
	}
}

export const cli = new CLI();
