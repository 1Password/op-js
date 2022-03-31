import { cli } from "./cli";

export type FieldAssignmentType =
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

export const setGlobalFlags = (flags: Partial<GlobalFlags>) => {
	cli.globalFlags = flags;
};

export const account = {
	// TODO - Figure out how to handle return type
	// add: (
	// 	flags: CommandFlags<{
	// 		address: string;
	// 		email: string;
	// 		raw: boolean;
	// 		secretKey: string;
	// 		shorthand: string;
	// 		signin: boolean;
	// 	}> = {},
	// ) =>
	// 	cli.execute(["account", "add"], {
	// 		flags,
	// 	}),

	// TODO - Figure out how to handle return type
	// forget: (
	// 	account: string | null,
	// 	flags: CommandFlags<{ all: boolean }> = {},
	// ) =>
	// 	cli.execute(["account", "forget"], {
	// 		args: [account],
	// 		flags,
	// 	}),

	get: (flags: CommandFlags = {}) =>
		cli.execute<{
			id: string;
			name: string;
			domain: string;
			type: string; // TODO: narrow types, e.g. "INDIVIDUAL"
			state: string; // TODO: narrow types, e.g. "ACTIVE"
			created_at: string;
		}>(["account", "get"], {
			flags,
		}),

	list: (flags: CommandFlags = {}) =>
		cli.execute<
			{
				url: string;
				email: string;
				user_uuid: string;
			}[]
		>(["account", "list"], {
			flags,
		}),
};

export const document = {
	// TODO - Figure out how to handle data input (e.g. stdin)
	// create: (flags: CommandFlags = {}) =>
	// 	cli.execute(["document", "create"], {
	// 		flags,
	// 	}),

	delete: (
		nameOrId: string,
		flags: CommandFlags<{ archive: boolean; vault: string }> = {},
	) =>
		cli.execute<void>(["document", "delete"], {
			args: [nameOrId],
			flags,
		}),

	// TODO - Figure out how to handle data input (e.g. stdin)
	// edit: (flags: CommandFlags = {}) =>
	// 	cli.execute(["document", "edit"], {
	// 		flags,
	// 	}),

	get: (
		nameOrId: string,
		flags: CommandFlags<{
			includeArchive: boolean;
			// TODO: Figure out how to handle output path
			// output: string;
			vault: string;
		}> = {},
	) =>
		cli.execute<string>(["document", "get"], {
			args: [nameOrId],
			flags,
			json: false,
		}),

	list: (
		flags: CommandFlags<{
			includeArchive: boolean;
			vault: string;
		}> = {},
	) =>
		cli.execute<
			{
				id: string;
				title: string;
				version: number;
				vault: { id: string };
				"overview.ainfo": string;
				last_edited_by: string;
				created_at: string;
				updated_at: string;
			}[]
		>(["document", "list"], {
			flags,
		}),
};

export const eventsApi = {
	// TODO - This is giving me a 403
	// create: (
	// 	name: string,
	// 	flags: CommandFlags<{
	// 		expiresIn: string;
	// 		features: ("signinattempts" | "itemusages")[];
	// 	}>,
	// ) => cli.execute(["events-api", "create"], { args: [name], flags }),
};
