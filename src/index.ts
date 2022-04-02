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
	create: (
		name: string,
		flags: CommandFlags<{
			allowAdminsToManage: "true" | "false";
			description: string;
			icon:
				| "airplane"
				| "application"
				| "art-supplies"
				| "bankers-box"
				| "brown-briefcase"
				| "brown-gate"
				| "buildings"
				| "cabin"
				| "castle"
				| "circle-of-dots"
				| "coffee"
				| "color-wheel"
				| "curtained-window"
				| "document"
				| "doughnut"
				| "fence"
				| "galaxy"
				| "gears"
				| "globe"
				| "green-backpack"
				| "green-gem"
				| "handshake"
				| "heart-with-monitor"
				| "house"
				| "id-card"
				| "jet"
				| "large-ship"
				| "luggage"
				| "plant"
				| "porthole"
				| "puzzle"
				| "rainbow"
				| "record"
				| "round-door"
				| "sandals"
				| "scales"
				| "screwdriver"
				| "shop"
				| "tall-window"
				| "treasure-chest"
				| "vault-door"
				| "vehicle"
				| "wallet"
				| "wrench";
		}> = {},
	) => cli.execute(["vault", "create"], { args: [name], flags }),

	/**
	 * Remove a vault.
	 */
	delete: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute(["vault", "delete"], { args: [nameOrId], flags }),

	/**
	 * Edit a vault's name, description, icon or Travel Mode status.
	 */
	edit: (
		nameOrId: string,
		flags: CommandFlags<{
			description: string;
			// TODO: move this to a type
			icon:
				| "airplane"
				| "application"
				| "art-supplies"
				| "bankers-box"
				| "brown-briefcase"
				| "brown-gate"
				| "buildings"
				| "cabin"
				| "castle"
				| "circle-of-dots"
				| "coffee"
				| "color-wheel"
				| "curtained-window"
				| "document"
				| "doughnut"
				| "fence"
				| "galaxy"
				| "gears"
				| "globe"
				| "green-backpack"
				| "green-gem"
				| "handshake"
				| "heart-with-monitor"
				| "house"
				| "id-card"
				| "jet"
				| "large-ship"
				| "luggage"
				| "plant"
				| "porthole"
				| "puzzle"
				| "rainbow"
				| "record"
				| "round-door"
				| "sandals"
				| "scales"
				| "screwdriver"
				| "shop"
				| "tall-window"
				| "treasure-chest"
				| "vault-door"
				| "vehicle"
				| "wallet"
				| "wrench";
			name: string;
			travelMode: "on" | "off";
		}> = {},
	) => cli.execute(["vault", "edit"], { args: [nameOrId], flags }),

	/**
	 * Get details about a vault.
	 */
	get: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute(["vault", "get"], { args: [nameOrId], flags }),

	/**
	 * List vaults.
	 */
	list: (
		flags: CommandFlags<{
			group: string;
			user: string;
		}> = {},
	) => cli.execute(["vault", "list"], { flags }),

	group: {
		/**
		 * Grant a group permissions in a vault.
		 */
		grant: (
			flags: CommandFlags<{
				group: string;
				permissions: // Teams have three permissions
				(
					| "allow_viewing"
					| "allow_editing"
					| "allow_managing"
					// Business has the above and more granular options
					| "view_items"
					| "view_and_copy_passwords"
					| "view_item_history"
					| "create_items"
					| "edit_items"
					| "archive_items"
					| "delete_items"
					| "import_items"
					| "export_items"
					| "copy_and_share_items"
					| "print_items"
					| "manage_vault"
				)[];
				vault: string;
			}> = {},
		) => cli.execute(["vault", "group", "grant"], { flags }),

		/**
		 * List all the groups that have access to the given vault
		 */
		list: (vault: string, flags: CommandFlags = {}) =>
			cli.execute(["vault", "group", "list"], { args: [vault], flags }),

		/**
		 * Revoke a group's permissions in a vault, in part or in full
		 */
		revoke: (
			flags: CommandFlags<{
				group: string;
				// TODO: move this to a type
				permissions: // Teams have three permissions
				(
					| "allow_viewing"
					| "allow_editing"
					| "allow_managing"
					// Business has the above and more granular options
					| "view_items"
					| "view_and_copy_passwords"
					| "view_item_history"
					| "create_items"
					| "edit_items"
					| "archive_items"
					| "delete_items"
					| "import_items"
					| "export_items"
					| "copy_and_share_items"
					| "print_items"
					| "manage_vault"
				)[];
				vault: string;
			}> = {},
		) => cli.execute(["vault", "group", "revoke"], { flags }),
	},

	user: {
		/**
		 * Grant a user permissions in a vault
		 */
		grant: (
			flags: CommandFlags<{
				user: string;
				// TODO: move this to a type
				permissions: // Teams have three permissions
				(
					| "allow_viewing"
					| "allow_editing"
					| "allow_managing"
					// Business has the above and more granular options
					| "view_items"
					| "view_and_copy_passwords"
					| "view_item_history"
					| "create_items"
					| "edit_items"
					| "archive_items"
					| "delete_items"
					| "import_items"
					| "export_items"
					| "copy_and_share_items"
					| "print_items"
					| "manage_vault"
				)[];
				vault: string;
			}> = {},
		) => cli.execute(["vault", "user", "grant"], { flags }),

		/**
		 * List all users with access to the vault and their permissions
		 */
		list: (vault: string, flags: CommandFlags = {}) =>
			cli.execute(["vault", "user", "list"], { args: [vault], flags }),

		/**
		 * Revoke a user's permissions in a vault, in part or in full
		 */
		revoke: (
			flags: CommandFlags<{
				user: string;
				// TODO: move this to a type
				permissions: // Teams have three permissions
				(
					| "allow_viewing"
					| "allow_editing"
					| "allow_managing"
					// Business has the above and more granular options
					| "view_items"
					| "view_and_copy_passwords"
					| "view_item_history"
					| "create_items"
					| "edit_items"
					| "archive_items"
					| "delete_items"
					| "import_items"
					| "export_items"
					| "copy_and_share_items"
					| "print_items"
					| "manage_vault"
				)[];
				vault: string;
			}> = {},
		) => cli.execute(["vault", "user", "revoke"], { flags }),
	},
};

