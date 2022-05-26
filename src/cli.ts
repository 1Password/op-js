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
	str.replace(/([A-Za-z])(?=[A-Z])/g, "$1-").toLowerCase();

export const sanitizeInput = (str: string) =>
	str.replace(/(["$'\\`])/g, "\\$1");

export const parseFlagValue = (value: FlagValue) => {
	if (typeof value === "string") {
		return `="${sanitizeInput(value)}"`;
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
			return `="${sanitizeInput(fields)}"`;
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
	`"${sanitizeInput(label)}[${sanitizeInput(type)}]=${sanitizeInput(value)}"`;

export class CLI {
	public static recommendedVersion = ">=2.2.0";
	public globalFlags: Partial<GlobalFlags> = {};

	public getVersion(): string {
		return this.execute<string>([], { flags: { version: true }, json: false });
	}

	public async validate(requiredVersion: string = CLI.recommendedVersion) {
		const cliExists = !!(await lookpath("op"));

		if (!cliExists) {
			throw new Error("Could not locate op CLI");
		}

		const version = this.getVersion();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
		const semVersion = semverCoerce(version);

		if (!semverSatisfies(semVersion, requiredVersion)) {
			throw new Error(
				`CLI version ${version} does not satisfy version requirement of ${CLI.recommendedVersion}`,
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
			flags?: Flags;
			stdin?: string;
			json?: boolean;
		} = {},
	): TData {
		command = command.map((part) => sanitizeInput(part));

		for (const arg of args) {
			if (typeof arg === "string") {
				command.push(`"${sanitizeInput(arg)}"`);
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

		const result = spawnSync(`op`, command, {
			shell: true,
			stdio: "pipe",
			input: stdin,
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
