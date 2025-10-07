import { BaseCommand, CommandFlags } from "./base-command";

export class ReadCommand extends BaseCommand {
	/**
	 * Read a secret by secret reference and return its value
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/read}
	 */
	parse(reference: string, flags: CommandFlags<{ noNewline: boolean }> = {}) {
		return this.cli.execute<string>(["read"], {
			args: [reference],
			flags,
			json: false,
		});
	}

	/**
	 * Read a secret by secret reference and save it to a file
	 *
	 * Returns the path to the file.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/read}
	 */
	toFile(
		reference: string,
		outputPath: string,
		flags: CommandFlags<{ noNewline: boolean }> = {},
	) {
		return this.cli.execute<string>(["read"], {
			args: [reference],
			flags: { outFile: outputPath, ...flags },
			json: false,
		});
	}
}
