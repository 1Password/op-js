import { cli, Flags } from "./cli";

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

type CommandFlags<TOptional = Flags, TRequired = Flags> = Partial<
	TOptional & GlobalFlags
> &
	TRequired;

/**
 * Set any of the {@link GlobalFlags} on the CLI command.
 */
export const setGlobalFlags = (flags: Partial<GlobalFlags>) => {
	cli.globalFlags = flags;
};

export const account = {
	// TODO - Figure out how to handle return type
	/**
	 * Add a new 1Password account to sign in to for the first time.
	 */
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

	// TODO - Figure out how to handle return type
	/**
	 * Remove a 1Password account from this device.
	 */
	forget: (
		account: string | null,
		flags: CommandFlags<{ all: boolean }> = {},
	) =>
		cli.execute(["account", "forget"], {
			args: [account],
			flags,
		}),

	/**
	 * Get details about your account.
	 */
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

	/**
	 * List users and accounts set up on this device.
	 */
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
	/**
	 * Create a document item.
	 */
	create: (flags: CommandFlags = {}) =>
		cli.execute(["document", "create"], {
			flags,
		}),

	/**
	 * Permanently delete a document.
	 *
	 * Use {@param archive} to move it to the Archive instead.
	 */
	delete: (
		nameOrId: string,
		flags: CommandFlags<{ archive: boolean; vault: string }> = {},
	) =>
		cli.execute<void>(["document", "delete"], {
			args: [nameOrId],
			flags,
		}),

	// TODO - Figure out how to handle data input (e.g. stdin)
	/**
	 * Update a document.
	 */
	edit: (flags: CommandFlags = {}) =>
		cli.execute(["document", "edit"], {
			flags,
		}),

	/**
	 * Download a document and print the contents.
	 */
	get: (
		nameOrId: string,
		flags: CommandFlags<{
			includeArchive: boolean;
			// TODO: Figure out how to handle output path
			output: string;
			vault: string;
		}> = {},
	) =>
		cli.execute<string>(["document", "get"], {
			args: [nameOrId],
			flags,
			json: false,
		}),

	/**
	 * List documents.
	 */
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
	/**
	 * Create an Events API integration token.
	 */
	create: (
		name: string,
		flags: CommandFlags<{
			expiresIn: string;
			features: ("signinattempts" | "itemusages")[];
		}>,
	) => cli.execute(["events-api", "create"], { args: [name], flags }),
};

export const connect = {
	group: {
		// TODO: Could not test, need to figure out return data type
		/**
		 * Grant a group access to manage Secrets Automation.
		 */
		grant: (
			flags: CommandFlags<
				{
					allServers: boolean;
					server: string;
				},
				{
					group: string;
				}
			>,
		) =>
			cli.execute(["connect", "group", "grant"], {
				flags,
			}),

		/**
		 * Revoke a group's access to manage Secrets Automation.
		 */
		revoke: (
			flags: CommandFlags<
				{
					allServers: boolean;
					server: string;
				},
				{
					group: string;
				}
			>,
		) =>
			cli.execute(["connect", "group", "revoke"], {
				flags,
			}),
	},

	server: {
		/**
		 * Add a 1Password Connect server to your account and generate a credentials file for it.
		 *
		 * Creates a credentials file in the CWD.
		 */
		create: (
			name: string,
			flags: CommandFlags<{
				vaults: string[];
			}> = {},
		) =>
			cli.execute<string>(["connect", "server", "create"], {
				args: [name],
				flags,
				json: false,
			}),

		/**
		 * Remove a Connect server.
		 */
		delete: (nameOrId: string, flags: CommandFlags = {}) =>
			cli.execute<void>(["connect", "server", "delete"], {
				args: [nameOrId],
				flags,
			}),

		/**
		 * Rename a Connect server.
		 */
		edit: (
			nameOrId: string,
			flags: CommandFlags<
				// TODO figure out how to type this correctly
				// eslint-disable-next-line @typescript-eslint/ban-types
				{},
				{
					name: string;
				}
			>,
		) =>
			cli.execute<string>(["connect", "server", "edit"], {
				args: [nameOrId],
				flags,
				json: false,
			}),

		/**
		 * Get details about a Connect server.
		 */
		get: (nameOrId: string, flags: CommandFlags = {}) =>
			cli.execute<{
				id: string;
				name: string;
				state: string; // TODO: narrow types, e.g. "ACTIVE"
				created_at: string;
				creator_id: string;
				tokens_version: number;
			}>(["connect", "server", "get"], {
				args: [nameOrId],
				flags,
			}),

		/**
		 * Get a list of Connect servers.
		 */
		list: (flags: CommandFlags = {}) =>
			cli.execute<
				// TODO: re-use type from get method above
				{
					id: string;
					name: string;
					state: string; // TODO: narrow types, e.g. "ACTIVE"
					created_at: string;
					creator_id: string;
					tokens_version: number;
				}[]
			>(["connect", "server", "list"], {
				flags,
			}),
	},

	token: {
		/**
		 * Issue a new token for a Connect server.
		 */
		create: (
			name: string,
			flags: CommandFlags<
				{
					expiresIn: string;
					vaults: string[];
				},
				{
					server: string;
				}
			>,
		) =>
			cli.execute<string>(["connect", "token", "create"], {
				args: [name],
				flags,
				json: false,
			}),

		/**
		 * Revoke a token for a Connect server.
		 */
		delete: (
			token: string,
			flags: CommandFlags<{
				server: string;
			}> = {},
		) =>
			cli.execute<void>(["connect", "token", "delete"], {
				args: [token],
				flags,
				json: false,
			}),

		/**
		 * Rename a Connect token.
		 */
		edit: (
			token: string,
			flags: CommandFlags<
				{
					server: string;
				},
				{
					name: string;
				}
			>,
		) =>
			cli.execute(["connect", "token", "edit"], {
				args: [token],
				flags,
			}),

		/**
		 * List tokens for Connect servers.
		 */
		list: (
			flags: CommandFlags<{
				server: string;
			}> = {},
		) =>
			cli.execute<
				{
					id: string;
					name: string;
					state: string; // TODO: narrow types, e.g. "ACTIVE"
					issuer: string;
					audience: string;
					features: string[]; // TODO: narrow array types, e.g. "vaultaccess"
					vaults: []; // TODO: what goes in this array?
					created_at: string;
					integration_id: string;
				}[]
			>(["connect", "token", "list"], {
				flags,
			}),
	},

	vault: {
		/**
		 * Grant a Connect server access to a vault.
		 */
		grant: (
			flags: CommandFlags<
				// TODO figure out how to type this correctly
				// eslint-disable-next-line @typescript-eslint/ban-types
				{},
				{
					server: string;
					vault: string;
				}
			>,
		) =>
			cli.execute<void>(["connect", "vault", "grant"], {
				flags,
				json: false,
			}),

		/**
		 * Revoke a Connect server's access to a vault.
		 */
		revoke: (
			flags: CommandFlags<
				// TODO figure out how to type this correctly
				// eslint-disable-next-line @typescript-eslint/ban-types
				{},
				{
					server: string;
					vault: string;
				}
			>,
		) =>
			cli.execute<void>(["connect", "vault", "revoke"], {
				flags,
				json: false,
			}),
	},
};

// TODO: figure out how to incorporate reading to an out-file
// and how we can use the file-mode, force flags
/**
 * Read a secret by secret references.
 */
export const read = (reference: string, flags: CommandFlags = {}) =>
	cli.execute<string>(["read"], { args: [reference], flags, json: false });
