import semverCoerce from "semver/functions/coerce";
import semverSatisfies from "semver/functions/satisfies";
import { ExecutionError } from "./errors";
import { validFieldPurposes } from "./commands/item";
import { FieldAssignment, FieldLabelSelector, FieldTypeSelector } from ".";

export type FlagValue =
	| string
	| string[]
	| boolean
	| FieldLabelSelector
	| FieldTypeSelector;
export type Flags = Record<string, FlagValue>;
export type Arg = string | FieldAssignment;

export const camelToHyphen = (str: string) =>
	str.replace(/([A-Za-z])(?=[A-Z])/g, "$1-").toLowerCase();

const equalArray = (a: any[], b: any[]) =>
	a.length === b.length && a.every((val, index) => val === b[index]);

// Maximums to prevent DoS attacks
const MAX_INPUT_LENGTH = 10000;
const MAX_FLAG_VALUE_LENGTH = 5000;
const MAX_FLAG_NAME_LENGTH = 100;
const MAX_FLAGS_COUNT = 100;
const MAX_ARGS_COUNT = 50;
const MAX_SUBCOMMAND_PARTS = 10;

// Shell metacharacters that are dangerous for command injection
// Excluding characters needed for CLI syntax like = and ,
const DANGEROUS_CHARS = /[!"#$&'()*;<>?[\\\]^`{|}~\s]/g;

export const sanitizeInput = (str: string): string => {
	if (typeof str !== "string") {
		throw new TypeError("Input must be a string");
	}

	if (str.length > MAX_INPUT_LENGTH) {
		throw new Error(
			`Input too long: maximum ${MAX_INPUT_LENGTH} characters allowed`,
		);
	}

	// Handle empty string
	if (str.length === 0) {
		return str;
	}

	return str.replace(DANGEROUS_CHARS, "\\$&");
};

export const parseFlagValue = (value: FlagValue): string => {
	if (value === null || value === undefined) {
		return "";
	}

	if (typeof value === "string") {
		if (value.length > MAX_FLAG_VALUE_LENGTH) {
			throw new Error(
				`Flag value too long: maximum ${MAX_FLAG_VALUE_LENGTH} characters allowed`,
			);
		}
		return `=${sanitizeInput(value)}`;
	}

	if (Array.isArray(value)) {
		// Validate array elements and sanitize each one
		const sanitizedValues = value.map((item) => {
			if (typeof item !== "string") {
				throw new TypeError("Array flag values must be strings");
			}
			if (item.length > MAX_FLAG_VALUE_LENGTH) {
				throw new Error(
					`Flag value too long: maximum ${MAX_FLAG_VALUE_LENGTH} characters allowed`,
				);
			}
			return sanitizeInput(item);
		});

		const result = sanitizedValues.join(",");
		if (result.length > MAX_FLAG_VALUE_LENGTH) {
			throw new Error(
				`Combined flag values too long: maximum ${MAX_FLAG_VALUE_LENGTH} characters allowed`,
			);
		}
		return `=${result}`;
	}

	if (typeof value === "object") {
		// Validate and process field selectors
		const parts: string[] = [];

		if ("label" in value && Array.isArray(value.label)) {
			parts.push(
				...value.label.map((label) => {
					if (typeof label !== "string") {
						throw new TypeError("Field labels must be strings");
					}
					return `label=${sanitizeInput(label)}`;
				}),
			);
		}

		if ("type" in value && Array.isArray(value.type)) {
			parts.push(
				...value.type.map((type) => {
					if (typeof type !== "string") {
						throw new TypeError("Field types must be strings");
					}
					return `type=${sanitizeInput(type)}`;
				}),
			);
		}

		if (parts.length > 0) {
			const result = parts.join(",");
			if (result.length > MAX_FLAG_VALUE_LENGTH) {
				throw new Error(
					`Field selector too long: maximum ${MAX_FLAG_VALUE_LENGTH} characters allowed`,
				);
			}
			return `=${result}`;
		}
	}

	// If we get here, it's a true boolean
	return "";
};

export const createFlags = (flags: Flags): string[] => {
	// Input validation
	if (!flags || typeof flags !== "object") {
		return [];
	}

	const entries = Object.entries(flags);

	// Limit number of flags
	if (entries.length > MAX_FLAGS_COUNT) {
		throw new Error(`Too many flags: maximum ${MAX_FLAGS_COUNT} flags allowed`);
	}

	return entries
		.filter(([_, value]) => Boolean(value))
		.map(([flag, value]) => {
			// Validate flag name
			if (typeof flag !== "string" || flag.length === 0) {
				throw new TypeError("Flag names must be non-empty strings");
			}

			if (flag.length > MAX_FLAG_NAME_LENGTH) {
				throw new Error(
					`Flag name too long: maximum ${MAX_FLAG_NAME_LENGTH} characters allowed`,
				);
			}

			// Convert camelCase to kebab-case and sanitize
			const sanitizedFlag = sanitizeInput(camelToHyphen(flag));
			const flagValue = parseFlagValue(value);

			return `--${sanitizedFlag}${flagValue}`;
		});
};

export const createFieldAssignment = (
	fieldAssignment: FieldAssignment,
): string => {
	// Input validation
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

	// Validate each component
	if (typeof label !== "string" || label.length === 0) {
		throw new TypeError("Field label must be a non-empty string");
	}

	if (typeof type !== "string" || type.length === 0) {
		throw new TypeError("Field type must be a non-empty string");
	}

	if (typeof value !== "string") {
		throw new TypeError("Field value must be a string");
	}

	// Length validation
	if (label.length > 200) {
		throw new Error("Field label too long: maximum 200 characters allowed");
	}

	if (type.length > 50) {
		throw new Error("Field type too long: maximum 50 characters allowed");
	}

	if (value.length > MAX_INPUT_LENGTH) {
		throw new Error(
			`Field value too long: maximum ${MAX_INPUT_LENGTH} characters allowed`,
		);
	}

	let result = `${sanitizeInput(label)}[${sanitizeInput(type)}]=${sanitizeInput(value)}`;

	// Add purpose if provided
	if (purpose !== undefined) {
		if (typeof purpose !== "string" || purpose.length === 0) {
			throw new TypeError("Field purpose must be a non-empty string");
		}

		// Validate that purpose is a valid FieldPurpose value
		if (!validFieldPurposes.includes(purpose)) {
			throw new TypeError(
				`Invalid field purpose: must be one of ${validFieldPurposes.join(", ")}`,
			);
		}
		result += `[${sanitizeInput(purpose)}]`;
	}

	return result;
};

export const buildCommand = (
	subCommand: string[],
	args: Arg[],
	flags: Flags,
	json: boolean,
	cliVersion: string,
	globalFlags: Flags,
	stdin?: string | Record<string, any>,
) => {
	// Input validation
	if (!Array.isArray(subCommand)) {
		throw new TypeError("subCommand must be an array");
	}

	if (!Array.isArray(args)) {
		throw new TypeError("args must be an array");
	}

	if (subCommand.length === 0) {
		throw new Error("subCommand cannot be empty");
	}

	if (subCommand.length > MAX_SUBCOMMAND_PARTS) {
		throw new Error(
			`Too many subcommand parts: maximum ${MAX_SUBCOMMAND_PARTS} allowed`,
		);
	}

	if (args.length > MAX_ARGS_COUNT) {
		throw new Error(`Too many arguments: maximum ${MAX_ARGS_COUNT} allowed`);
	}

	// Validate subcommand parts
	for (const part of subCommand) {
		if (typeof part !== "string" || part.length === 0) {
			throw new TypeError("Subcommand parts must be non-empty strings");
		}
	}

	let input: Buffer | undefined;
	const parts: string[] = [];
	let mergedFlags = { ...(globalFlags || {}), ...flags };

	// Process subcommand parts
	for (const part of subCommand) {
		parts.push(sanitizeInput(part));
	}

	// Process arguments with validation
	for (const arg of args) {
		if (typeof arg === "string") {
			parts.push(sanitizeInput(arg));
		} else if (Array.isArray(arg)) {
			parts.push(createFieldAssignment(arg));
		} else {
			throw new TypeError(
				"Invalid argument: must be string or field assignment array",
			);
		}
	}

	if (json) {
		mergedFlags = { ...mergedFlags, format: "json" };
	}

	// Version >=2.6.2 of the CLI changed how it handled piped input
	// in order to fix an issue with item creation, but in the process
	// it broke piping for other commands. We have a macOS/Linux-only
	// workaround, but not one for Windows, so for now we cannot support
	// the inject command on Windows past this version until the CLI
	// team fixes the issue.
	if (equalArray(subCommand, ["inject"])) {
		const version = semverCoerce(cliVersion);
		if (semverSatisfies(version, ">=2.6.2")) {
			if (process.platform === "win32") {
				throw new ExecutionError(
					"Inject is not supported on Windows for version >=2.6.2 of the CLI",
					1,
				);
			} else {
				mergedFlags = { ...mergedFlags, inFile: "/dev/stdin" };
			}
		}
	}

	parts.push(...createFlags(mergedFlags));

	// Handle stdin input with validation
	if (stdin !== undefined) {
		if (typeof stdin === "string") {
			if (stdin.length > MAX_INPUT_LENGTH) {
				throw new Error(
					`Stdin input too long: maximum ${MAX_INPUT_LENGTH} characters allowed`,
				);
			}
			input = Buffer.from(stdin);
		} else if (typeof stdin === "object" && stdin !== null) {
			try {
				const jsonString = JSON.stringify(stdin);
				if (jsonString.length > MAX_INPUT_LENGTH) {
					throw new Error(
						`Stdin JSON too long: maximum ${MAX_INPUT_LENGTH} characters allowed`,
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

	return { parts, input };
};
