import semverCoerce from "semver/functions/coerce";
import semverSatisfies from "semver/functions/satisfies";
import { Arg, Flags } from "../build-command";
import { ExecutionError } from "../errors";
import { BaseCommand, CommandFlags } from "./base-command";

export class InjectCommand extends BaseCommand {
	/**
	 * Inject secrets into and return the data
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/inject}
	 */
	data(input: string, flags: CommandFlags = {}) {
		return this.executeInject<string>(["inject"], {
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
		return this.executeInject<void>(["inject"], {
			flags: { outFile, ...flags },
			json: false,
			stdin: input,
		});
	}

	/**
	 * Execute inject command with inject-specific logic
	 */
	private executeInject<TData extends string | Record<string, any> | void>(
		subCommand: string[],
		{
			args = [],
			flags = {},
			stdin,
			json = true,
		}: {
			args?: Arg[];
			flags?: Flags;
			stdin?: string | Record<string, any>;
			json?: boolean;
		} = {},
	): TData {
		// Apply inject-specific logic
		const cliVersion = this.cli.version();
		let mergedFlags: Flags = { ...(this.cli.globalFlags || {}), ...flags };

		// Version >=2.6.2 of the CLI changed how it handled piped input
		// in order to fix an issue with item creation, but in the process
		// it broke piping for other commands. We have a macOS/Linux-only
		// workaround, but not one for Windows, so for now we cannot support
		// the inject command on Windows past this version until the CLI
		// team fixes the issue.
		const version = semverCoerce(cliVersion);
		if (semverSatisfies(version, ">=2.6.2")) {
			if (process.platform === "win32") {
				throw new ExecutionError(
					"Inject is not supported on Windows for version >=2.6.2 of the CLI",
					1,
				);
			} else {
				mergedFlags = { ...mergedFlags, inFile: "/dev/stdin" };
			}
		}

		// Use the regular execute method with the modified flags
		return this.cli.execute<TData>(subCommand, {
			args,
			flags: mergedFlags,
			stdin,
			json,
		});
	}
}
