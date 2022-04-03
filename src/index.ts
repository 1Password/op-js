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

export type AccountType =
	| "BUSINESS"
	| "TEAM"
	| "FAMILY"
	| "INDIVIDUAL"
	| "UNKNOWN";

export type AccountState =
	| "REGISTERED"
	| "ACTIVE"
	| "SUSPENDED"
	| "DELETED"
	| "PURGING"
	| "PURGED"
	| "UNKNOWN";

export type UserType = "MEMBER" | "GUEST" | "SERVICE_ACCOUNT" | "UNKNOWN";

export type UserState =
	| "ACTIVE"
	| "PENDING"
	| "DELETED"
	| "SUSPENDED"
	| "RECOVERY_STARTED"
	| "RECOVERY_ACCEPTED"
	| "TRANSFER_PENDING"
	| "TRANSFER_STARTED"
	| "TRANSFER_ACCEPTED"
	| "EMAIL_VERIFIED_BUT_REGISTRATION_INCOMPLETE"
	| "TEAM_REGISTRATION_INITIATED"
	| "UNKNOWN";

export type PasswordStrength =
	| "TERRIBLE"
	| "WEAK"
	| "FAIR"
	| "GOOD"
	| "VERY_GOOD"
	| "EXCELLENT"
	| "FANTASTIC";

export type VaultType =
	| "PERSONAL"
	| "EVERYONE"
	| "TRANSFER"
	| "USER_CREATED"
	| "UNKNOWN";

export type UserRole = "MEMBER" | "MANAGER";

export type GroupState = "ACTIVE" | "DELETED" | "INACTIVE";

export type GroupType =
	| "ADMINISTRATORS"
	| "OWNERS"
	| "RECOVERY"
	| "TEAM_MEMBERS"
	| "USER_DEFINED"
	| "UNKNOWN_TYPE";

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
		strength: PasswordStrength;
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
	encoding:
		| "utf-8"
		| "shift-jis"
		| "shiftjis"
		| "sjis"
		| "s-jis"
		| "shift_jis"
		| "s_jis"
		| "gbk";
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

export const version = () =>
	cli.execute<string>([], { flags: { version: true }, json: false });

