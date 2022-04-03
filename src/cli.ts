import { spawnSync } from "child_process";
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
	field,
	type,
	value,
]: FieldAssignment): string => `"${field}[${type}]=${value}"`;

export class CLI {
	public globalFlags: Partial<GlobalFlags> = {};

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
