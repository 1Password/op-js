import { lookpath } from "lookpath";
import semverCoerce from "semver/functions/coerce";
import semverSatisfies from "semver/functions/satisfies";
import { version } from "../package.json";
import Command from "./command";
import { CLIError, ExecutionError, ValidationError } from "./errors";
import { type Flags } from "./flag";
import { semverToInt } from "./utils";

export interface GlobalFlags extends Flags {
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
	session: string;
}

export type CommandFlags<
	TOptional extends Flags = {},
	TExtras extends Record<string, any> = {},
> = Partial<TOptional & TExtras & GlobalFlags>;

interface Integration {
	name: string;
	id: string;
	build: string;
}

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

export interface ServiceAccount {
	URL: string;
	ServiceAccountType: "SERVICE_ACCOUNT";
}

export interface Document {
	id: string;
	title: string;
	version: number;
	vault: {
		id: string;
		name: string;
	};
	last_edited_by?: string;
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
		entropy?: number;
		generated?: boolean;
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

const defaultIntegration: Integration = {
	name: "1Password for JavaScript",
	id: "JS",
	build: semverToInt(version),
};

export const createFieldAssignment = ([
	label,
	type,
	value,
]: FieldAssignment): string => `${label}[${type}]=${value}`;

export interface ConnectInfo {
	host: string;
	token: string;
}

export interface Options {
	globalFlags?: Partial<GlobalFlags>;
	requiredVersion?: string;
	connectInfo?: ConnectInfo;
	serviceAccountToken?: string;
	integration?: Integration;
}

export default class OPJS {
	public static recommendedVersion = ">=2.4.0";
	private requiredVersion: string;
	private command: Command;

	public constructor({
		globalFlags = {},
		requiredVersion = OPJS.recommendedVersion,
		integration = defaultIntegration,
		serviceAccountToken,
		connectInfo,
	}: Options = {}) {
		this.requiredVersion = requiredVersion;

		if (connectInfo && serviceAccountToken) {
			throw new ExecutionError(
				"Cannot set both Connect info and Service Account token",
				1,
			);
		}

		this.command = new Command(globalFlags, {
			OP_INTEGRATION_NAME: integration.name,
			OP_INTEGRATION_ID: integration.id,
			OP_INTEGRATION_BUILDNUMBER: integration.build,
			...(serviceAccountToken && {
				OP_SERVICE_ACCOUNT_TOKEN: serviceAccountToken,
			}),
			...(connectInfo && {
				OP_CONNECT_HOST: connectInfo.host,
				OP_CONNECT_TOKEN: connectInfo.token,
			}),
		});
	}

	/**
	 * Validate that the CLI is installed and meets the required version.
	 */
	public async validate(requiredVersion?: string) {
		requiredVersion = requiredVersion || this.requiredVersion;

		const cliExists = !!(await lookpath("op"));

		if (!cliExists) {
			throw new ValidationError("not-found");
		}

		const semVersion = semverCoerce(this.version);

		if (!semverSatisfies(semVersion, requiredVersion)) {
			throw new ValidationError("version", requiredVersion, this.version);
		}
	}

	/**
	 * Return the version of the `op` executable being used.
	 */
	public get version() {
		return this.command.execute<string>([], {
			flags: { version: true },
			json: false,
		});
	}

