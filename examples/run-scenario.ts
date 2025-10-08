import { existsSync, readdirSync } from "fs";
import { join, basename } from "path";
import inquirer from "inquirer";
import minimist from "minimist";
import chalk from "chalk";

export class ExampleRunner {
	private scenariosDir: string;
	private args: minimist.ParsedArgs;

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

	async selectScenario(): Promise<string | null> {
		const scenarios = this.availableScenarios;

		if (scenarios.length === 0) {
			console.log("❌ No scenarios found to run.");
			return null;
		}

		const choices = [
			...scenarios.map((scenario) => ({ name: scenario, value: scenario })),
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
		console.log(`\n🚀 Running scenario: ${scenarioName}`);
		console.log("-".repeat(60) + "\n");

		const scenarioPath = join(this.scenariosDir, `${scenarioName}.ts`);

		if (!existsSync(scenarioPath)) {
			throw new Error(`Scenario file not found: ${scenarioPath}`);
		}

		try {
			// Dynamically import and run the scenario
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-unsanitized/method
			const scenarioModule = await import(scenarioPath);

			// Look for a main function
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (typeof scenarioModule.main === "function") {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
				await scenarioModule.main();
			} else {
				console.log("❌ Scenario loaded but no main function found.");
			}

			console.log(`\n✅ Completed scenario: ${scenarioName}`);
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
