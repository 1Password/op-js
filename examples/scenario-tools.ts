import {
	createWriteStream,
	existsSync,
	mkdirSync,
	writeFileSync,
	unlinkSync,
	chmodSync,
} from "fs";
import { join, basename, resolve } from "path";
import { open, Entry, ZipFile } from "yauzl";
import chalk from "chalk";
import inquirer from "inquirer";
import { OpCli } from "../src/index";

type Platform = "darwin" | "freebsd" | "openbsd" | "linux" | "windows";
type Arch = "x64" | "x32" | "ia32" | "arm" | "arm64";
interface PlatformInfo {
	name: Platform;
	arch: Arch;
}

interface CLIVersionResponse {
	CLI2: {
		release: {
			version: string;
		};
	};
}

export const system = (message: string) => {
	console.log(chalk.gray(message));
};

export const info = (message: string) => {
	console.log(chalk.blue(message));
};

export const warn = (message: string) => {
	console.log(chalk.yellow(message));
};

export const error = (message: string) => {
	console.log(chalk.red(message));
};

export const success = (message: string) => {
	console.log(chalk.green(message));
};

interface Choice<T = string> {
	label: string;
	value: T;
}

export const getChoice = async <T = string>(
	title: string,
	choices: Choice<T>[],
): Promise<T> => {
	const result = await inquirer.prompt<{ selectedValue: T }>([
		{
			type: "list",
			name: "selectedValue",
			message: title,
			choices: choices.map((choice) => ({
				name: choice.label,
				value: choice.value,
			})),
		},
	]);

	return result.selectedValue;
};

export const getInput = async (
	title: string,
	defaultValue?: string,
): Promise<string> => {
	const result = await inquirer.prompt<{ inputValue: string }>([
		{
			type: "input",
			name: "inputValue",
			message: title,
			default: defaultValue,
		},
	]);

	return result.inputValue;
};

export const getConfirmation = async (title: string): Promise<boolean> => {
	const result = await inquirer.prompt<{ confirmation: boolean }>([
		{
			type: "confirm",
			name: "confirmation",
			message: title,
		},
	]);

	return result.confirmation;
};

export class CLIManager {
	private cliDir: string;
	private cliPath: string;

	private latestVersion: string | null = null;
	private cli: OpCli | null = null;

	constructor() {
		this.cliDir = resolve(process.cwd(), "examples", "cli");
		this.cliPath = join(
			this.cliDir,
			this.platformInfo.name === "windows" ? "op.exe" : "op",
		);
	}

	get platformInfo(): PlatformInfo {
		const { platform } = process;
		const arch = process.arch as Arch;

		let platformName: string;
		let archName: string;

		switch (platform) {
			case "darwin":
			case "freebsd":
			case "openbsd":
			case "linux":
				platformName = platform;
				break;
			case "win32":
				platformName = "windows";
				break;
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}

		switch (arch) {
			case "x64":
				archName = "amd64";
				break;
			case "x32":
			case "ia32":
				archName = "386";
				break;
			case "arm":
				archName = "arm";
				break;
			case "arm64":
				archName = "arm64";
				break;
			default:
				throw new Error(`Unsupported architecture: ${String(arch)}`);
		}

		return {
			name: platformName as Platform,
			arch: archName as Arch,
		};
	}

	async getCli(): Promise<OpCli> {
		if (this.cli) {
			return this.cli;
		}

		const cli = new OpCli({
			opPath: this.cliPath,
		});

		system("Verifying CLI...");
		if (!(await this.check(cli, true))) {
			system("CLI not found, downloading...");
			await this.download(cli);
		}

		this.cli = cli;
		return this.cli;
	}

	async check(cli: OpCli, failAllowed = false): Promise<boolean> {
		try {
			const latestVersion = await this.getLatestVersion();

			try {
				await cli.verify(latestVersion);
				system(`1Password CLI v${latestVersion} is active and up to date\n`);
				return true;
			} catch (error) {
				if (!failAllowed) {
					console.error("CLI verification failed:", error);
				}
				return false;
			}
		} catch (error) {
			console.error("Failed to check CLI version:", error);
			return false;
		}
	}

	async download(cli: OpCli): Promise<void> {
		const latestVersion = await this.getLatestVersion();

		if (!existsSync(this.cliDir)) {
			mkdirSync(this.cliDir, { recursive: true });
		}

		const downloadUrl = `https://cache.agilebits.com/dist/1P/op2/pkg/v${latestVersion}/op_${this.platformInfo.name}_${this.platformInfo.arch}_v${latestVersion}.zip`;
		await this.downloadAndExtract(latestVersion, downloadUrl);

		const isInstalled = await this.check(cli);
		if (!isInstalled) {
			throw new Error("CLI installation verification failed");
		}
	}

	private async getLatestVersion(force = false): Promise<string> {
		if (!force && this.latestVersion !== null) {
			return this.latestVersion;
		}

		const response = await fetch("https://app-updates.agilebits.com/latest");
		if (!response.ok) {
			throw new Error(`Failed to fetch latest version: ${response.statusText}`);
		}

		const data = (await response.json()) as CLIVersionResponse;
		this.latestVersion = data.CLI2.release.version;
		return this.latestVersion;
	}

	private async downloadAndExtract(
		version: string,
		url: string,
	): Promise<void> {
		system(`Downloading v${version} from: ${url}`);

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to download CLI: ${response.statusText}`);
		}

		system("Saving and extracting...");

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const zipPath = join(this.cliDir, "op.zip");
		writeFileSync(zipPath, buffer);

		await this.extractZip(zipPath, this.cliDir);

		unlinkSync(zipPath);

		// Make the binary executable on Unix systems
		if (this.platformInfo.name !== "windows") {
			chmodSync(this.cliPath, 0o755);
		}
	}

	private async extractZip(zipPath: string, extractTo: string): Promise<void> {
		return new Promise((resolve, reject) => {
			open(
				zipPath,
				{ lazyEntries: true },
				(err: Error | null, zipfile: ZipFile | undefined) => {
					if (err) {
						reject(err);
						return;
					}

					if (!zipfile) {
						reject(new Error("Failed to open zip file"));
						return;
					}

					zipfile.readEntry();
					zipfile.on("entry", (entry: Entry) => {
						if (/\/$/.test(entry.fileName)) {
							// Directory entry
							zipfile.readEntry();
						} else {
							// File entry
							zipfile.openReadStream(
								entry,
								(
									err: Error | null,
									readStream: NodeJS.ReadableStream | undefined,
								) => {
									if (err) {
										reject(err);
										return;
									}

									if (!readStream) {
										reject(new Error("Failed to create read stream"));
										return;
									}

									const fileName = basename(entry.fileName);
									const outputPath = join(extractTo, fileName);
									const writeStream = createWriteStream(outputPath);

									readStream.pipe(writeStream);
									writeStream.on("close", () => {
										zipfile.readEntry();
									});
									writeStream.on("error", reject);
								},
							);
						}
					});

					zipfile.on("end", () => {
						resolve();
					});

					zipfile.on("error", reject);
				},
			);
		});
	}
}
