import { BaseCommand, CommandFlags } from "./base-command";

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

export class AccountCommand extends BaseCommand {
	/**
	 * Add an account to sign in to for the first time.
	 *
	 * Note: This command is not supported by the CLI wrapper as it requires interactive setup.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/account#account-add}
	 */
	add(
		flags: CommandFlags<{
			address: string;
			email: string;
			secretKey: string;
			shorthand: string;
			signin: boolean;
			raw: boolean;
		}> = {},
	) {
		throw new Error("account.add is not supported by the CLI wrapper.");
	}

	/**
	 * Remove a 1Password account from this device.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/account#account-forget}
	 */
	forget(account: string | null, flags: CommandFlags<{ all: boolean }> = {}) {
		throw new Error("account.add is not supported by the CLI wrapper.");
	}

	/**
	 * Get details about your account.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/account#account-get}
	 */
	get(flags: CommandFlags = {}) {
		return this.cli.execute<Account>(["account", "get"], {
			flags,
		});
	}

	/**
	 * List users and accounts set up on this device.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/account#account-list}
	 */
	list(flags: CommandFlags = {}) {
		return this.cli.execute<ListAccount[]>(["account", "list"], {
			flags,
		});
	}
}
