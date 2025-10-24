import { existsSync, readdirSync } from "fs";
import { join, basename } from "path";
import inquirer from "inquirer";
import minimist from "minimist";
import chalk from "chalk";

interface ScenarioMetadata {
	filename: string;
	name: string;
	description: string;
}

interface ScenarioModule {
	name?: string;
	description?: string;
	main?: () => Promise<void>;
}

export class ExampleRunner {
	private scenariosDir: string;
	private args: minimist.ParsedArgs;
	private moduleCache: Map<string, ScenarioModule> = new Map();

	constructor() {
		this.scenariosDir = join(process.cwd(), "examples", "scenarios");
		this.args = minimist(process.argv.slice(2));
	}

	get availableScenarios(): string[] {
		try {
			return readdirSync(this.scenariosDir)
				.filter((file: string) => file.endsWith(".ts"))
				.map((file: string) => basename(file, ".ts"));
		} catch (err) {
			console.error("❌ Could not retrieve scenarios:", err);
			return [];
		}
	}

	async getScenarioMetadata(
		scenarioFilename: string,
	): Promise<ScenarioMetadata> {
		const scenarioPath = join(this.scenariosDir, `${scenarioFilename}.ts`);

		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-unsanitized/method
			const scenarioModule = (await import(scenarioPath)) as ScenarioModule;

			this.moduleCache.set(scenarioFilename, scenarioModule);

			return {
				filename: scenarioFilename,
				name: scenarioModule.name || scenarioFilename,
				description: scenarioModule.description || "",
			};
		} catch (err) {
			// Fallback to filename if unable to load metadata
			return {
				filename: scenarioFilename,
				name: scenarioFilename,
				description: "",
			};
		}
	}

	async selectScenario(): Promise<string | null> {
		const scenarios = this.availableScenarios;

		if (scenarios.length === 0) {
			console.log("❌ No scenarios found to run.");
			return null;
		}

		const scenarioMetadata = await Promise.all(
			scenarios.map(
				async (scenario) => await this.getScenarioMetadata(scenario),
			),
		);

		const choices = [
			...scenarioMetadata.map((metadata) => ({
				name: metadata.description
					? `${metadata.name} - ${chalk.gray(metadata.description)}`
					: metadata.name,
				value: metadata.filename,
			})),
			{ name: "👋 Exit program", value: "exit" },
		];

		const { selectedScenario } = await inquirer.prompt<{
			selectedScenario: string;
		}>([
			{
				type: "list",
				name: "selectedScenario",
				message: "Select a scenario to run:",
				choices,
				pageSize: 10,
			},
		]);

		if (selectedScenario === "exit") {
			return null;
		}

		return selectedScenario;
	}

	async runScenario(scenarioName: string): Promise<void> {
		const scenarioPath = join(this.scenariosDir, `${scenarioName}.ts`);

		if (!existsSync(scenarioPath)) {
			throw new Error(`Scenario file not found: ${scenarioPath}`);
		}

		try {
			const scenarioModule = this.moduleCache.get(scenarioName);
			const displayName = scenarioModule.name || scenarioName;

			console.log(`\n🚀 Running scenario: ${displayName}`);
			console.log("-".repeat(60) + "\n");

			if (typeof scenarioModule.main === "function") {
				await scenarioModule.main();
			} else {
				console.log("❌ Scenario loaded but no main function found.");
			}

			console.log(`\n✅ Completed scenario: ${displayName}`);
		} catch (error) {
			if (error instanceof Error && error.message.includes("SIGINT")) {
				console.log("❌ Scenario interrupted by user.");
				process.exit(0);
			} else {
				console.error(`❌ Error running scenario ${scenarioName}:`, error);
				throw error;
			}
		}
	}

	async run(): Promise<void> {
		console.log(chalk.whiteBright.bold("op-js Examples Runner"));
		console.log("=".repeat(60));

		const scenarioArg = this.args.scenario as string | undefined;

		// Run a scenarios immediately if flag is provided
		if (scenarioArg) {
			const scenarios = this.availableScenarios;
			if (scenarios.includes(scenarioArg)) {
				await this.runScenario(scenarioArg);
			} else {
				console.error(`❌ Scenario '${scenarioArg}' not found.`);
				console.log("Available scenarios:", scenarios.join(", "));
				process.exit(1);
			}
			return;
		}

		// Choose a scenario interactively
		const selectedScenario = await this.selectScenario();

		if (selectedScenario) {
			try {
				await this.runScenario(selectedScenario);
			} catch (error) {
				console.error("Failed to run scenario:", error);
				process.exit(1);
			}
		}
	}
}

if (require.main === module) {
	const runner = new ExampleRunner();
	runner.run().catch((error) => {
		if (error instanceof Error && error.message.includes("SIGINT")) {
			console.log("❌ Scenario interrupted by user.");
			process.exit(0);
		} else {
			console.error("Example runner failed:", error);
			process.exit(1);
		}
	});
}