export const user = {
	/**
	 * Confirm users who have accepted their invitation to the 1Password account.
	 */
	confirm: (
		emailOrNameOrId: string,
		flags: CommandFlags<{ all: boolean }> = {},
	) => cli.execute(["user", "confirm"], { args: [emailOrNameOrId], flags }),

	/**
	 * Remove a user and all their data from the account.
	 */
	delete: (emailOrNameOrId: string, flags: CommandFlags = {}) =>
		cli.execute(["user", "delete"], { args: [emailOrNameOrId], flags }),

	/**
	 * Change a user's name or Travel Mode status
	 */
	edit: (
		emailOrNameOrId: string,
		flags: CommandFlags<{
			name: string;
			travelMode: "on" | "off";
		}> = {},
	) => cli.execute(["user", "edit"], { args: [emailOrNameOrId], flags }),

	/**
	 * Get details about a user.
	 *
	 * Omit the first param and set the `me` flag to get details about the current user.
	 */
	get: (
		emailOrNameOrId: string | null,
		flags: CommandFlags<{
			fingerprint: boolean;
			publicKey: boolean;
			me: boolean;
		}> = {},
	) => cli.execute(["user", "get"], { args: [emailOrNameOrId], flags }),

	/**
	 * List users.
	 */
	list: (
		flags: CommandFlags<{
			group: string;
			vault: string;
		}> = {},
	) => cli.execute(["user", "list"], { flags }),

	/**
	 * Provision a user in the authenticated account.
	 */
	provision: (
		flags: CommandFlags<{
			email: string;
			language: string;
			name: string;
		}> = {},
	) => cli.execute(["user", "provision"], { flags }),

	/**
	 * Reactivate a suspended user.
	 */
	reactivate: (emailOrNameOrId: string, flags: CommandFlags = {}) =>
		cli.execute(["user", "reactivate"], { args: [emailOrNameOrId], flags }),

	/**
	 * Suspend a user.
	 */
	suspend: (
		emailOrNameOrId: string,
		flags: CommandFlags<{ deauthorizeDevicesAfter: string }> = {},
	) => cli.execute(["user", "suspend"], { args: [emailOrNameOrId], flags }),
};

export const group = {
	/**
	 * Create a group.
	 */
	create: (name: string, flags: CommandFlags<{ description: string }> = {}) =>
		cli.execute(["group", "create"], { args: [name], flags }),

	/**
	 * Remove a group.
	 */
	delete: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute(["group", "delete"], { args: [nameOrId], flags }),

	/**
	 * Change a group's name or description.
	 */
	edit: (
		nameOrId: string,
		flags: CommandFlags<{
			description: string;
			name: string;
		}> = {},
	) => cli.execute(["group", "edit"], { args: [nameOrId], flags }),

	/**
	 * Get details about a group.
	 */
	get: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute(["group", "get"], { args: [nameOrId], flags }),

	/**
	 * List groups.
	 */
	list: (
		flags: CommandFlags<{
			vault: string;
			user: string;
		}> = {},
	) => cli.execute(["group", "list"], { flags }),

	user: {
		/**
		 * Grant a user access to a group.
		 */
		grant: (
			flags: CommandFlags<{
				group: string;
				role: "member" | "manager";
				user: string;
			}> = {},
		) => cli.execute(["group", "user", "grant"], { flags }),

		/**
		 * Retrieve users that belong to a group.
		 */
		list: (group: string, flags: CommandFlags = {}) =>
			cli.execute(["group", "user", "list"], { args: [group], flags }),

		/**
		 * Revoke a user's access to a vault or group.
		 */
		revoke: (
			flags: CommandFlags<{
				group: string;
				user: string;
			}> = {},
		) => cli.execute(["group", "user", "grant"], { flags }),
	},
};
