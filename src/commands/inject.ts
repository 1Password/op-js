import { BaseCommand, CommandFlags } from "./base-command";

export class InjectCommand extends BaseCommand {
	/**
	 * Inject secrets into and return the data
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/inject}
	 */
	data(input: string, flags: CommandFlags<Record<string, never>> = {}) {
		return this.cli.execute<string>(["inject"], {
			flags,
			json: false,
			stdin: input,
		});
	}

	/**
	 * Inject secrets into data and write the result to a file
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/inject}
	 */
	toFile(
		input: string,
		outFile: string,
		flags: CommandFlags<{
			fileMode: string;
			force: boolean;
		}> = {},
	) {
		return this.cli.execute<void>(["inject"], {
			flags: { outFile, ...flags },
			json: false,
			stdin: input,
		});
	}
}
