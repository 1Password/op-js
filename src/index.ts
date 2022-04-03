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

export interface FieldLabelSelector {
	label?: string[];
}
export interface FieldTypeSelector {
	type?: (
		| "address"
		| "concealed"
		| "creditcardnumber"
		| "creditcardtype"
		| "date"
		| "email"
		| "file"
		| "gender"
		| "menu"
		| "monthyear"
		| "otp"
		| "phone"
		| "reference"
		| "string"
		| "url"
	)[];
}

export type VaultIcon =
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

export type VaultPermisson =
	// Teams have three permissions
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
	| "manage_vault";

export type InputCategory =
	| "Email Account"
	| "Medical Record"
	| "Password"
	| "Bank Account"
	| "Membership"
	| "Reward Program"
	| "Credit Card"
	| "Driver License"
	| "Outdoor License"
	| "Passport"
	| "Wireless Router"
	| "Social Security Number"
	| "Software License"
	| "API Credential"
	| "Database"
	| "Document"
	| "Identity"
	| "Login"
	| "Secure Note"
	| "Server";

export type OutputCategory =
	| "EMAIL_ACCOUNT"
	| "MEDICAL_RECORD"
	| "PASSWORD"
	| "BANK_ACCOUNT"
	| "MEMBERSHIP"
	| "REWARD_PROGRAM"
	| "CREDIT_CARD"
	| "DRIVER_LICENSE"
	| "OUTDOOR_LICENSE"
	| "PASSPORT"
	| "WIRELESS_ROUTER"
	| "SOCIAL_SECURITY_NUMBER"
	| "SOFTWARE_LICENSE"
	| "API_CREDENTIAL"
	| "DATABASE"
	| "DOCUMENT"
	| "IDENTITY"
	| "LOGIN"
	| "SECURE_NOTE"
	| "SERVER";

interface Section {
	id: string;
}

interface Field {
	id: string;
	type: string;
	label: string;
	section?: Section;
	tags?: Tags;
}

type ValueField = Field & {
	value: string;
};

type GenericField = ValueField & {
	type:
		| "STRING"
		| "URL"
		| "ADDRESS"
		| "DATE"
		| "MONTH_YEAR"
		| "EMAIL"
		| "PHONE"
		| "REFERENCE";
};

type UsernameField = ValueField & {
	type: "STRING";
	purpose: "USERNAME";
};

type NotesField = ValueField & {
	type: "STRING";
	purpose: "NOTES";
};

type OtpField = ValueField & {
	type: "OTP";
	totp: string;
};

type PasswordField = ValueField & {
	type: "CONCEALED";
	purpose: "PASSWORD";
	entropy: number;
	password_details: {
		entropy: number;
		generated: boolean;
		strength: string; // FIXME: narrow types, e.g. "FANTASTIC"
	};
};

interface File {
	id: string;
	name: string;
	size: number;
	content_path: string;
	section: Section;
}

type Tags = string[];

interface Item {
	id: string;
	title: string;
	version: number;
	vault: {
		id: string;
	};
	category: OutputCategory;
	last_edited_by: string;
	created_at: string;
	updated_at: string;
	sections: Section[];
	fields: (
		| UsernameField
		| PasswordField
		| OtpField
		| NotesField
		| GenericField
	)[];
	files: File[];
	urls: { primary: boolean; href: string }[];
}

export interface GlobalFlags {
	account: string;
	cache: boolean;
	config: string;
	encoding: "utf-8" | "shift_jis" | "gbk";
	isoTimestamps: boolean;
	sessionToken: string;
}

type CommandFlags<
	TOptional extends Flags = {},
	TRequired extends Flags = {},
> = Partial<TOptional & GlobalFlags> & TRequired;

/**
 * Set any of the {@link GlobalFlags} on the CLI command.
 */
export const setGlobalFlags = (flags: Partial<GlobalFlags>) => {
	cli.globalFlags = flags;
};