export const account = {
	/**
	 * Add a new 1Password account to sign in to for the first time.
	 *
	 * TODO: This cannot yet be implemented from the JS wrapper because it
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/account#account-forget}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/account#account-get}
	 */
	get: (flags: CommandFlags = {}) =>
		cli.execute<{
			id: string;
			name: string;
			domain: string;
			type: AccountType;
			state: AccountState;
			created_at: string;
		}>(["account", "get"], {
			flags,
		}),

	/**
	 * List users and accounts set up on this device.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/account#account-list}
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
	 * Create a document item with data or a file on disk.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-create}
	 */
	create: (
		dataOrFile: string,
		flags: CommandFlags<{
			fileName: string;
			tags: Tags;
			title: string;
			vault: string;
		}> = {},
		fromFile = false,
	) =>
		cli.execute<{
			uuid: string;
			createdAt: string;
			updatedAt: string;
			vaultUuid: string;
		}>(["document", "create"], {
			args: [fromFile ? dataOrFile : "-"],
			flags,
			stdin: fromFile ? "" : dataOrFile,
		}),

	/**
	 * Permanently delete a document.
	 *
	 * Set `archive` to move it to the Archive instead.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-delete}
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
	 *
	 * Replaces the file contents with the provided file path or data.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-edit}
	 */
	edit: (
		nameOrId: string,
		dataOrFile: string,
		flags: CommandFlags<{
			fileName: string;
			tags: Tags;
			title: string;
			vault: string;
		}> = {},
		fromFile = false,
	) =>
		cli.execute<void>(["document", "edit"], {
			args: [nameOrId, fromFile ? dataOrFile : "-"],
			flags,
			stdin: fromFile ? "" : dataOrFile,
		}),

	/**
	 * Download a document and return its contents.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-get}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-get}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-list}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/events-api#subcommands}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-group-grant}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-group-revoke}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-create}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-delete}
		 */
		delete: (nameOrId: string, flags: CommandFlags = {}) =>
			cli.execute<void>(["connect", "server", "delete"], {
				args: [nameOrId],
				flags,
			}),

		/**
		 * Rename a Connect server.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-edit}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-get}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-list}
		 */
		list: (flags: CommandFlags = {}) =>
			cli.execute<
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-token-create}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-token-delete}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-token-edit}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-token-list}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-vault-grant}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-vault-revoke}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/read}
	 */
	parse: (
		reference: string,
		flags: CommandFlags<{ noNewline: boolean }> = {},
	) => cli.execute<string>(["read"], { args: [reference], flags, json: false }),

	/**
	 * Read a secret by secret reference and save it to a file
	 *
	 * Returns the path to the file.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/read}
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

export const inject = (
	dataOrFile: string,
	flags: CommandFlags<{
		outFile: string;
		fileMode: string;
		force: boolean;
	}> = {},
	fromFile = false,
) =>
	cli.execute<string | void>(["inject"], {
		flags: { ...flags, inFile: fromFile ? dataOrFile : undefined },
		json: false,
		stdin: fromFile ? "" : dataOrFile,
	});

export const item = {
	/**
	 * Create an item.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-create}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-delete}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-edit}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-get}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-get}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-get}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-list}
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
				version: number;
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-share}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item/#item-template-get}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item/#item-template-list}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-create}
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
			type: VaultType;
			created_at: string;
			updated_at: string;
		}>(["vault", "create"], { args: [name], flags }),

	/**
	 * Remove a vault.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-delete}
	 */
	delete: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<string>(["vault", "delete"], {
			args: [nameOrId],
			flags,
			json: false,
		}),

	/**
	 * Edit a vault's name, description, icon or Travel Mode status.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-edit}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-get}
	 */
	get: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<{
			id: string;
			name: string;
			attribute_version: number;
			content_version: number;
			items: number;
			type: VaultType;
			created_at: string;
			updated_at: string;
		}>(["vault", "get"], { args: [nameOrId], flags }),

	/**
	 * List vaults.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-list}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-group-grant}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-group-list}
		 */
		list: (vault: string, flags: CommandFlags = {}) =>
			cli.execute<
				{
					id: string;
					name: string;
					description: string;
					state: string; // TODO: narrow types, e.g. "ACTIVE"
					created_at: string;
					permissions: VaultPermisson[];
				}[]
			>(["vault", "group", "list"], { args: [vault], flags }),

		/**
		 * Revoke a group's permissions in a vault, in part or in full
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-group-revoke}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-user-grant}
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
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-user-list}
		 */
		list: (vault: string, flags: CommandFlags = {}) =>
			cli.execute<
				{
					id: string;
					name: string;
					email: string;
					type: UserRole;
					state: UserState;
					permissions: VaultPermisson[];
				}[]
			>(["vault", "user", "list"], { args: [vault], flags }),

		/**
		 * Revoke a user's permissions in a vault, in part or in full
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-user-revoke}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-confirm}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-delete}
	 */
	delete: (emailOrNameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<void>(["user", "delete"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		}),

	/**
	 * Change a user's name or Travel Mode status
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-edit}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
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
			type: UserType;
			state: UserState;
			created_at: string;
			updated_at: string;
			last_auth_at: string;
		}>(["user", "get"], { args: [emailOrNameOrId], flags }),

	/**
	 * List users.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-list}
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
			type: UserType;
			state: UserState;
		}>(["user", "list"], { flags }),

	/**
	 * Provision a user in the authenticated account.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-invite}
	 */
	provision: (
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
			type: UserType;
			state: UserState;
			created_at: string;
			updated_at: string;
			last_auth_at: string;
		}>(["user", "provision"], { flags }),

	/**
	 * Reactivate a suspended user.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-reactivate}
	 */
	reactivate: (emailOrNameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<void>(["user", "reactivate"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		}),

	/**
	 * Suspend a user.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-suspend}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-create}
	 */
	create: (name: string, flags: CommandFlags<{ description: string }> = {}) =>
		cli.execute<{
			id: string;
			name: string;
			state: GroupState;
			created_at: string;
			updated_at: string;
			type: GroupType;
		}>(["group", "create"], { args: [name], flags }),

	/**
	 * Remove a group.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-delete}
	 */
	delete: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<void>(["group", "delete"], {
			args: [nameOrId],
			flags,
			json: false,
		}),

	/**
	 * Change a group's name or description.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-edit}
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
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-get}
	 */
	get: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<{
			id: string;
			name: string;
			description: string;
			state: GroupState;
			created_at: string;
			updated_at: string;
			type: GroupType;
		}>(["group", "get"], { args: [nameOrId], flags }),

	/**
	 * List groups.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-list}
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
				state: GroupState;
				created_at: string;
			}[]
		>(["group", "list"], { flags }),

	user: {
		/**
		 * Grant a user access to a group.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-user-grant}
		 */
		grant: (
			flags: CommandFlags<{
				group: string;
				role: UserRole;
				user: string;
			}> = {},
		) => cli.execute<void>(["group", "user", "grant"], { flags, json: false }),

		/**
		 * Retrieve users that belong to a group.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-user-list}
		 */
		list: (group: string, flags: CommandFlags = {}) =>
			cli.execute<
				{
					id: string;
					name: string;
					email: string;
					type: UserType;
					state: UserState;
					role: UserRole;
				}[]
			>(["group", "user", "list"], { args: [group], flags }),

		/**
		 * Revoke a user's access to a vault or group.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-user-revoke}
		 */
		revoke: (
			flags: CommandFlags<{
				group: string;
				user: string;
			}> = {},
		) => cli.execute<void>(["group", "user", "grant"], { flags, json: false }),
	},
};