	public get inject() {
		// Version >=2.6.2 of the CLI changed how it handled piped input
		// in order to fix an issue with item creation, but in the process
		// it broke piping for other commands. We have a macOS/Linux-only
		// workaround, but not one for Windows, so for now we cannot support
		// the inject command on Windows past this version until the CLI
		// team fixes the issue.
		//
		// eslint-disable-next-line unicorn/consistent-function-scoping
		const modifyFlags = (flags: Flags) => {
			if (
				semverSatisfies(this.version, ">=2.6.2", {
					loose: true,
					includePrerelease: true,
				})
			) {
				if (process.platform === "win32") {
					throw new ExecutionError(
						"Inject is not supported on Windows for version >=2.6.2 of the CLI",
						1,
					);
				} else {
					return { ...flags, inFile: "/dev/stdin" };
				}
			} else {
				return flags;
			}
		};

		return {
			/**
			 * Inject secrets into and return the data
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/commands/inject}
			 */
			data: (input: string, flags: CommandFlags<{}> = {}) =>
				this.command.execute<string>(["inject"], {
					flags: modifyFlags(flags),
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
				this.command.execute<void>(["inject"], {
					flags: modifyFlags({ outFile, ...flags }),
					json: false,
					stdin: input,
				}),
		};
	}

	public get read() {
		return {
			/**
			 * Read a secret by secret reference and return its value
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/commands/read}
			 */
			parse: (
				reference: string,
				flags: CommandFlags<{ noNewline: boolean }> = {},
			) =>
				this.command.execute<string>(["read"], {
					args: [reference],
					flags,
					json: false,
				}),

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
				this.command.execute<string>(["read"], {
					args: [reference],
					flags: { outFile: outputPath, ...flags },
					json: false,
				}),
		};
	}

	public get account() {
		return {
			/**
			 * Remove a 1Password account from this device.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/account#account-forget}
			 */
			forget: (
				account: string | null,
				flags: CommandFlags<{ all: boolean }> = {},
			) =>
				this.command.execute<string>(["account", "forget"], {
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
				this.command.execute<Account>(["account", "get"], {
					flags,
				}),

			/**
			 * List users and accounts set up on this device.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/account#account-list}
			 */
			list: (flags: CommandFlags = {}) =>
				this.command.execute<ListAccount[]>(["account", "list"], {
					flags,
				}),
		};
	}

	public whoami(): ListAccount | ServiceAccount | null {
		try {
			return this.command.execute<ListAccount>(["whoami"]);
		} catch (error) {
			if (error instanceof CLIError && error.message.includes("signed in")) {
				return null;
			} else {
				throw error;
			}
		}
	}

	public get document() {
		return {
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
				this.command.execute<CreatedDocument>(["document", "create"], {
					args: [fromFile ? dataOrFile : ""],
					flags,
					stdin: fromFile ? undefined : dataOrFile,
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
				this.command.execute<void>(["document", "delete"], {
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
				this.command.execute<void>(["document", "edit"], {
					args: [nameOrId, fromFile ? dataOrFile : ""],
					flags,
					stdin: fromFile ? undefined : dataOrFile,
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
				this.command.execute<string>(["document", "get"], {
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
				this.command.execute<void>(["document", "get"], {
					args: [nameOrId],
					flags: {
						output: outputPath,
						...flags,
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
				this.command.execute<Document[]>(["document", "list"], {
					flags,
				}),
		};
	}

	public get eventsApi() {
		return {
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
				this.command.execute<string>(["events-api", "create"], {
					args: [name],
					flags,
					json: false,
				}),
		};
	}

	public get connect() {
		return {
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
					this.command.execute<void>(["connect", "group", "grant"], {
						flags: { group, ...flags },
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
					this.command.execute<void>(["connect", "group", "revoke"], {
						flags: { group, ...flags },
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
					this.command.execute<string>(["connect", "server", "create"], {
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
					this.command.execute<void>(["connect", "server", "delete"], {
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
					newName: string,
					flags: CommandFlags<{}> = {},
				) =>
					this.command.execute<string>(["connect", "server", "edit"], {
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
					this.command.execute<ConnectServer>(["connect", "server", "get"], {
						args: [nameOrId],
						flags,
					}),

				/**
				 * Get a list of Connect servers.
				 *
				 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-list}
				 */
				list: (flags: CommandFlags = {}) =>
					this.command.execute<ConnectServer[]>(["connect", "server", "list"], {
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
					this.command.execute<string>(["connect", "token", "create"], {
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
					this.command.execute<void>(["connect", "token", "delete"], {
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
					this.command.execute<void>(["connect", "token", "edit"], {
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
					this.command.execute<ConnectServerToken[]>(
						["connect", "token", "list"],
						{
							flags,
						},
					),
			},

			vault: {
				/**
				 * Grant a Connect server access to a vault.
				 *
				 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-vault-grant}
				 */
				grant: (server: string, vault: string, flags: CommandFlags<{}> = {}) =>
					this.command.execute<void>(["connect", "vault", "grant"], {
						flags: { server, vault, ...flags },
						json: false,
					}),

				/**
				 * Revoke a Connect server's access to a vault.
				 *
				 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-vault-revoke}
				 */
				revoke: (server: string, vault: string, flags: CommandFlags<{}> = {}) =>
					this.command.execute<void>(["connect", "vault", "revoke"], {
						flags: { server, vault, ...flags },
						json: false,
					}),
			},
		};
	}

	public get item() {
		return {
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
				const options: {
					flags: Flags;
					args?: string[];
					stdin?: Record<string, any>;
				} = {
					flags,
				};

				const version = semverCoerce(this.version);

				// Prior to 2.6.2 the CLI didn't handle field assignments correctly
				// within scripts, so if we're below that version we need to pipe the
				// fields in via stdin
				if (semverSatisfies(version, ">=2.6.2")) {
					options.args = assignments.map((a) => createFieldAssignment(a));
				} else {
					options.stdin = {
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
					};
				}

				return this.command.execute<Item>(["item", "create"], options);
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
				this.command.execute<void>(["item", "delete"], {
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
				this.command.execute<Item>(["item", "edit"], {
					args: [
						nameOrIdOrLink,
						...assignments.map((a) => createFieldAssignment(a)),
					],
					flags,
				}),

			/**
			 * Return details about an item.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-get}
			 */
			get: (
				nameOrIdOrLink: string,
				flags: CommandFlags<
					{
						includeArchive: boolean;
						vault: string;
					},
					{
						fields?: FieldLabelSelector | FieldTypeSelector;
					}
				> = {},
			) => {
				const { fields, ...f } = flags;
				const newFlags: typeof f & {
					fields?: string;
				} = f;

				if (fields) {
					let fieldValue = "";

					if ("label" in fields) {
						fieldValue += (fields.label || [])
							.map((label) => `label=${label}`)
							.join(",");
					} else if ("type" in fields) {
						fieldValue += (fields.type || [])
							.map((type) => `type=${type}`)
							.join(",");
					}

					newFlags.fields = fieldValue;
				}

				return this.command.execute<Item>(["item", "get"], {
					args: [nameOrIdOrLink],
					flags: newFlags,
				});
			},

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
				this.command.execute<string>(["item", "get"], {
					args: [nameOrIdOrLink],
					flags: { otp: true, ...flags },
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
				this.command.execute<string>(["item", "get"], {
					args: [nameOrIdOrLink],
					flags: { shareLink: true, ...flags },
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
			) => this.command.execute<Item[]>(["item", "list"], { flags }),

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
				this.command.execute<string>(["item", "share"], {
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
					this.command.execute<ItemTemplate[]>(["item", "template", "get"], {
						args: [category],
						flags,
					}),

				/**
				 * Lists available item type templates.
				 *
				 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item/#item-template-list}
				 */
				list: (flags: CommandFlags = {}) =>
					this.command.execute<ListItemTemplate[]>(
						["item", "template", "list"],
						{
							flags,
						},
					),
			},
		};
	}

	public get vault() {
		return {
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
				this.command.execute<Vault>(["vault", "create"], {
					args: [name],
					flags,
				}),

			/**
			 * Remove a vault.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-delete}
			 */
			delete: (nameOrId: string, flags: CommandFlags = {}) =>
				this.command.execute<void>(["vault", "delete"], {
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
				this.command.execute<void>(["vault", "edit"], {
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
				this.command.execute<Vault>(["vault", "get"], {
					args: [nameOrId],
					flags,
				}),

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
				this.command.execute<AbbreviatedVault[]>(["vault", "list"], { flags }),

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
					this.command.execute<VaultGroupAccess>(["vault", "group", "grant"], {
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
					this.command.execute<VaultGroupAccess>(["vault", "group", "revoke"], {
						flags: { noInput: true, ...flags },
					}),

				/**
				 * List all the groups that have access to the given vault
				 *
				 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-group-list}
				 */
				list: (vault: string, flags: CommandFlags = {}) =>
					this.command.execute<VaultGroup[]>(["vault", "group", "list"], {
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
					this.command.execute<VaultUserAccess>(["vault", "user", "grant"], {
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
					this.command.execute<VaultUserAccess>(["vault", "user", "revoke"], {
						flags: { noInput: true, ...flags },
					}),

				/**
				 * List all users with access to the vault and their permissions
				 *
				 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-user-list}
				 */
				list: (vault: string, flags: CommandFlags = {}) =>
					this.command.execute<VaultUser[]>(["vault", "user", "list"], {
						args: [vault],
						flags,
					}),
			},
		};
	}

	public get user() {
		return {
			/**
			 * Confirm a user who has accepted their invitation to the 1Password account.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-confirm}
			 */
			confirm: (emailOrNameOrId: string, flags: CommandFlags<{}> = {}) =>
				this.command.execute<void>(["user", "confirm"], {
					args: [emailOrNameOrId],
					flags,
					json: false,
				}),

			/**
			 * Confirm all users who have accepted their invitation to the 1Password account.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-confirm}
			 */
			confirmAll: (flags: CommandFlags<{}> = {}) =>
				this.command.execute<void>(["user", "confirm"], {
					flags: { all: true, ...flags },
					json: false,
				}),

			/**
			 * Remove a user and all their data from the account.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-delete}
			 */
			delete: (emailOrNameOrId: string, flags: CommandFlags = {}) =>
				this.command.execute<void>(["user", "delete"], {
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
				this.command.execute<void>(["user", "edit"], {
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
				this.command.execute<User>(["user", "get"], {
					args: [emailOrNameOrId],
					flags,
				}),

			/**
			 * Get details about the current user.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
			 */
			me: (flags: CommandFlags<{}> = {}) =>
				this.command.execute<User>(["user", "get"], {
					flags: { me: true, ...flags },
				}),

			/**
			 * Get the user's public key fingerprint.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
			 */
			fingerprint: (emailOrNameOrId: string, flags: CommandFlags<{}> = {}) =>
				this.command.execute<string>(["user", "get"], {
					args: [emailOrNameOrId],
					flags: { fingerprint: true, ...flags },
					json: false,
				}),

			/**
			 * Get the user's public key.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
			 */
			publicKey: (emailOrNameOrId: string, flags: CommandFlags<{}> = {}) =>
				this.command.execute<string>(["user", "get"], {
					args: [emailOrNameOrId],
					flags: { publicKey: true, ...flags },
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
			) => this.command.execute<AbbreviatedUser[]>(["user", "list"], { flags }),

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
				this.command.execute<User>(["user", "provision"], {
					flags: { email, name, ...flags },
				}),

			/**
			 * Reactivate a suspended user.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-reactivate}
			 */
			reactivate: (emailOrNameOrId: string, flags: CommandFlags = {}) =>
				this.command.execute<void>(["user", "reactivate"], {
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
				this.command.execute<void>(["user", "suspend"], {
					args: [emailOrNameOrId],
					flags,
					json: false,
				}),
		};
	}

	public get group() {
		return {
			/**
			 * Create a group.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-create}
			 */
			create: (
				name: string,
				flags: CommandFlags<{ description: string }> = {},
			) =>
				this.command.execute<CreatedGroup>(["group", "create"], {
					args: [name],
					flags,
				}),

			/**
			 * Remove a group.
			 *
			 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-delete}
			 */
			delete: (nameOrId: string, flags: CommandFlags = {}) =>
				this.command.execute<void>(["group", "delete"], {
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
				this.command.execute<void>(["group", "edit"], {
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
				this.command.execute<Group>(["group", "get"], {
					args: [nameOrId],
					flags,
				}),

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
				this.command.execute<AppreviatedGroup[]>(["group", "list"], { flags }),

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
				) =>
					this.command.execute<void>(["group", "user", "grant"], {
						flags,
						json: false,
					}),

				/**
				 * Retrieve users that belong to a group.
				 *
				 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-user-list}
				 */
				list: (group: string, flags: CommandFlags = {}) =>
					this.command.execute<GroupUser[]>(["group", "user", "list"], {
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
				) =>
					this.command.execute<void>(["group", "user", "grant"], {
						flags,
						json: false,
					}),
			},
		};
	}
}
