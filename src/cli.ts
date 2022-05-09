import { spawnSync } from "child_process";
import { lookpath } from "lookpath";
import semverCoerce from "semver/functions/coerce";
import semverSatisfies from "semver/functions/satisfies";
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

export const camelToHyphen = (str: string) =>
	str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);

export const parseFlagValue = (value: FlagValue) => {
	if (typeof value === "string") {
		return `="${value}"`;
	}

	if (Array.isArray(value)) {
		return `="${value.join(",")}"`;
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
			return `="${fields}"`;
		}
	}

	return "";
};

export const createFlags = (flags: Record<string, FlagValue>): string[] =>
	Object.entries(flags)
		.filter(([_, value]) => Boolean(value))
		.map(([flag, value]) => `--${camelToHyphen(flag)}${parseFlagValue(value)}`);

export const createFieldAssignment = ([
	label,
	type,
	value,
]: FieldAssignment): string => `"${label}[${type}]=${value}"`;

export class CLI {
	public static requiredVersion = ">=2.2.0";
	public globalFlags: Partial<GlobalFlags> = {};

	public getVersion(): string {
		return this.execute<string>([], { flags: { version: true }, json: false });
	}

	public async validate() {
		const cliExists = !!(await lookpath("op"));

		if (!cliExists) {
			throw new Error("Could not locate op CLI");
		}

		const version = this.getVersion();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
		const semVersion = semverCoerce(version);

		if (!semverSatisfies(semVersion, CLI.requiredVersion)) {
			throw new Error(
				`CLI version ${version} does not satisfy version requirement of ${CLI.requiredVersion}`,
			);
		}
	}

	public execute<TData extends string | Record<string, any> | void>(
		command: string[],
		{
			args = [],
			flags = {},
			stdin = "",
			json = true,
		}: {
			args?: (string | null | FieldAssignment)[];
			flags?: Record<string, FlagValue>;
			stdin?: string;
			json?: boolean;
		} = {},
	): TData {
		for (const arg of args) {
			if (typeof arg === "string") {
				command.push(`"${arg}"`);
				// If it's an array assume it's a field assignment
			} else if (Array.isArray(arg)) {
				command.push(createFieldAssignment(arg));
			}
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

		// I know this isn't the right way to do
		// this, but it's quick and dirty so idc
		if (stdin.length > 0) {
			stdin = `echo "${stdin.replace(/"/g, '\\"')}" | `;
		}

		if (["development", "test"].includes(process.env.NODE_ENV)) {
			process.stdout.write(
				`\nCommand used:\n\u001B[93m${stdin}op ${command.join(
					" ",
				)}\u001B[39m\n`,
			);
		}

		const result = spawnSync(`${stdin}op`, command, {
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
