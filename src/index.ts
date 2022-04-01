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

export const item = {
	/**
	 * Create an item.
	 */
	create: (
		assignments: FieldAssignment[],
		flags: CommandFlags<{
			category: string; // TODO: narrow types, e.g. "secrets"
			dryRun: boolean;
			generatePassword: string | boolean;
			tags: string[];
			template: string;
			title: string;
			url: string;
			vault: string;
		}> = {},
	) => cli.execute(["item", "create"], { args: assignments, flags }),

	/**
	 * Permanently delete an item.
	 *
	 * Use {@param archive} to move it to the Archive instead.
	 */
	delete: (
		nameOrIdOrLink: string,
		flags: CommandFlags<{
			archive: boolean;
			vault: string;
		}> = {},
	) => cli.execute(["item", "delete"], { args: [nameOrIdOrLink], flags }),

	/**
	 * Edit an item's details.
	 */
	edit: (
		nameOrIdOrLink: string,
		assignments: FieldAssignment[],
		flags: CommandFlags<{
			dryRun: boolean;
			generatePassword: string | boolean;
			tags: string[];
			title: string;
			url: string;
			vault: string;
		}> = {},
	) =>
		cli.execute(["item", "edit"], {
			args: [nameOrIdOrLink, ...assignments],
			flags,
		}),

	/**
	 * Return details about an item.
	 */
	get: (
		nameOrIdOrLink: string,
		flags: CommandFlags<{
			fields: string[]; // TODO this is wrong
			includeArchive: boolean;
			vault: string;
		}> = {},
	) => cli.execute(["item", "get"], { args: [nameOrIdOrLink], flags }),

	/**
	 * Output the primary one-time password for this item.
	 */
	otp: (
		nameOrIdOrLink: string,
		flags: CommandFlags<{
			includeArchive: boolean;
			vault: string;
		}> = {},
	) =>
		cli.execute<string>(["item", "get"], {
			args: [nameOrIdOrLink],
			flags: { ...flags, otp: true },
		}),

	/**
	 * Get a shareable link for the item.
	 */
	shareLink: (
		nameOrIdOrLink: string,
		flags: CommandFlags<{
			includeArchive: boolean;
			vault: string;
		}> = {},
	) =>
		cli.execute<string>(["item", "get"], {
			args: [nameOrIdOrLink],
			flags: { ...flags, shareLink: true },
		}),

	/**
	 * List items.
	 */
	list: (
		flags: CommandFlags<{
			categories: string[]; // TODO: narrow types
			includeArchive: boolean;
			long: boolean;
			tags: string[];
			vault: string;
		}> = {},
	) => cli.execute(["item", "list"], { flags }),

	/**
	 * Share an item.
	 */
	share: (
		nameOrId: string,
		flags: CommandFlags<{
			emails: string[];
			expiry: string;
			vault: string;
			viewOnce: boolean;
		}> = {},
	) => cli.execute(["item", "share"], { args: [nameOrId], flags }),

	template: {
		/**
		 * Return a template for an item type.
		 */
		get: (category: string, flags: CommandFlags = {}) =>
			cli.execute(["item", "template", "get"], { args: [category], flags }),

		/**
		 * Lists available item type templates.
		 */
		list: (flags: CommandFlags = {}) =>
			cli.execute(["item", "template", "list"], { flags }),
	},
};

