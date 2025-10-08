import { BaseCommand, CommandFlags } from "./base-command";

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

// Import types from other command files
type GroupState = "ACTIVE" | "DELETED" | "INACTIVE";
type GroupRole = "MEMBER" | "MANAGER";
type UserState =
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

export class VaultCommand extends BaseCommand {
	/**
	 * Create a new vault
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-create}
	 */
	create(
		name: string,
		flags: CommandFlags<{
			allowAdminsToManage: "true" | "false";
			description: string;
			icon: VaultIcon;
			noTravelMode: boolean;
		}> = {},
	) {
		return this.cli.execute<Vault>(["vault", "create"], {
			args: [name],
			flags,
		});
	}

	/**
	 * Remove a vault.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-delete}
	 */
	delete(nameOrId: string, flags: CommandFlags = {}) {
		return this.cli.execute<void>(["vault", "delete"], {
			args: [nameOrId],
			flags,
			json: false,
		});
	}

	/**
	 * Edit a vault's name, description, icon or Travel Mode status.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-edit}
	 */
	edit(
		nameOrId: string,
		flags: CommandFlags<{
			description: string;
			icon: VaultIcon;
			name: string;
			travelMode: "on" | "off";
		}> = {},
	) {
		return this.cli.execute<void>(["vault", "edit"], {
			args: [nameOrId],
			flags,
			json: false,
		});
	}

	/**
	 * Get details about a vault.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-get}
	 */
	get(nameOrId: string, flags: CommandFlags = {}) {
		return this.cli.execute<Vault>(["vault", "get"], {
			args: [nameOrId],
			flags,
		});
	}

	/**
	 * List vaults.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-list}
	 */
	list(
		flags: CommandFlags<{
			group: string;
			user: string;
			includeArchive: boolean;
		}> = {},
	) {
		return this.cli.execute<AbbreviatedVault[]>(["vault", "list"], { flags });
	}

	group = {
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
			this.cli.execute<VaultGroupAccess>(["vault", "group", "grant"], {
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
			this.cli.execute<VaultGroupAccess>(["vault", "group", "revoke"], {
				flags: { noInput: true, ...flags },
			}),

		/**
		 * List all the groups that have access to the given vault
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-group-list}
		 */
		list: (vault: string, flags: CommandFlags = {}) =>
			this.cli.execute<VaultGroup[]>(["vault", "group", "list"], {
				args: [vault],
				flags,
			}),
	};

	user = {
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
			this.cli.execute<VaultUserAccess>(["vault", "user", "grant"], {
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
			this.cli.execute<VaultUserAccess>(["vault", "user", "revoke"], {
				flags: { noInput: true, ...flags },
			}),

		/**
		 * List all users with access to the vault and their permissions
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/vault#vault-user-list}
		 */
		list: (vault: string, flags: CommandFlags = {}) =>
			this.cli.execute<VaultUser[]>(["vault", "user", "list"], {
				args: [vault],
				flags,
			}),
	};
}
