import { BaseCommand, CommandFlags } from "./base-command";

export interface ServiceAccount {
	id: string;
	name: string;
	created_at: string;
	expires_at?: string;
}

export interface ServiceAccountRateLimit {
	hourly: {
		used: number;
		limit: number;
	};
	daily: {
		used: number;
		limit: number;
	};
}

export class ServiceAccountCommand extends BaseCommand {
	/**
	 * Create a service account to gain programmatic access to secrets.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/service-account#service-account-create}
	 */
	create(
		name: string,
		flags: CommandFlags<{
			vault: string[];
			expiresIn: string;
		}> = {},
	) {
		return this.cli.execute<ServiceAccount>(["service-account", "create"], {
			args: [name],
			flags,
		});
	}

	/**
	 * Retrieve hourly and daily rate limit usage for a service account.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/service-account#service-account-ratelimit}
	 */
	ratelimit(serviceAccount: string, flags: CommandFlags = {}) {
		return this.cli.execute<ServiceAccountRateLimit>(
			["service-account", "ratelimit"],
			{
				args: [serviceAccount],
				flags,
			},
		);
	}
}
