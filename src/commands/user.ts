import { BaseCommand, CommandFlags } from "./base-command";

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

export class UserCommand extends BaseCommand {
	/**
	 * Confirm a user who has accepted their invitation to the 1Password account.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-confirm}
	 */
	confirm(emailOrNameOrId: string, flags: CommandFlags = {}) {
		return this.cli.execute<void>(["user", "confirm"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		});
	}

	/**
	 * Confirm all users who have accepted their invitation to the 1Password account.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-confirm}
	 */
	confirmAll(flags: CommandFlags = {}) {
		return this.cli.execute<void>(["user", "confirm"], {
			flags: { all: true, ...flags },
			json: false,
		});
	}

	/**
	 * Remove a user and all their data from the account.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-delete}
	 */
	delete(emailOrNameOrId: string, flags: CommandFlags = {}) {
		return this.cli.execute<void>(["user", "delete"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		});
	}

	/**
	 * Change a user's name or Travel Mode status
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-edit}
	 */
	edit(
		emailOrNameOrId: string,
		flags: CommandFlags<{
			name: string;
			travelMode: "on" | "off";
		}> = {},
	) {
		return this.cli.execute<void>(["user", "edit"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		});
	}

	/**
	 * Get details about a user.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
	 */
	get(emailOrNameOrId: string, flags: CommandFlags = {}) {
		return this.cli.execute<User>(["user", "get"], {
			args: [emailOrNameOrId],
			flags,
		});
	}

	/**
	 * Get details about the current user.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
	 */
	me(flags: CommandFlags = {}) {
		return this.cli.execute<User>(["user", "get"], {
			flags: { me: true, ...flags },
		});
	}

	/**
	 * Get the user's public key fingerprint.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
	 */
	fingerprint(emailOrNameOrId: string, flags: CommandFlags = {}) {
		return this.cli.execute<string>(["user", "get"], {
			args: [emailOrNameOrId],
			flags: { fingerprint: true, ...flags },
			json: false,
		});
	}

	/**
	 * Get the user's public key.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-get}
	 */
	publicKey(emailOrNameOrId: string, flags: CommandFlags = {}) {
		return this.cli.execute<string>(["user", "get"], {
			args: [emailOrNameOrId],
			flags: { publicKey: true, ...flags },
			json: false,
		});
	}

	/**
	 * List users.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-list}
	 */
	list(
		flags: CommandFlags<{
			group: string;
			vault: string;
		}> = {},
	) {
		return this.cli.execute<AbbreviatedUser[]>(["user", "list"], { flags });
	}

	/**
	 * Provision a user in the authenticated account.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user/#user-provision}
	 */
	provision(
		email: string,
		name: string,
		flags: CommandFlags<{
			language: string;
		}>,
	) {
		return this.cli.execute<User>(["user", "provision"], {
			flags: { email, name, ...flags },
		});
	}

	/**
	 * Reactivate a suspended user.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-reactivate}
	 */
	reactivate(emailOrNameOrId: string, flags: CommandFlags = {}) {
		return this.cli.execute<void>(["user", "reactivate"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		});
	}

	/**
	 * Suspend a user.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-suspend}
	 */
	suspend(
		emailOrNameOrId: string,
		flags: CommandFlags<{ deauthorizeDevicesAfter: string }> = {},
	) {
		return this.cli.execute<void>(["user", "suspend"], {
			args: [emailOrNameOrId],
			flags,
			json: false,
		});
	}

	recovery = {
		/**
		 * Begin recovery for users in your 1Password account.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/user#user-recovery-begin}
		 */
		begin: (users: string[], flags: CommandFlags = {}) =>
			this.cli.execute<void>(["user", "recovery", "begin"], {
				args: users,
				flags,
				json: false,
			}),
	};
}
