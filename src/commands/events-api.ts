import { BaseCommand, CommandFlags } from "./base-command";

export class EventsApiCommand extends BaseCommand {
	/**
	 * Create an Events API integration token.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/events-api#subcommands}
	 */
	create(
		name: string,
		flags: CommandFlags<{
			expiresIn: string;
			features: ("signinattempts" | "itemusages")[];
		}> = {},
	) {
		return this.cli.execute<string>(["events-api", "create"], {
			args: [name],
			flags,
			json: false,
		});
	}
}
