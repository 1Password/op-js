import { cli } from "./cli";

type FieldAssignmentType =
	| "password"
	| "text"
	| "email"
	| "url"
	| "date"
	| "monthYear"
	| "phone"
	// Used for deleting a field
	| "delete";

export type FieldAssignment = [
	field: string,
	type: FieldAssignmentType,
	value: string,
];

export interface GlobalFlags {
	account: string;
	cache: boolean;
	config: string;
	encoding: "utf-8" | "shift_jis" | "gbk";
	isoTimestamps: boolean;
	sessionToken: string;
}

type CommandFlags<T = Record<string, string | boolean>> = Partial<
	T & GlobalFlags
>;

export const setGlobalFlags = (flags: GlobalFlags) => {
	cli.globalFlags = flags;
};

export const account = {
	add: (
		flags: CommandFlags<{
			address: string;
			email: string;
			raw: boolean;
			secretKey: string;
			shorthand: string;
			signin: boolean;
		}> = {},
	) =>
		cli.execute(["account", "add"], {
			flags,
		}),

	forget: (
		account: string | null,
		flags: CommandFlags<{ all: boolean }> = {},
	) =>
		cli.execute(["account", "forget"], {
			args: [account],
			flags,
		}),

	get: (flags: CommandFlags = {}) =>
		cli.execute(["account", "get"], {
			flags,
		}),

	list: (flags: CommandFlags = {}) =>
		cli.execute(["account", "list"], {
			flags,
		}),
};
