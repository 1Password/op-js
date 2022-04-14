import { Flags } from "./cli";
declare type CommandFlags<TOptional extends Flags = {}, TRequired extends Flags = {}> = Partial<TOptional & GlobalFlags> & TRequired;
export interface GlobalFlags {
    account: string;
    cache: boolean;
    config: string;
    encoding: "utf-8" | "shift-jis" | "shiftjis" | "sjis" | "s-jis" | "shift_jis" | "s_jis" | "gbk";
    isoTimestamps: boolean;
    sessionToken: string;
}
/**
 * Set any of the {@link GlobalFlags} on the CLI command.
 */
export declare const setGlobalFlags: (flags: Partial<GlobalFlags>) => void;
/**
 * Validate that the user's CLI setup is valid for this wrapper.
 */
export declare const validateCli: () => Promise<void>;
/**
 * Retrieve the current version of the CLI.
 */
export declare const version: () => string;
/**
 * Inject secrets into a config file.
 */
export declare const inject: <TReturn extends string | void>(dataOrFile: string, flags?: CommandFlags<{
    outFile: string;
    fileMode: string;
    force: boolean;
}>, fromFile?: boolean) => TReturn;
export declare const read: {
    /**
     * Read a secret by secret reference and return its value
     *
     * {@link https://developer.1password.com/docs/cli/reference/commands/read}
     */
    parse: (reference: string, flags?: CommandFlags<{
        noNewline: boolean;
    }>) => string;
    /**
     * Read a secret by secret reference and save it to a file
     *
     * Returns the path to the file.
     *
     * {@link https://developer.1password.com/docs/cli/reference/commands/read}
     */
    toFile: (reference: string, outputPath: string, flags?: CommandFlags<{
        noNewline: boolean;
    }>) => string;
};
export declare type AccountType = "BUSINESS" | "TEAM" | "FAMILY" | "INDIVIDUAL" | "UNKNOWN";
export declare type AccountState = "REGISTERED" | "ACTIVE" | "SUSPENDED" | "DELETED" | "PURGING" | "PURGED" | "UNKNOWN";
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
    shorthand?: string;
}
export declare const account: {
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
    forget: (account: string | null, flags?: CommandFlags<{
        all: boolean;
    }>) => string;
    /**
     * Get details about your account.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/account#account-get}
     */
    get: (flags?: CommandFlags) => Account;
    /**
     * List users and accounts set up on this device.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/account#account-list}
     */
    list: (flags?: CommandFlags) => ListAccount[];
};
export interface Document {
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
}
export interface CreatedDocument {
    uuid: string;
    createdAt: string;
    updatedAt: string;
    vaultUuid: string;
}
export declare const document: {
    /**
     * Create a document item with data or a file on disk.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-create}
     */
    create: (dataOrFile: string, flags?: CommandFlags<{
        fileName: string;
        tags: string[];
        title: string;
        vault: string;
    }>, fromFile?: boolean) => CreatedDocument;
    /**
     * Permanently delete a document.
     *
     * Set `archive` to move it to the Archive instead.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-delete}
     */
    delete: (nameOrId: string, flags?: CommandFlags<{
        archive: boolean;
        vault: string;
    }>) => void;
    /**
     * Update a document.
     *
     * Replaces the file contents with the provided file path or data.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-edit}
     */
    edit: (nameOrId: string, dataOrFile: string, flags?: CommandFlags<{
        fileName: string;
        tags: string[];
        title: string;
        vault: string;
    }>, fromFile?: boolean) => void;
    /**
     * Download a document and return its contents.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-get}
     */
    get: (nameOrId: string, flags?: CommandFlags<{
        includeArchive: boolean;
        vault: string;
    }>) => string;
    /**
     * Download a document and save it to a file.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-get}
     */
    toFile: (nameOrId: string, outputPath: string, flags?: CommandFlags<{
        includeArchive: boolean;
        vault: string;
    }>) => void;
    /**
     * List documents.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-list}
     */
    list: (flags?: CommandFlags<{
        includeArchive: boolean;
        vault: string;
    }>) => Document[];
};
export declare const eventsApi: {
    /**
     * Create an Events API integration token.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/events-api#subcommands}
     */
    create: (name: string, flags: CommandFlags<{
        expiresIn: string;
        features: ("signinattempts" | "itemusages")[];
    }>) => string;
};
export interface ConnectServer {
    id: string;
    name: string;
    state: string;
    created_at: string;
    creator_id: string;
    tokens_version: number;
}
export interface ConnectServerToken {
    id: string;
    name: string;
    state: string;
    issuer: string;
    audience: string;
    features: string[];
    vaults: [];
    created_at: string;
    integration_id: string;
}
export declare const connect: {
    group: {
        /**
         * Grant a group access to manage Secrets Automation.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-group-grant}
         */
        grant: (flags: CommandFlags<{
            allServers: boolean;
            server: string;
        }, {
            group: string;
        }>) => void;
        /**
         * Revoke a group's access to manage Secrets Automation.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-group-revoke}
         */
        revoke: (flags: CommandFlags<{
            allServers: boolean;
            server: string;
        }, {
            group: string;
        }>) => void;
    };
    server: {
        /**
         * Add a 1Password Connect server to your account and generate a credentials file for it.
         *
         * Creates a credentials file in the CWD.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-create}
         */
        create: (name: string, flags?: CommandFlags<{
            vaults: string[];
        }>) => string;
        /**
         * Remove a Connect server.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-delete}
         */
        delete: (nameOrId: string, flags?: CommandFlags) => void;
        /**
         * Rename a Connect server.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-edit}
         */
        edit: (nameOrId: string, flags: CommandFlags<{}, {
            name: string;
        }>) => string;
        /**
         * Get details about a Connect server.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-get}
         */
        get: (nameOrId: string, flags?: CommandFlags) => ConnectServer;
        /**
         * Get a list of Connect servers.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-list}
         */
        list: (flags?: CommandFlags) => ConnectServer[];
    };
    token: {
        /**
         * Issue a new token for a Connect server.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-token-create}
         */
        create: (name: string, flags: CommandFlags<{
            expiresIn: string;
            vaults: string[];
        }, {
            server: string;
        }>) => string;
        /**
         * Revoke a token for a Connect server.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-token-delete}
         */
        delete: (token: string, flags?: CommandFlags<{
            server: string;
        }>) => void;
        /**
         * Rename a Connect token.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-token-edit}
         */
        edit: (token: string, flags: CommandFlags<{
            server: string;
        }, {
            name: string;
        }>) => void;
        /**
         * List tokens for Connect servers.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-token-list}
         */
        list: (flags?: CommandFlags<{
            server: string;
        }>) => ConnectServerToken[];
    };
    vault: {
        /**
         * Grant a Connect server access to a vault.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-vault-grant}
         */
        grant: (flags: CommandFlags<{}, {
            server: string;
            vault: string;
        }>) => void;
        /**
         * Revoke a Connect server's access to a vault.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-vault-revoke}
         */
        revoke: (flags: CommandFlags<{}, {
            server: string;
            vault: string;
        }>) => void;
    };
};
export declare type InputCategory = "Email Account" | "Medical Record" | "Password" | "Bank Account" | "Membership" | "Reward Program" | "Credit Card" | "Driver License" | "Outdoor License" | "Passport" | "Wireless Router" | "Social Security Number" | "Software License" | "API Credential" | "Database" | "Document" | "Identity" | "Login" | "Secure Note" | "Server";
export declare type OutputCategory = "EMAIL_ACCOUNT" | "MEDICAL_RECORD" | "PASSWORD" | "BANK_ACCOUNT" | "MEMBERSHIP" | "REWARD_PROGRAM" | "CREDIT_CARD" | "DRIVER_LICENSE" | "OUTDOOR_LICENSE" | "PASSPORT" | "WIRELESS_ROUTER" | "SOCIAL_SECURITY_NUMBER" | "SOFTWARE_LICENSE" | "API_CREDENTIAL" | "DATABASE" | "DOCUMENT" | "IDENTITY" | "LOGIN" | "SECURE_NOTE" | "SERVER";
export declare type PasswordStrength = "TERRIBLE" | "WEAK" | "FAIR" | "GOOD" | "VERY_GOOD" | "EXCELLENT" | "FANTASTIC";
export declare type FieldAssignmentType = "password" | "text" | "email" | "url" | "date" | "monthYear" | "phone" | "delete";
export declare type FieldAssignment = [
    field: string,
    type: FieldAssignmentType,
    value: string
];
export interface FieldLabelSelector {
    label?: string[];
}
export interface FieldTypeSelector {
    type?: ("address" | "concealed" | "creditcardnumber" | "creditcardtype" | "date" | "email" | "file" | "gender" | "menu" | "monthyear" | "otp" | "phone" | "reference" | "string" | "url")[];
}
export interface Section {
    id: string;
}
interface BaseField {
    id: string;
    type: string;
    label: string;
    section?: Section;
    tags?: string[];
}
export declare type ValueField = BaseField & {
    value: string;
};
export declare type GenericField = ValueField & {
    type: "STRING" | "URL" | "ADDRESS" | "DATE" | "MONTH_YEAR" | "EMAIL" | "PHONE" | "REFERENCE";
};
export declare type UsernameField = ValueField & {
    type: "STRING";
    purpose: "USERNAME";
};
export declare type NotesField = ValueField & {
    type: "STRING";
    purpose: "NOTES";
};
export declare type OtpField = ValueField & {
    type: "OTP";
    totp: string;
};
export declare type PasswordField = ValueField & {
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
export declare type Field = UsernameField | PasswordField | OtpField | NotesField | GenericField;
export interface Item {
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
    tags?: string[];
    fields?: Field[];
    files?: File[];
    urls?: {
        primary: boolean;
        href: string;
    }[];
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
export declare const item: {
    /**
     * Create an item.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-create}
     */
    create: (assignments: FieldAssignment[], flags?: CommandFlags<{
        category: InputCategory;
        dryRun: boolean;
        generatePassword: string | boolean;
        tags: string[];
        template: string;
        title: string;
        url: string;
        vault: string;
    }>) => Item;
    /**
     * Permanently delete an item.
     *
     * Set `archive` to move it to the Archive instead.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-delete}
     */
    delete: (nameOrIdOrLink: string, flags?: CommandFlags<{
        archive: boolean;
        vault: string;
    }>) => void;
    /**
     * Edit an item's details.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-edit}
     */
    edit: (nameOrIdOrLink: string, assignments: FieldAssignment[], flags?: CommandFlags<{
        dryRun: boolean;
        generatePassword: string | boolean;
        tags: string[];
        title: string;
        url: string;
        vault: string;
    }>) => Item;
    /**
     * Return details about an item.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-get}
     */
    get: (nameOrIdOrLink: string, flags?: CommandFlags<{
        fields: FieldLabelSelector | FieldTypeSelector;
        includeArchive: boolean;
        vault: string;
    }>) => Item;
    /**
     * Output the primary one-time password for this item.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-get}
     */
    otp: (nameOrIdOrLink: string, flags?: CommandFlags<{
        includeArchive: boolean;
        vault: string;
    }>) => string;
    /**
     * Get a shareable link for the item.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-get}
     */
    shareLink: (nameOrIdOrLink: string, flags?: CommandFlags<{
        includeArchive: boolean;
        vault: string;
    }>) => string;
    /**
     * List items.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-list}
     */
    list: (flags?: CommandFlags<{
        categories: InputCategory[];
        includeArchive: boolean;
        long: boolean;
        tags: string[];
        vault: string;
    }>) => Item[];
    /**
     * Share an item.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-share}
     */
    share: (nameOrId: string, flags?: CommandFlags<{
        emails: string[];
        expiry: string;
        vault: string;
        viewOnce: boolean;
    }>) => string;
    template: {
        /**
         * Return a template for an item type.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/item/#item-template-get}
         */
        get: (category: InputCategory, flags?: CommandFlags) => ItemTemplate[];
        /**
         * Lists available item type templates.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/item/#item-template-list}
         */
        list: (flags?: CommandFlags) => ListItemTemplate[];
    };
};
export declare type VaultIcon = "airplane" | "application" | "art-supplies" | "bankers-box" | "brown-briefcase" | "brown-gate" | "buildings" | "cabin" | "castle" | "circle-of-dots" | "coffee" | "color-wheel" | "curtained-window" | "document" | "doughnut" | "fence" | "galaxy" | "gears" | "globe" | "green-backpack" | "green-gem" | "handshake" | "heart-with-monitor" | "house" | "id-card" | "jet" | "large-ship" | "luggage" | "plant" | "porthole" | "puzzle" | "rainbow" | "record" | "round-door" | "sandals" | "scales" | "screwdriver" | "shop" | "tall-window" | "treasure-chest" | "vault-door" | "vehicle" | "wallet" | "wrench";
export declare type VaultPermisson = "allow_viewing" | "allow_editing" | "allow_managing" | "view_items" | "view_and_copy_passwords" | "view_item_history" | "create_items" | "edit_items" | "archive_items" | "delete_items" | "import_items" | "export_items" | "copy_and_share_items" | "print_items" | "manage_vault";
export declare type VaultType = "PERSONAL" | "EVERYONE" | "TRANSFER" | "USER_CREATED" | "UNKNOWN";
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
export declare type AbbreviatedVault = Pick<Vault, "id" | "name">;
interface VaultAccess {
    vault_id: string;
    vault_name: string;
    permissions: string;
}
export declare type VaultUserAccess = VaultAccess & {
    user_id: string;
    user_email: string;
};
export declare type VaultGroupAccess = VaultAccess & {
    group_id: string;
    group_name: string;
};
export interface VaultGroup {
    id: string;
    name: string;
    description: string;
    state: string;
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
export declare const vault: {
    /**
     * Create a new vault
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-create}
     */
    create: (name: string, flags?: CommandFlags<{
        allowAdminsToManage: "true" | "false";
        description: string;
        icon: VaultIcon;
    }>) => Vault;
    /**
     * Remove a vault.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-delete}
     */
    delete: (nameOrId: string, flags?: CommandFlags) => void;
    /**
     * Edit a vault's name, description, icon or Travel Mode status.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-edit}
     */
    edit: (nameOrId: string, flags?: CommandFlags<{
        description: string;
        icon: VaultIcon;
        name: string;
        travelMode: "on" | "off";
    }>) => void;
    /**
     * Get details about a vault.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-get}
     */
    get: (nameOrId: string, flags?: CommandFlags) => Vault;
    /**
     * List vaults.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-list}
     */
    list: (flags?: CommandFlags<{
        group: string;
        user: string;
    }>) => AbbreviatedVault[];
    group: {
        /**
         * Grant a group permissions in a vault.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-group-grant}
         */
        grant: (flags?: CommandFlags<{
            group: string;
            permissions: VaultPermisson[];
            vault: string;
        }>) => VaultGroupAccess;
        /**
         * Revoke a group's permissions in a vault, in part or in full
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-group-revoke}
         */
        revoke: (flags?: CommandFlags<{
            group: string;
            permissions: VaultPermisson[];
            vault: string;
        }>) => VaultGroupAccess;
        /**
         * List all the groups that have access to the given vault
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-group-list}
         */
        list: (vault: string, flags?: CommandFlags) => VaultGroup[];
    };
    user: {
        /**
         * Grant a user permissions in a vault
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-user-grant}
         */
        grant: (flags?: CommandFlags<{
            user: string;
            permissions: VaultPermisson[];
            vault: string;
        }>) => VaultUserAccess;
        /**
         * Revoke a user's permissions in a vault, in part or in full
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-user-revoke}
         */
        revoke: (flags?: CommandFlags<{
            user: string;
            permissions: VaultPermisson[];
            vault: string;
        }>) => VaultUserAccess;
        /**
         * List all users with access to the vault and their permissions
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-user-list}
         */
        list: (vault: string, flags?: CommandFlags) => VaultUser[];
    };
};
export declare type UserType = "MEMBER" | "GUEST" | "SERVICE_ACCOUNT" | "UNKNOWN";
export declare type UserState = "ACTIVE" | "PENDING" | "DELETED" | "SUSPENDED" | "RECOVERY_STARTED" | "RECOVERY_ACCEPTED" | "TRANSFER_PENDING" | "TRANSFER_STARTED" | "TRANSFER_ACCEPTED" | "EMAIL_VERIFIED_BUT_REGISTRATION_INCOMPLETE" | "TEAM_REGISTRATION_INITIATED" | "UNKNOWN";
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
export declare type AbbreviatedUser = Pick<User, "id" | "name" | "email" | "type" | "state">;
export declare const user: {
    /**
     * Confirm users who have accepted their invitation to the 1Password account.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-confirm}
     */
    confirm: (emailOrNameOrId: string, flags?: CommandFlags<{
        all: boolean;
    }>) => void;
    /**
     * Remove a user and all their data from the account.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-delete}
     */
    delete: (emailOrNameOrId: string, flags?: CommandFlags) => void;
    /**
     * Change a user's name or Travel Mode status
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-edit}
     */
    edit: (emailOrNameOrId: string, flags?: CommandFlags<{
        name: string;
        travelMode: "on" | "off";
    }>) => void;
    /**
     * Get details about a user.
     *
     * Omit the first param and set the `me` flag to get details about the current user.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
     */
    get: (emailOrNameOrId: string | null, flags?: CommandFlags<{
        fingerprint: boolean;
        publicKey: boolean;
        me: boolean;
    }>) => User;
    /**
     * List users.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-list}
     */
    list: (flags?: CommandFlags<{
        group: string;
        vault: string;
    }>) => AbbreviatedUser[];
    /**
     * Provision a user in the authenticated account.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-invite}
     */
    provision: (flags: CommandFlags<{
        language: string;
    }, {
        email: string;
        name: string;
    }>) => User;
    /**
     * Reactivate a suspended user.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-reactivate}
     */
    reactivate: (emailOrNameOrId: string, flags?: CommandFlags) => void;
    /**
     * Suspend a user.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-suspend}
     */
    suspend: (emailOrNameOrId: string, flags?: CommandFlags<{
        deauthorizeDevicesAfter: string;
    }>) => void;
};
export declare type GroupRole = "MEMBER" | "MANAGER";
export declare type GroupState = "ACTIVE" | "DELETED" | "INACTIVE";
export declare type GroupType = "ADMINISTRATORS" | "OWNERS" | "RECOVERY" | "TEAM_MEMBERS" | "USER_DEFINED" | "UNKNOWN_TYPE";
export interface Group {
    id: string;
    name: string;
    description: string;
    state: GroupState;
    created_at: string;
    updated_at: string;
    type: GroupType;
}
export declare type CreatedGroup = Omit<Group, "description">;
export declare type AppreviatedGroup = Pick<Group, "id" | "name" | "description" | "state" | "created_at">;
export declare type GroupUser = AbbreviatedUser & {
    role: GroupRole;
};
export declare const group: {
    /**
     * Create a group.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-create}
     */
    create: (name: string, flags?: CommandFlags<{
        description: string;
    }>) => CreatedGroup;
    /**
     * Remove a group.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-delete}
     */
    delete: (nameOrId: string, flags?: CommandFlags) => void;
    /**
     * Change a group's name or description.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-edit}
     */
    edit: (nameOrId: string, flags?: CommandFlags<{
        description: string;
        name: string;
    }>) => void;
    /**
     * Get details about a group.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-get}
     */
    get: (nameOrId: string, flags?: CommandFlags) => Group;
    /**
     * List groups.
     *
     * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-list}
     */
    list: (flags?: CommandFlags<{
        vault: string;
        user: string;
    }>) => AppreviatedGroup[];
    user: {
        /**
         * Grant a user access to a group.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-user-grant}
         */
        grant: (flags?: CommandFlags<{
            group: string;
            role: GroupRole;
            user: string;
        }>) => void;
        /**
         * Retrieve users that belong to a group.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-user-list}
         */
        list: (group: string, flags?: CommandFlags) => GroupUser[];
        /**
         * Revoke a user's access to a vault or group.
         *
         * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-user-revoke}
         */
        revoke: (flags?: CommandFlags<{
            group: string;
            user: string;
        }>) => void;
    };
};
export {};