export const account = {
	/**
	 * Add a new 1Password account to sign in to for the first time.
	 *
	 * FIXME: This cannot yet be implemented from the JS wrapper because it
	 * requires interactive input from the CLI, which we do not support.
	 *
	 * add: (
	 * 	flags: CommandFlags<
	 * 		{
	 * 			raw: boolean;
	 * 			shorthand: string;
	 * 			signin: boolean;
	 * 		},
	 * 		{
	 * 			address: string;
	 * 			email: string;
	 * 			secretKey: string;
	 * 		}
	 * 	>,
	 * ) =>
	 * 	cli.execute<string>(["account", "add"], {
	 * 		flags,
	 * 		json: false,
	 * 	}),
	 */

	/**
	 * Remove a 1Password account from this device.
	 */
	forget: (
		account: string | null,
		flags: CommandFlags<{ all: boolean }> = {},
	) =>
		cli.execute<string>(["account", "forget"], {
			args: [account],
			flags,
			json: false,
		}),

	/**
	 * Get details about your account.
	 */
	get: (flags: CommandFlags = {}) =>
		cli.execute<{
			id: string;
			name: string;
			domain: string;
			type: string; // FIXME: narrow types, e.g. "INDIVIDUAL", 'BUSINESS'
			state: string; // FIXME: narrow types, e.g. "ACTIVE"
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
				shorthand?: string;
			}[]
		>(["account", "list"], {
			flags,
		}),
};

