import { spawn, exec } from "child_process";
import { promisify } from "util";
import { BaseCommand, CommandFlags } from "./base-command";

const execAsync = promisify(exec);

export interface RunOptions {
	envFile?: string[];
	noMasking?: boolean;
}

export class RunCommand extends BaseCommand {
	/**
	 * Pass secrets as environment variables to a process using spawn.
	 *
	 * This method uses Node.js spawn to run the command with secrets injected
	 * as environment variables. The secrets are resolved from the CLI and passed
	 * to the subprocess environment.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/run}
	 */
	async spawn(
		command: string,
		args: string[] = [],
		options: RunOptions = {},
		flags: CommandFlags<{
			envFile: string[];
			noMasking: boolean;
		}> = {},
	) {
		// Merge options with flags
		const mergedFlags = {
			...flags,
			envFile: options.envFile || flags.envFile,
			noMasking:
				options.noMasking !== undefined ? options.noMasking : flags.noMasking,
		};

		// Execute the run command to get the environment variables
		const envVars = this.cli.execute<Record<string, string>>(["run"], {
			args: [command, ...args],
			flags: mergedFlags,
			json: true,
		});

		// Spawn the process with the environment variables
		return new Promise<{ stdout: string; stderr: string; exitCode: number }>(
			(resolve, reject) => {
				const child = spawn(command, args, {
					env: { ...process.env, ...envVars },
					stdio: "pipe",
				});

				let stdout = "";
				let stderr = "";

				child.stdout?.on("data", (data: Buffer) => {
					stdout += data.toString();
				});

				child.stderr?.on("data", (data: Buffer) => {
					stderr += data.toString();
				});

				child.on("close", (code) => {
					resolve({
						stdout,
						stderr,
						exitCode: code || 0,
					});
				});

				child.on("error", (error) => {
					reject(error);
				});
			},
		);
	}

	/**
	 * Pass secrets as environment variables to a process using exec.
	 *
	 * This method uses Node.js exec to run the command with secrets injected
	 * as environment variables. The secrets are resolved from the CLI and passed
	 * to the subprocess environment.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/commands/run}
	 */
	async exec(
		command: string,
		options: RunOptions = {},
		flags: CommandFlags<{
			envFile: string[];
			noMasking: boolean;
		}> = {},
	) {
		// Merge options with flags
		const mergedFlags = {
			...flags,
			envFile: options.envFile || flags.envFile,
			noMasking:
				options.noMasking !== undefined ? options.noMasking : flags.noMasking,
		};

		// Execute the run command to get the environment variables
		const envVars = this.cli.execute<Record<string, string>>(["run"], {
			args: [command],
			flags: mergedFlags,
			json: true,
		});

		// Execute the command with the environment variables
		const env = { ...process.env, ...envVars };

		try {
			const { stdout, stderr } = await execAsync(command, { env });
			return { stdout, stderr, exitCode: 0 };
		} catch (error: unknown) {
			const execError = error as {
				stdout?: string;
				stderr?: string;
				code?: number;
			};
			return {
				stdout: execError.stdout || "",
				stderr: execError.stderr || "",
				exitCode: execError.code || 1,
			};
		}
	}
}
