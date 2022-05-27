import { cli, Flags } from "./cli";

type CommandFlags<TOptional extends Flags = {}> = Partial<
	TOptional & GlobalFlags
>;

// Section: Global Flags

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

/**
 * Set any of the {@link GlobalFlags} on the CLI command.
 */
export const setGlobalFlags = (flags: Partial<GlobalFlags>) => {
	cli.globalFlags = flags;
};

// Section: CLI setup

/**
 * Validate that the user's CLI setup is valid for this wrapper.
 */
export const validateCli = async (requiredVersion?: string) =>
	await cli.validate(requiredVersion);

/**
 * Retrieve the current version of the CLI.
 */
export const version = () => cli.getVersion();

// Section: Secret Injection

export const inject = {
	/**
	 * Inject secrets into and return the data
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/inject}
	 */
	data: (input: string, flags: CommandFlags<{}> = {}) =>
		cli.execute<string>(["inject"], {
			flags,
			json: false,
			stdin: input,
		}),

	/**
	 * Inject secrets into data and write the result to a file
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/inject}
	 */
	toFile: (
		input: string,
		outFile: string,
		flags: CommandFlags<{
			fileMode: string;
			force: boolean;
		}> = {},
	) =>
		cli.execute<void>(["inject"], {
			flags: { ...flags, outFile },
			json: false,
			stdin: input,
		}),
};

// Section: Reading Secret References

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

// Section: Accounts

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

export interface Account {
	id: string;
	name: string;
	domain: string;
	type: AccountType;
	state: AccountState;
	created_at: string;
}

export interface ListAccount {
	url: string;
	email: string;
	user_uuid: string;
	account_uuid: string;
	shorthand?: string;
}

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
		cli.execute<Account>(["account", "get"], {
			flags,
		}),

	/**
	 * List users and accounts set up on this device.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/account#account-list}
	 */
	list: (flags: CommandFlags = {}) =>
		cli.execute<ListAccount[]>(["account", "list"], {
			flags,
		}),
};

// Section: Documents

export interface Document {
	id: string;
	title: string;
	version: number;
	vault: {
		id: string;
		name: string;
	};
	last_edited_by: string;
	created_at: string;
	updated_at: string;
	"overview.ainfo"?: string;
}

export interface CreatedDocument {
	uuid: string;
	createdAt: string;
	updatedAt: string;
	vaultUuid: string;
}

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
			tags: string[];
			title: string;
			vault: string;
		}> = {},
		fromFile = false,
	) =>
		cli.execute<CreatedDocument>(["document", "create"], {
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
			tags: string[];
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
		cli.execute<Document[]>(["document", "list"], {
			flags,
		}),
};

// Section: Events API

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
		}> = {},
	) =>
		cli.execute<string>(["events-api", "create"], {
			args: [name],
			flags,
			json: false,
		}),
};

// Section: Connect

export type ConnectServerState = "ACTIVE" | "REVOKED";

export interface VaultClaim {
	id: string;
	acl: VaultPermisson[];
}

export interface ConnectServer {
	id: string;
	name: string;
	state: UserState;
	created_at: string;
	creator_id: string;
	tokens_version: number;
}

export interface ConnectServerToken {
	id: string;
	name: string;
	state: ConnectServerState;
	issuer: string;
	audience: string;
	features: string[];
	vaults: VaultClaim[];
	created_at: string;
	integration_id: string;
}

