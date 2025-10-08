import { BaseCommand, CommandFlags } from "./base-command";
import { ListAccount } from "./account";

export class WhoamiCommand extends BaseCommand {
	/**
	 * Get details about the current user.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/whoami}
	 */
	get(flags: CommandFlags = {}) {
		try {
			return this.cli.execute<ListAccount>(["whoami"], {
				flags,
			});
		} catch (error) {
			if (error instanceof Error && error.message.includes("signed in")) {
				return null;
			} else {
				throw error;
			}
		}
	}
}