export const vault = {
	/**
	 * Create a new vault
	 */
	create: (flags: CommandFlags<{}> = {}) => cli.execute(["vault", "create"]),

	/**
	 * Remove a vault.
	 */
	delete: (flags: CommandFlags<{}> = {}) => cli.execute(["vault", "delete"]),

	/**
	 * Edit a vault's name, description, icon or Travel Mode status.
	 */
	edit: (flags: CommandFlags<{}> = {}) => cli.execute(["vault", "edit"]),

	/**
	 * Get details about a vault.
	 */
	get: (flags: CommandFlags<{}> = {}) => cli.execute(["vault", "get"]),

	/**
	 * List vaults.
	 */
	list: (flags: CommandFlags<{}> = {}) => cli.execute(["vault", "list"]),

	group: {
		/**
		 * Grant a group permissions in a vault.
		 */
		grant: (flags: CommandFlags<{}> = {}) =>
			cli.execute(["vault", "group", "grant"]),

		/**
		 * List all the groups that have access to the given vault
		 */
		list: (flags: CommandFlags<{}> = {}) =>
			cli.execute(["vault", "group", "list"]),

		/**
		 * Revoke a group's permissions in a vault, in part or in full
		 */
		revoke: (flags: CommandFlags<{}> = {}) =>
			cli.execute(["vault", "group", "revoke"]),
	},

	user: {
		/**
		 * Grant a user permissions in a vault
		 */
		grant: (flags: CommandFlags<{}> = {}) =>
			cli.execute(["vault", "user", "grant"]),

		/**
		 * List all users with access to the vault and their permissions
		 */
		list: (flags: CommandFlags<{}> = {}) =>
			cli.execute(["vault", "user", "list"]),

		/**
		 * Revoke a user's permissions in a vault, in part or in full
		 */
		revoke: (flags: CommandFlags<{}> = {}) =>
			cli.execute(["vault", "user", "revoke"]),
	},
};

export const user = {
	/**
	 * Confirm users who have accepted their invitation to the 1Password account.
	 */
	confirm: (flags: CommandFlags<{}> = {}) => cli.execute(["user", "confirm"]),

	/**
	 * Remove a user and all their data from the account.
	 */
	delete: (flags: CommandFlags<{}> = {}) => cli.execute(["user", "delete"]),

	/**
	 * Change a user's name or Travel Mode status
	 */
	edit: (flags: CommandFlags<{}> = {}) => cli.execute(["user", "edit"]),

	/**
	 * Get details about a user.
	 */
	get: (flags: CommandFlags<{}> = {}) => cli.execute(["user", "get"]),

	/**
	 * List users.
	 */
	list: (flags: CommandFlags<{}> = {}) => cli.execute(["user", "list"]),

	/**
	 * Provision a user in the authenticated account.
	 */
	provision: (flags: CommandFlags<{}> = {}) =>
		cli.execute(["user", "provision"]),

	/**
	 * Reactivate a suspended user.
	 */
	reactivate: (flags: CommandFlags<{}> = {}) =>
		cli.execute(["user", "reactivate"]),

	/**
	 * Suspend a user.
	 */
	suspend: (flags: CommandFlags<{}> = {}) => cli.execute(["user", "suspend"]),
};

export const group = {
	/**
	 * Create a group.
	 */
	create: (flags: CommandFlags<{}> = {}) => cli.execute(["group", "create"]),

	/**
	 * Remove a group.
	 */
	delete: (flags: CommandFlags<{}> = {}) => cli.execute(["group", "delete"]),

	/**
	 * Change a group's name or description.
	 */
	edit: (flags: CommandFlags<{}> = {}) => cli.execute(["group", "edit"]),

	/**
	 * Get details about a group.
	 */
	get: (flags: CommandFlags<{}> = {}) => cli.execute(["group", "get"]),

	/**
	 * List groups.
	 */
	list: (flags: CommandFlags<{}> = {}) => cli.execute(["group", "list"]),

	user: {
		/**
		 * Grant a user access to a group.
		 */
		grant: (flags: CommandFlags<{}> = {}) =>
			cli.execute(["group", "user", "grant"]),

		/**
		 * Retrieve users that belong to a group.
		 */
		list: (flags: CommandFlags<{}> = {}) =>
			cli.execute(["group", "user", "list"]),

		/**
		 * Revoke a user's access to a vault or group.
		 */
		revoke: (flags: CommandFlags<{}> = {}) =>
			cli.execute(["group", "user", "grant"]),
	},
};
