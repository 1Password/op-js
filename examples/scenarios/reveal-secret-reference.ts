import { randomUUID } from "crypto";
import { chooseAccount, createVault } from "../common";
import { logger as l, getConfirmation, scenario } from "../tools";

export const name = "Reveal Secret Reference";

export const description =
	"Reveals a secret reference value assigned to an environment variable.";

export const main = scenario(async (cli) => {
	const account = await chooseAccount(cli);
	if (!account) {
		l.warn("No account selected, exiting.");
		return;
	}

	const vault = await createVault(cli, account);
	if (!vault) {
		l.warn("Vault creation not confirmed, exiting.");
		return;
	}

	const tokenValue = randomUUID();
	l.info(
		"\nWe'll create a API Credential item in the new vault, and give it a random token value.",
	);
	const item = cli.item.create([["token", "concealed", tokenValue]], {
		category: "API Credential",
		title: "Demo API Credential",
		vault: vault.id,
		account: account.account_uuid,
	});
	l.success(`Successfully created item ${item.title} (UUID: ${item.id}).`);

	const tokenField = item.fields?.find((field) => field.label === "token");
	if (!tokenField) {
		l.error("Token field not found in the created item, exiting.");
		return;
	}

	l.log(
		`\nThe item's token field has a secret reference of ${l.highlight(tokenField.reference)}, pointing to the value ${l.highlight(tokenField.value)}.`,
	);

	const confirmSettingEnvVar = await getConfirmation(
		"Next we'll assign the token field's reference to the DEMO_SECRET_TOKEN environment variable. Continue?",
	);
	if (!confirmSettingEnvVar) {
		l.warn("Environment variable assignment not confirmed, exiting.");
		return;
	}
	process.env.DEMO_SECRET_TOKEN = tokenField.reference;

	l.info(
		"\nNow we'll perform `printenv DEMO_SECRET_TOKEN` to see the secret from the environment variable.",
	);
	try {
		const result = cli.run.run("printenv", ["DEMO_SECRET_TOKEN"], {
			noMasking: true,
			account: account.account_uuid,
		});
		l.log(`Command output: ${l.highlight(result.stdout.trim())}`);
		if (result.stderr) {
			l.error(`Command stderr: ${result.stderr}`);
			return;
		}
	} catch (err) {
		l.error(`Failed to run command: ${err}`);
		return;
	}

	l.info("\nCleaning up environment variable.");
	delete process.env.DEMO_SECRET_TOKEN;

	l.info("Finally, we'll delete the vault itself.");
	cli.vault.delete(vault.id, {
		account: account.account_uuid,
	});
	l.success(
		`Vault ${vault.name} (UUID: ${vault.id}) deleted successfully from the ${account.email} account!`,
	);
});
