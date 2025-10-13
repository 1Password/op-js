import { validFieldPurposes } from "./commands/item";
import { ComponentLengthError } from "./errors";
import { FieldAssignment, FieldLabelSelector, FieldTypeSelector } from ".";

/**
 * When building commands for the CLI:
 * - We enforce limits/maximums to keep execution predictable and safe: caps on arg/flag counts and
 *   lengths to help mitigate DoS-style abuse and avoid OS limits that cause spawn failures.
 * - We don’t sanitize/escape user input because we don’t invoke a shell (shell: false): arguments are
 *   passed directly to the OS so metacharacters are treated literally.
 */

export type FlagValue =
	| string
	| string[]
	| boolean
	| FieldLabelSelector
	| FieldTypeSelector;
export type Flags = Record<string, FlagValue>;
export type Arg = string | FieldAssignment;

export const MAX_SUBCOMMAND_PARTS = 4;
export const MAX_ARGS = 32;
export const MAX_ARG_LENGTH = 2048;
export const MAX_FLAGS = 32;
export const MAX_FLAG_NAME_LENGTH = 40;
export const MAX_FLAG_VALUE_LENGTH = 2048;
export const MAX_STDIN_LENGTH = 1_048_576; // 1 MiB

export const parseFlagName = (name: string): string => {
	if (typeof name !== "string" || name.length === 0) {
		throw new TypeError("Flag names must be non-empty strings");
	}

	if (name.length > MAX_FLAG_NAME_LENGTH) {
		throw new ComponentLengthError(
			"flag name characters",
			MAX_FLAG_NAME_LENGTH,
			name.length,
		);
	}

	return name.replace(/([A-Za-z])(?=[A-Z])/g, "$1-").toLowerCase();
};

export const parseFlagValue = (value: FlagValue): string => {
	if (value === null || value === undefined) {
		return "";
	}

	let flagValue: string;

	if (typeof value === "string") {
		flagValue = value;
	}

	if (Array.isArray(value)) {
		const values = value.map((item) => {
			if (typeof item !== "string") {
				throw new TypeError("Array flag values must be strings");
			}

			return item;
		});

		const combinedValues = values.join(",");
		flagValue = combinedValues;
	}

	// Currently these should only ever be field selectors
	if (typeof value === "object") {
		const parts: string[] = [];

		if ("label" in value && Array.isArray(value.label)) {
			parts.push(
				...value.label.map((label) => {
					if (typeof label !== "string") {
						throw new TypeError("Field labels must be strings");
					}

					return `label=${label}`;
				}),
			);
		}

		if ("type" in value && Array.isArray(value.type)) {
			parts.push(
				...value.type.map((type) => {
					if (typeof type !== "string") {
						throw new TypeError("Field types must be strings");
					}

					return `type=${type}`;
				}),
			);
		}

		if (parts.length > 0) {
			const selectorValue = parts.join(",");
			flagValue = selectorValue;
		}
	}

	if (flagValue) {
		if (flagValue.length > MAX_FLAG_VALUE_LENGTH) {
			throw new ComponentLengthError(
				"flag value characters",
				MAX_FLAG_VALUE_LENGTH,
				flagValue.length,
			);
		}

		return `=${flagValue}`;
	}

	// If we get here, it's a true boolean
	return "";
};

export const processSubCommand = (subCommand: string[]): string[] => {
	if (!Array.isArray(subCommand)) {
		throw new TypeError("Sub-command must be an array");
	}

	if (subCommand.length > MAX_SUBCOMMAND_PARTS) {
		throw new ComponentLengthError(
			"sub-commands",
			MAX_SUBCOMMAND_PARTS,
			subCommand.length,
		);
	}

	for (const part of subCommand) {
		if (typeof part !== "string" || part.length === 0 || part.includes(" ")) {
			throw new TypeError(
				"Sub-commands must be non-empty strings without spaces",
			);
		}
	}

	return subCommand;
};

