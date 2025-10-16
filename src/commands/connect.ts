import { BaseCommand, CommandFlags } from "./base-command";

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

// Import types from other command files
type VaultPermisson =
	| "allow_viewing"
	| "allow_editing"
	| "allow_managing"
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

export class ConnectCommand extends BaseCommand {
	group = {
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
			this.cli.execute<void>(["connect", "group", "grant"], {
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
			this.cli.execute<void>(["connect", "group", "revoke"], {
				flags: { group, ...flags },
				json: false,
			}),
	};

	server = {
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
			this.cli.execute<string>(["connect", "server", "create"], {
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
			this.cli.execute<void>(["connect", "server", "delete"], {
				args: [nameOrId],
				flags,
			}),

		/**
		 * Rename a Connect server.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-edit}
		 */
		edit: (nameOrId: string, newName: string, flags: CommandFlags = {}) =>
			this.cli.execute<string>(["connect", "server", "edit"], {
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
			this.cli.execute<ConnectServer>(["connect", "server", "get"], {
				args: [nameOrId],
				flags,
			}),

		/**
		 * Get a list of Connect servers.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-server-list}
		 */
		list: (flags: CommandFlags = {}) =>
			this.cli.execute<ConnectServer[]>(["connect", "server", "list"], {
				flags,
			}),
	};

	token = {
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
			this.cli.execute<string>(["connect", "token", "create"], {
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
			this.cli.execute<void>(["connect", "token", "delete"], {
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
			this.cli.execute<void>(["connect", "token", "edit"], {
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
			this.cli.execute<ConnectServerToken[]>(["connect", "token", "list"], {
				flags,
			}),
	};

	vault = {
		/**
		 * Grant a Connect server access to a vault.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-vault-grant}
		 */
		grant: (server: string, vault: string, flags: CommandFlags = {}) =>
			this.cli.execute<void>(["connect", "vault", "grant"], {
				flags: { server, vault, ...flags },
				json: false,
			}),

		/**
		 * Revoke a Connect server's access to a vault.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/connect#connect-vault-revoke}
		 */
		revoke: (server: string, vault: string, flags: CommandFlags = {}) =>
			this.cli.execute<void>(["connect", "vault", "revoke"], {
				flags: { server, vault, ...flags },
				json: false,
			}),
	};
}