export const document = {
	/**
	 * Create a document item.
	 */
	create: (
		filePath: string,
		flags: CommandFlags<{
			fileName: string;
			tags: Tags;
			title: string;
			vault: string;
		}> = {},
	) =>
		cli.execute<{
			uuid: string;
			createdAt: string;
			updatedAt: string;
			vaultUuid: string;
		}>(["document", "create"], {
			args: [filePath],
			flags,
		}),

	/**
	 * Permanently delete a document.
	 *
	 * Set `archive` to move it to the Archive instead.
	 */
	delete: (
		nameOrId: string,
		flags: CommandFlags<{ archive: boolean; vault: string }> = {},
	) =>
		cli.execute<void>(["document", "delete"], {
			args: [nameOrId],
			flags,
		}),

	/**
	 * Update a document.
	 */
	edit: (
		nameOrId: string,
		filePath: string,
		flags: CommandFlags<{
			fileName: string;
			tags: Tags;
			title: string;
			vault: string;
		}> = {},
	) =>
		cli.execute<void>(["document", "edit"], {
			args: [nameOrId, filePath],
			flags,
		}),

	/**
	 * Download a document and return its contents.
	 */
	get: (
		nameOrId: string,
		flags: CommandFlags<{
			includeArchive: boolean;
			vault: string;
		}> = {},
	) =>
		cli.execute<string>(["document", "get"], {
			args: [nameOrId],
			flags,
			json: false,
		}),

	/**
	 * Download a document and save it to a file.
	 */
	toFile: (
		nameOrId: string,
		outputPath: string,
		flags: CommandFlags<{
			includeArchive: boolean;
			vault: string;
		}> = {},
	) =>
		cli.execute<void>(["document", "get"], {
			args: [nameOrId],
			flags: {
				...flags,
				output: outputPath,
			},
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
				vault: {
					id: string;
				};
				last_edited_by: string;
				created_at: string;
				updated_at: string;
				"overview.ainfo"?: string;
			}[]
		>(["document", "list"], {
			flags,
		}),
};

export const eventsApi = {
	/**
	 * Create an Events API integration token.
	 */
	create: (
		name: string,
		flags: CommandFlags<{
			expiresIn: string;
			features: ("signinattempts" | "itemusages")[];
		}>,
	) =>
		cli.execute<string>(["events-api", "create"], {
			args: [name],
			flags,
			json: false,
		}),
};

export const connect = {
	group: {
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
			cli.execute<void>(["connect", "group", "grant"], {
				flags,
				json: false,
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
			cli.execute<void>(["connect", "group", "revoke"], {
				flags,
				json: false,
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
				state: string; // FIXME: narrow types, e.g. "ACTIVE"
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
				{
					id: string;
					name: string;
					state: string; // FIXME: narrow types, e.g. "ACTIVE"
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
			cli.execute<void>(["connect", "token", "edit"], {
				args: [token],
				flags,
				json: false,
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
					state: string; // FIXME: narrow types, e.g. "ACTIVE"
					issuer: string;
					audience: string;
					features: string[]; // FIXME: narrow array types, e.g. "vaultaccess"
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

export const read = {
	/**
	 * Read a secret by secret reference and return its value
	 */
	parse: (
		reference: string,
		flags: CommandFlags<{ noNewline: boolean }> = {},
	) => cli.execute<string>(["read"], { args: [reference], flags, json: false }),

	/**
	 * Read a secret by secret reference and save it to a file
	 *
	 * Returns the path to the file.
	 */
	toFile: (
		reference: string,
		outputPath: string,
		flags: CommandFlags<{ noNewline: boolean }> = {},
	) =>
		cli.execute<string>(["read"], {
			args: [reference],
			flags: { ...flags, outFile: outputPath },
			json: false,
		}),
};

export const item = {
	/**
	 * Create an item.
	 */
	create: (
		assignments: FieldAssignment[],
		flags: CommandFlags<{
			category: InputCategory;
			dryRun: boolean;
			generatePassword: string | boolean;
			tags: Tags;
			template: string;
			title: string;
			url: string;
			vault: string;
		}> = {},
	) => cli.execute<Item>(["item", "create"], { args: assignments, flags }),

	/**
	 * Permanently delete an item.
	 *
	 * Set `archive` to move it to the Archive instead.
	 */
	delete: (
		nameOrIdOrLink: string,
		flags: CommandFlags<{
			archive: boolean;
			vault: string;
		}> = {},
	) =>
		cli.execute<void>(["item", "delete"], {
			args: [nameOrIdOrLink],
			flags,
			json: false,
		}),

	/**
	 * Edit an item's details.
	 */
	edit: (
		nameOrIdOrLink: string,
		assignments: FieldAssignment[],
		flags: CommandFlags<{
			dryRun: boolean;
			generatePassword: string | boolean;
			tags: Tags;
			title: string;
			url: string;
			vault: string;
		}> = {},
	) =>
		cli.execute<Item>(["item", "edit"], {
			args: [nameOrIdOrLink, ...assignments],
			flags,
		}),

	/**
	 * Return details about an item.
	 */
	get: (
		nameOrIdOrLink: string,
		flags: CommandFlags<{
			fields: FieldLabelSelector | FieldTypeSelector;
			includeArchive: boolean;
			vault: string;
		}> = {},
	) => cli.execute<Item>(["item", "get"], { args: [nameOrIdOrLink], flags }),

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
			json: false,
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
			json: false,
		}),

	/**
	 * List items.
	 */
	list: (
		flags: CommandFlags<{
			categories: InputCategory[];
			includeArchive: boolean;
			long: boolean;
			tags: Tags;
			vault: string;
		}> = {},
	) =>
		cli.execute<
			{
				id: string;
				title: string;
				version: 1;
				tags?: Tags;
				vault: { id: string };
				category: OutputCategory;
				last_edited_by: string;
				created_at: string;
				updated_at: string;
			}[]
		>(["item", "list"], { flags }),

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
	) =>
		cli.execute<string>(["item", "share"], {
			args: [nameOrId],
			flags,
			json: false,
		}),

	template: {
		/**
		 * Return a template for an item type.
		 */
		get: (category: InputCategory, flags: CommandFlags = {}) =>
			cli.execute<
				{
					title: string;
					vault: {
						id: string;
					};
					category: OutputCategory;
					fields: (
						| UsernameField
						| PasswordField
						| OtpField
						| NotesField
						| GenericField
					)[];
				}[]
			>(["item", "template", "get"], { args: [category], flags }),

		/**
		 * Lists available item type templates.
		 */
		list: (flags: CommandFlags = {}) =>
			cli.execute<{ uuid: string; name: string }[]>(
				["item", "template", "list"],
				{ flags },
			),
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
			icon: VaultIcon;
		}> = {},
	) =>
		cli.execute<{
			id: string;
			name: string;
			attribute_version: number;
			content_version: number;
			type: string; // FIXME: narrow types, e.g. "PERSONAL"
			created_at: string;
			updated_at: string;
		}>(["vault", "create"], { args: [name], flags }),

	/**
	 * Remove a vault.
	 */
	delete: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<string>(["vault", "delete"], {
			args: [nameOrId],
			flags,
			json: false,
		}),

	/**
	 * Edit a vault's name, description, icon or Travel Mode status.
	 */
	edit: (
		nameOrId: string,
		flags: CommandFlags<{
			description: string;
			icon: VaultIcon;
			name: string;
			travelMode: "on" | "off";
		}> = {},
	) =>
		cli.execute<string>(["vault", "edit"], {
			args: [nameOrId],
			flags,
			json: false,
		}),

	/**
	 * Get details about a vault.
	 */
	get: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<{
			id: string;
			name: string;
			attribute_version: number;
			content_version: number;
			items: number;
			type: string; // FIXME: narrow types, e.g. "PERSONAL"
			created_at: string;
			updated_at: string;
		}>(["vault", "get"], { args: [nameOrId], flags }),

	/**
	 * List vaults.
	 */
	list: (
		flags: CommandFlags<{
			group: string;
			user: string;
		}> = {},
	) =>
		cli.execute<{ id: string; name: string }[]>(["vault", "list"], { flags }),

	group: {
		/**
		 * Grant a group permissions in a vault.
		 */
		grant: (
			flags: CommandFlags<{
				group: string;
				permissions: VaultPermisson[];
				vault: string;
			}> = {},
		) =>
			cli.execute<{
				vault_id: string;
				vault_name: string;
				group_id: string;
				group_name: string;
				permissions: string;
			}>(["vault", "group", "grant"], { flags }),

		/**
		 * List all the groups that have access to the given vault
		 */
		list: (vault: string, flags: CommandFlags = {}) =>
			cli.execute<
				{
					id: string;
					name: string;
					description: string;
					state: string; // FIXME: narrow types, e.g. "ACTIVE"
					created_at: string;
					permissions: VaultPermisson[];
				}[]
			>(["vault", "group", "list"], { args: [vault], flags }),

		/**
		 * Revoke a group's permissions in a vault, in part or in full
		 */
		revoke: (
			flags: CommandFlags<{
				group: string;
				permissions: VaultPermisson[];
				vault: string;
			}> = {},
		) =>
			cli.execute<{
				vault_id: string;
				vault_name: string;
				group_id: string;
				group_name: string;
				permissions: string;
			}>(["vault", "group", "revoke"], { flags }),
	},

	user: {
		/**
		 * Grant a user permissions in a vault
		 */
		grant: (
			flags: CommandFlags<{
				user: string;
				permissions: VaultPermisson[];
				vault: string;
			}> = {},
		) =>
			cli.execute<{
				vault_id: string;
				vault_name: string;
				user_id: string;
				user_email: string;
				permissions: string;
			}>(["vault", "user", "grant"], { flags }),

		/**
		 * List all users with access to the vault and their permissions
		 */
		list: (vault: string, flags: CommandFlags = {}) =>
			cli.execute<
				{
					id: string;
					name: string;
					email: string;
					type: string; // FIXME: narrow types, e.g. "MEMBER"
					state: string; // FIXME: narrow types, e.g. "ACTIVE"
					permissions: VaultPermisson[];
				}[]
			>(["vault", "user", "list"], { args: [vault], flags }),

		/**
		 * Revoke a user's permissions in a vault, in part or in full
		 */
		revoke: (
			flags: CommandFlags<{
				user: string;
				permissions: VaultPermisson[];
				vault: string;
			}> = {},
		) =>
			cli.execute<{
				vault_id: string;
				vault_name: string;
				user_id: string;
				user_email: string;
				permissions: string;
			}>(["vault", "user", "revoke"], { flags }),
	},
};

export const user = {
	/**
	 * Confirm users who have accepted their invitation to the 1Password account.
	 */
	confirm: (
		emailOrNameOrId: string,
		flags: CommandFlags<{ all: boolean }> = {},
	) =>
		cli.execute<void>(["user", "confirm"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		}),

	/**
	 * Remove a user and all their data from the account.
	 */
	delete: (emailOrNameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<void>(["user", "delete"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		}),

	/**
	 * Change a user's name or Travel Mode status
	 */
	edit: (
		emailOrNameOrId: string,
		flags: CommandFlags<{
			name: string;
			travelMode: "on" | "off";
		}> = {},
	) =>
		cli.execute<void>(["user", "edit"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		}),

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
	) =>
		cli.execute<{
			id: string;
			name: string;
			email: string;
			type: string; // FIXME: narrow types, e.g. "MEMBER"
			state: string; // FIXME: narrow types, e.g. "TRANSFER_PENDING" "TRANSFER_ACCEPTED" "TRANSFER_STARTED"
			created_at: string;
			updated_at: string;
			last_auth_at: string;
		}>(["user", "get"], { args: [emailOrNameOrId], flags }),

	/**
	 * List users.
	 */
	list: (
		flags: CommandFlags<{
			group: string;
			vault: string;
		}> = {},
	) =>
		cli.execute<{
			id: string;
			name: string;
			email: string;
			type: string; // FIXME: narrow types, e.g. "MEMBER"
			state: string; // FIXME: narrow types, e.g. "ACTIVE"
		}>(["user", "list"], { flags }),

	/**
	 * Provision a user in the authenticated account.
	 */
	invite: (
		flags: CommandFlags<
			{
				language: string;
			},
			{
				email: string;
				name: string;
			}
		>,
	) =>
		cli.execute<{
			id: string;
			name: string;
			email: string;
			type: string; // FIXME: narrow types, e.g. "MEMBER"
			state: string; // FIXME: narrow types, e.g. "TRANSFER_PENDING" "TRANSFER_ACCEPTED" "TRANSFER_STARTED"
			created_at: string;
			updated_at: string;
			last_auth_at: string;
		}>(["user", "invite"], { flags }),

	/**
	 * Reactivate a suspended user.
	 */
	reactivate: (emailOrNameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<void>(["user", "reactivate"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		}),

	/**
	 * Suspend a user.
	 */
	suspend: (
		emailOrNameOrId: string,
		flags: CommandFlags<{ deauthorizeDevicesAfter: string }> = {},
	) =>
		cli.execute<void>(["user", "suspend"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		}),
};

export const group = {
	/**
	 * Create a group.
	 */
	create: (name: string, flags: CommandFlags<{ description: string }> = {}) =>
		cli.execute<{
			id: string;
			name: string;
			state: string; // FIXME: narrow types, e.g. "ACTIVE"
			created_at: string;
			updated_at: string;
			type: string; // FIXME: narrow types, e.g. "USER_DEFINED"
		}>(["group", "create"], { args: [name], flags }),

	/**
	 * Remove a group.
	 */
	delete: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<void>(["group", "delete"], {
			args: [nameOrId],
			flags,
			json: false,
		}),

	/**
	 * Change a group's name or description.
	 */
	edit: (
		nameOrId: string,
		flags: CommandFlags<{
			description: string;
			name: string;
		}> = {},
	) =>
		cli.execute<void>(["group", "edit"], {
			args: [nameOrId],
			flags,
			json: false,
		}),

	/**
	 * Get details about a group.
	 */
	get: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<{
			id: string;
			name: string;
			description: string;
			state: string; // FIXME: narrow types, e.g. "ACTIVE"
			created_at: string;
			updated_at: string;
			type: string; // FIXME: narrow types, e.g. "USER_DEFINED"
		}>(["group", "get"], { args: [nameOrId], flags }),

	/**
	 * List groups.
	 */
	list: (
		flags: CommandFlags<{
			vault: string;
			user: string;
		}> = {},
	) =>
		cli.execute<
			{
				id: string;
				name: string;
				description: string;
				state: string; // FIXME: narrow types, e.g. "ACTIVE"
				created_at: string;
			}[]
		>(["group", "list"], { flags }),

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
		) => cli.execute<void>(["group", "user", "grant"], { flags, json: false }),

		/**
		 * Retrieve users that belong to a group.
		 */
		list: (group: string, flags: CommandFlags = {}) =>
			cli.execute<
				{
					id: string;
					name: string;
					email: string;
					type: string; // FIXME: narrow types, e.g. "MEMBER"
					state: string; // FIXME: narrow types, e.g. "ACTIVE"
					role: string; // FIXME: narrow types, e.g. "MANAGER"
				}[]
			>(["group", "user", "list"], { args: [group], flags }),

		/**
		 * Revoke a user's access to a vault or group.
		 */
		revoke: (
			flags: CommandFlags<{
				group: string;
				user: string;
			}> = {},
		) => cli.execute<void>(["group", "user", "grant"], { flags, json: false }),
	},
};
