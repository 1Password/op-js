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

// 🔵todo Can we name this something more specific? JS could mean a whole lot of things so perhaps something along the lines of `1password-op-node`

export type FlagValue =
	| string
	| string[]
	| boolean
	| FieldLabelSelector
	| FieldTypeSelector;
export type Flags = Record<string, FlagValue>;

export const camelToHyphen = (str: string) =>
	str.replace(/([A-Za-z])(?=[A-Z])/g, "$1-").toLowerCase();

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

		// 🟡todo we are not handling escaping of quotes which means that we can end up with a string like ="label=s"s"
		if (fields.length > 0) {
			return `="${fields}"`;
		}
	}

	return "";
};

// 🔵todo could use Flags type here instead of repeating it.
export const createFlags = (flags: Record<string, FlagValue>): string[] =>
	Object.entries(flags)
		.filter(([_, value]) => Boolean(value))
		.map(([flag, value]) => `--${camelToHyphen(flag)}${parseFlagValue(value)}`);

// 🟡todo We're not handling escaping of special characters for field assignments.
//     From the docs: If you need to use periods, equal signs, or backslashes in the name of a section or field, use a backslash character to escape them. Don't use backslashes to escape the value side of the assignment.
export const createFieldAssignment = ([
	label,
	type,
	value,
]: FieldAssignment): string => `"${label}[${type}]=${value}"`;

export class CLI {
	public static requiredVersion = ">=2.2.0";
	public globalFlags: Partial<GlobalFlags> = {};
	public commandLogger?: (message: string) => void;

	public getVersion(): string {
		return this.execute<string>([], { flags: { version: true }, json: false });
	}

	// 🔵todo should a client be allowed to set their own minimum version?
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
				// 🟡todo We should be escaping quote characters in strings that we're passing in here.
				command.push(`"${arg}"`);
				// If it's an array assume it's a field assignment
			} else if (Array.isArray(arg)) {
				command.push(createFieldAssignment(arg));
			}
			// 🟡todo we are dropping null args - comment as to why.
		}

		if (json) {
			flags = { ...flags, format: "json" };
		}

		command = [
			// 🟡todo We're not sanitizing the commands coming through here - spawnSync + shell will act on any special-meaning characters.
			...command,
			...createFlags({
				...this.globalFlags,
				...flags,
			}),
		];

		// 🟡todo Try .input key of `spawnSync` options instead of this piping.
		if (stdin.length > 0) {
			stdin = `echo "${stdin.replace(/"/g, '\\"')}" | `;
		}

		// 🔴todo We could be passing passwords in plaintext as arguments through this. Eliminate logging.
		if (this.commandLogger) {
			this.commandLogger(`${stdin}op ${command.join(" ")}`);
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