export const connect = {
	group: {
		/**
		 * Grant a group access to manage Secrets Automation.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-group-grant}
		 */
		grant: (
			group: string,
			flags: CommandFlags<{
				allServers: boolean;
				server: string;
			}> = {},
		) =>
			cli.execute<void>(["connect", "group", "grant"], {
				flags: { ...flags, group },
				json: false,
			}),

		/**
		 * Revoke a group's access to manage Secrets Automation.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-group-revoke}
		 */
		revoke: (
			group: string,
			flags: CommandFlags<{
				allServers: boolean;
				server: string;
			}> = {},
		) =>
			cli.execute<void>(["connect", "group", "revoke"], {
				flags: { ...flags, group },
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
		edit: (nameOrId: string, newName: string, flags: CommandFlags<{}> = {}) =>
			cli.execute<string>(["connect", "server", "edit"], {
				args: [nameOrId],
				flags: { name: newName, ...flags },
				json: false,
			}),

		/**
		 * Get details about a Connect server.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-get}
		 */
		get: (nameOrId: string, flags: CommandFlags = {}) =>
			cli.execute<ConnectServer>(["connect", "server", "get"], {
				args: [nameOrId],
				flags,
			}),

		/**
		 * Get a list of Connect servers.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-list}
		 */
		list: (flags: CommandFlags = {}) =>
			cli.execute<ConnectServer[]>(["connect", "server", "list"], {
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
			server: string,
			flags: CommandFlags<{
				expiresIn: string;
				vaults: string[];
			}> = {},
		) =>
			cli.execute<string>(["connect", "token", "create"], {
				args: [name],
				flags: { server, ...flags },
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
			newName: string,
			flags: CommandFlags<{
				server: string;
			}> = {},
		) =>
			cli.execute<void>(["connect", "token", "edit"], {
				args: [token],
				flags: { name: newName, ...flags },
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
			cli.execute<ConnectServerToken[]>(["connect", "token", "list"], {
				flags,
			}),
	},

	vault: {
		/**
		 * Grant a Connect server access to a vault.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-vault-grant}
		 */
		grant: (server: string, vault: string, flags: CommandFlags<{}> = {}) =>
			cli.execute<void>(["connect", "vault", "grant"], {
				flags: { server, vault, ...flags },
				json: false,
			}),

		/**
		 * Revoke a Connect server's access to a vault.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-vault-revoke}
		 */
		revoke: (server: string, vault: string, flags: CommandFlags<{}> = {}) =>
			cli.execute<void>(["connect", "vault", "revoke"], {
				flags: { server, vault, ...flags },
				json: false,
			}),
	},
};

// Section: Items
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
	| "Server"
	// Disabled until CLI gets this category
	// | "Crypto Wallet"
	| "SSH Key";

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
	| "SERVER"
	// Disabled until CLI gets this category
	// | "CRYPTO_WALLET"
	| "SSH_KEY";

export type PasswordStrength =
	| "TERRIBLE"
	| "WEAK"
	| "FAIR"
	| "GOOD"
	| "VERY_GOOD"
	| "EXCELLENT"
	| "FANTASTIC";

// These are the possible field types you can
// use to *create* an item
export type FieldAssignmentType =
	| "concealed"
	| "text"
	| "email"
	| "url"
	| "date"
	| "monthYear"
	| "phone"
	// Used for deleting a field
	| "delete";

// These are the possible field types you can
// use when querying fields by type
export type QueryFieldType =
	| "string"
	| "concealed"
	| "date"
	| "phone"
	| "address"
	| "URL"
	| "email"
	| "monthYear"
	| "gender"
	| "cctype"
	| "ccnum"
	| "reference"
	| "menu"
	| "month"
	| "OTP"
	| "file"
	| "sshKey";

// These are the possible field types that can be
// returned on a item's field
export type ResponseFieldType =
	| "UNKNOWN"
	| "ADDRESS"
	| "CONCEALED"
	| "CREDIT_CARD_NUMBER"
	| "CREDIT_CARD_TYPE"
	| "DATE"
	| "EMAIL"
	| "GENDER"
	| "MENU"
	| "MONTH_YEAR"
	| "OTP"
	| "PHONE"
	| "REFERENCE"
	| "STRING"
	| "URL"
	| "FILE"
	| "SSHKEY";

export type FieldPurpose = "USERNAME" | "PASSWORD" | "NOTE";

export type FieldAssignment = [
	label: string,
	type: FieldAssignmentType,
	value: string,
	purpose?: FieldPurpose,
];

export interface FieldLabelSelector {
	label?: string[];
}
export interface FieldTypeSelector {
	type?: QueryFieldType[];
}

export interface Section {
	id: string;
}

interface BaseField {
	id: string;
	type: ResponseFieldType;
	label: string;
	reference?: string;
	section?: Section;
	tags?: string[];
}

export type ValueField = BaseField & {
	value: string;
};

export type GenericField = ValueField & {
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

export type UsernameField = ValueField & {
	type: "STRING";
	purpose: "USERNAME";
};

export type NotesField = ValueField & {
	type: "STRING";
	purpose: "NOTES";
};

export type OtpField = ValueField & {
	type: "OTP";
	totp: string;
};

export type PasswordField = ValueField & {
	type: "CONCEALED";
	purpose: "PASSWORD";
	entropy: number;
	password_details: {
		entropy: number;
		generated: boolean;
		strength: PasswordStrength;
	};
};

export interface File {
	id: string;
	name: string;
	size: number;
	content_path: string;
	section: Section;
}

export interface URL {
	label?: string;
	primary: boolean;
	href: string;
}

export type Field =
	| UsernameField
	| PasswordField
	| OtpField
	| NotesField
	| GenericField;

export interface Item {
	id: string;
	title: string;
	version?: number;
	vault: {
		id: string;
		name: string;
	};
	category: OutputCategory;
	last_edited_by?: string;
	created_at: string;
	updated_at: string;
	additional_information?: string;
	sections?: Section[];
	tags?: string[];
	fields?: Field[];
	files?: File[];
	urls?: URL[];
}

export interface ItemTemplate {
	title: string;
	vault: {
		id: string;
	};
	category: OutputCategory;
	fields: Field[];
}

export interface ListItemTemplate {
	uuid: string;
	name: string;
}

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
			tags: string[];
			template: string;
			title: string;
			url: string;
			vault: string;
		}> = {},
	) => {
		const { category, ...otherFlags } = flags;

		return cli.execute<Item>(["item", "create"], {
			args: ["-"],
			// @ts-expect-error - Temporary fix
			flags: otherFlags,
			// NOTE: There is an issue in the CLI that prevents us from using field assignments
			// in `item create` through Node. I don't know what it is or why it's so specific,
			// but until then we will need to pipe in the fields as a JSON object. This does not
			// appear to impact `item edit`.
			stdin: JSON.stringify({
				category: category.toUpperCase(),
				fields: assignments.map(([label, type, value, purpose]) => {
					const data = {
						label,
						type,
						value,
					};

					if (purpose) {
						Object.assign(data, { purpose });
					}

					return data;
				}),
			}),
		});
	},

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
			tags: string[];
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
			tags: string[];
			vault: string;
		}> = {},
	) => cli.execute<Item[]>(["item", "list"], { flags }),

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
			cli.execute<ItemTemplate[]>(["item", "template", "get"], {
				args: [category],
				flags,
			}),

		/**
		 * Lists available item type templates.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item/#item-template-list}
		 */
		list: (flags: CommandFlags = {}) =>
			cli.execute<ListItemTemplate[]>(["item", "template", "list"], { flags }),
	},
};

// Section: Vaults

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

export type VaultType =
	| "PERSONAL"
	| "EVERYONE"
	| "TRANSFER"
	| "USER_CREATED"
	| "UNKNOWN";

export interface Vault {
	id: string;
	name: string;
	attribute_version: number;
	content_version: number;
	type: VaultType;
	created_at: string;
	updated_at: string;
	items?: number;
}

export type AbbreviatedVault = Pick<Vault, "id" | "name">;

interface VaultAccess {
	vault_id: string;
	vault_name: string;
	permissions: string;
}

export type VaultUserAccess = VaultAccess & {
	user_id: string;
	user_email: string;
};

export type VaultGroupAccess = VaultAccess & {
	group_id: string;
	group_name: string;
};

export interface VaultGroup {
	id: string;
	name: string;
	description: string;
	state: GroupState;
	created_at: string;
	permissions: VaultPermisson[];
}

export interface VaultUser {
	id: string;
	name: string;
	email: string;
	type: GroupRole;
	state: UserState;
	permissions: VaultPermisson[];
}

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
	) => cli.execute<Vault>(["vault", "create"], { args: [name], flags }),

	/**
	 * Remove a vault.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-delete}
	 */
	delete: (nameOrId: string, flags: CommandFlags = {}) =>
		cli.execute<void>(["vault", "delete"], {
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
		cli.execute<void>(["vault", "edit"], {
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
		cli.execute<Vault>(["vault", "get"], { args: [nameOrId], flags }),

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
	) => cli.execute<AbbreviatedVault[]>(["vault", "list"], { flags }),

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
			cli.execute<VaultGroupAccess>(["vault", "group", "grant"], {
				flags: { noInput: true, ...flags },
			}),

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
			cli.execute<VaultGroupAccess>(["vault", "group", "revoke"], {
				flags: { noInput: true, ...flags },
			}),

		/**
		 * List all the groups that have access to the given vault
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-group-list}
		 */
		list: (vault: string, flags: CommandFlags = {}) =>
			cli.execute<VaultGroup[]>(["vault", "group", "list"], {
				args: [vault],
				flags,
			}),
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
			cli.execute<VaultUserAccess>(["vault", "user", "grant"], {
				flags: { noInput: true, ...flags },
			}),

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
			cli.execute<VaultUserAccess>(["vault", "user", "revoke"], {
				flags: { noInput: true, ...flags },
			}),

		/**
		 * List all users with access to the vault and their permissions
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-user-list}
		 */
		list: (vault: string, flags: CommandFlags = {}) =>
			cli.execute<VaultUser[]>(["vault", "user", "list"], {
				args: [vault],
				flags,
			}),
	},
};

// Section: Users

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

export interface User {
	id: string;
	name: string;
	email: string;
	type: UserType;
	state: UserState;
	created_at: string;
	updated_at: string;
	last_auth_at: string;
}

export type AbbreviatedUser = Pick<
	User,
	"id" | "name" | "email" | "type" | "state"
>;

export const user = {
	/**
	 * Confirm a user who has accepted their invitation to the 1Password account.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-confirm}
	 */
	confirm: (emailOrNameOrId: string, flags: CommandFlags<{}> = {}) =>
		cli.execute<void>(["user", "confirm"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		}),

	/**
	 * Confirm all users who have accepted their invitation to the 1Password account.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-confirm}
	 */
	confirmAll: (emailOrNameOrId: string, flags: CommandFlags<{}> = {}) =>
		cli.execute<void>(["user", "confirm"], {
			flags: { all: true, ...flags },
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
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
	 */
	get: (emailOrNameOrId: string, flags: CommandFlags<{}> = {}) =>
		cli.execute<User>(["user", "get"], { args: [emailOrNameOrId], flags }),

	/**
	 * Get details about the current user.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
	 */
	me: (flags: CommandFlags<{}> = {}) =>
		cli.execute<User>(["user", "get"], { flags: { ...flags, me: true } }),

	/**
	 * Get the user's public key fingerprint.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
	 */
	fingerprint: (emailOrNameOrId: string, flags: CommandFlags<{}> = {}) =>
		cli.execute<string>(["user", "get"], {
			args: [emailOrNameOrId],
			flags: { ...flags, fingerprint: true },
			json: false,
		}),

	/**
	 * Get the user's public key.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
	 */
	publicKey: (emailOrNameOrId: string, flags: CommandFlags<{}> = {}) =>
		cli.execute<string>(["user", "get"], {
			args: [emailOrNameOrId],
			flags: { ...flags, publicKey: true },
			json: false,
		}),

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
	) => cli.execute<AbbreviatedUser[]>(["user", "list"], { flags }),

	/**
	 * Provision a user in the authenticated account.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-invite}
	 */
	provision: (
		email: string,
		name: string,
		flags: CommandFlags<{
			language: string;
		}>,
	) =>
		cli.execute<User>(["user", "provision"], {
			flags: { email, name, ...flags },
		}),

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

// Section: Groups

export type GroupRole = "MEMBER" | "MANAGER";

export type GroupState = "ACTIVE" | "DELETED" | "INACTIVE";

export type GroupType =
	| "ADMINISTRATORS"
	| "OWNERS"
	| "RECOVERY"
	| "TEAM_MEMBERS"
	| "USER_DEFINED"
	| "UNKNOWN_TYPE"
	| "SECURITY";

export interface Group {
	id: string;
	name: string;
	description: string;
	state: GroupState;
	created_at: string;
	updated_at: string;
	type: GroupType;
}

export type CreatedGroup = Omit<Group, "description">;

export type AppreviatedGroup = Pick<
	Group,
	"id" | "name" | "description" | "state" | "created_at"
>;

export type GroupUser = AbbreviatedUser & {
	role: GroupRole;
};

export const group = {
	/**
	 * Create a group.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-create}
	 */
	create: (name: string, flags: CommandFlags<{ description: string }> = {}) =>
		cli.execute<CreatedGroup>(["group", "create"], { args: [name], flags }),

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
		cli.execute<Group>(["group", "get"], { args: [nameOrId], flags }),

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
	) => cli.execute<AppreviatedGroup[]>(["group", "list"], { flags }),

	user: {
		/**
		 * Grant a user access to a group.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-user-grant}
		 */
		grant: (
			flags: CommandFlags<{
				group: string;
				role: GroupRole;
				user: string;
			}> = {},
		) => cli.execute<void>(["group", "user", "grant"], { flags, json: false }),

		/**
		 * Retrieve users that belong to a group.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-user-list}
		 */
		list: (group: string, flags: CommandFlags = {}) =>
			cli.execute<GroupUser[]>(["group", "user", "list"], {
				args: [group],
				flags,
			}),

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