export const processArgs = (args: Arg[]): string[] => {
	const argParts: string[] = [];

	if (!Array.isArray(args)) {
		throw new TypeError("Arguments must be an array");
	}

	if (args.length > MAX_ARGS) {
		throw new ComponentLengthError("arguments", MAX_ARGS, args.length);
	}

	for (const arg of args) {
		let argPart: string;
		if (typeof arg === "string") {
			argPart = arg;
		} else if (Array.isArray(arg)) {
			argPart = parseFieldAssignment(arg);
		} else {
			throw new TypeError("Arguments must be string or field assignment array");
		}

		if (argPart.length > MAX_ARG_LENGTH) {
			throw new ComponentLengthError(
				"argument characters",
				MAX_ARG_LENGTH,
				argPart.length,
			);
		}

		argParts.push(argPart);
	}

	return argParts;
};

export const parseFieldAssignment = (
	fieldAssignment: FieldAssignment,
): string => {
	if (
		!Array.isArray(fieldAssignment) ||
		fieldAssignment.length < 3 ||
		fieldAssignment.length > 4
	) {
		throw new TypeError(
			"Field assignment must be an array of [label, type, value] or [label, type, value, purpose]",
		);
	}

	const [label, type, value, purpose] = fieldAssignment;

	if (typeof label !== "string" || label.length === 0) {
		throw new TypeError("Field label must be a non-empty string");
	}

	if (typeof type !== "string" || type.length === 0) {
		throw new TypeError("Field type must be a non-empty string");
	}

	if (typeof value !== "string") {
		throw new TypeError("Field value must be a string");
	}

	let result = `${label}[${type}]=${value}`;

	// Add purpose if provided
	if (purpose !== undefined) {
		if (typeof purpose !== "string" || purpose.length === 0) {
			throw new TypeError("Field purpose must be a non-empty string");
		}

		if (!validFieldPurposes.includes(purpose)) {
			throw new TypeError(
				`Invalid field purpose: must be one of ${validFieldPurposes.join(", ")}`,
			);
		}

		result += `[${purpose}]`;
	}

	return result;
};

export const processFlags = (flags: Flags): string[] => {
	if (!flags) {
		return [];
	}

	if (typeof flags !== "object") {
		throw new TypeError("Flags must be an object");
	}

	const entries = Object.entries(flags);

	if (entries.length > MAX_FLAGS) {
		throw new ComponentLengthError("flags", MAX_FLAGS, entries.length);
	}

	return entries
		.filter(([_, value]) => Boolean(value))
		.map(([name, value]) => {
			const flagName = parseFlagName(name);
			const flagValue = parseFlagValue(value);
			return `--${flagName}${flagValue}`;
		});
};

export const processStdin = (
	stdin?: string | Record<string, any>,
): Buffer | undefined => {
	let input: Buffer | undefined;

	if (stdin !== undefined) {
		if (typeof stdin === "string") {
			if (stdin.length > MAX_STDIN_LENGTH) {
				throw new ComponentLengthError(
					"stdin characters",
					MAX_STDIN_LENGTH,
					stdin.length,
				);
			}
			input = Buffer.from(stdin);
		} else if (typeof stdin === "object" && stdin !== null) {
			try {
				const jsonString = JSON.stringify(stdin);
				if (jsonString.length > MAX_STDIN_LENGTH) {
					throw new ComponentLengthError(
						"stdin JSON characters",
						MAX_STDIN_LENGTH,
						jsonString.length,
					);
				}
				input = Buffer.from(jsonString);
			} catch (error) {
				throw new Error("Invalid stdin object: must be JSON serializable");
			}
		} else {
			throw new TypeError("Stdin must be a string or object");
		}
	}

	return input;
};

export const buildCommand = (
	subCommand: string[],
	args: Arg[],
	flags: Flags,
	json: boolean,
	globalFlags: Flags,
	stdin?: string | Record<string, any>,
) => ({
	parts: [
		...processSubCommand(subCommand),
		...processArgs(args),
		...processFlags({
			...(globalFlags || {}),
			...flags,
			...(json ? { format: "json" } : {}),
		}),
	],
	input: processStdin(stdin),
});
