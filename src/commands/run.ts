import { BaseCommand, CommandFlags } from "./base-command";

export interface RunResult {
	stdout: string;
	stderr: string;
	exitCode: number;
}

export class RunCommand extends BaseCommand {
	/**
	 * Pass secrets as environment variables to a process.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/run}
	 */
	run(
		command: string,
		args: string[] = [],
		flags: CommandFlags<{
			envFile: string[];
			noMasking: boolean;
		}> = {},
	): RunResult {
		return this.cli.executeRun(["run"], {
			args: [command, ...args],
			flags,
		});
	}
}
