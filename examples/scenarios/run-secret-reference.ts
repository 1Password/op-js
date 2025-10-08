import {
	CLIManager,
	error,
	getChoice,
	getConfirmation,
	getInput,
	info,
	success,
	warn,
} from "../scenario-tools";

export const main = async () => {
	const cli = await new CLIManager().getCli();

	info(
		"This scenario will demonstrate executing commands with an item's secret reference.",
	);

	info("First, we'll select an account.");
	const accounts = cli.account.list();
	const accountUuid = await getChoice(
		"Select an account:",
		accounts.map((account) => ({
			label: `${account.email} (${account.url})`,
			value: account.account_uuid,
		})),
	);
	if (!accountUuid) {
		warn("No account selected, exiting.");
		return;
	}
	const account = accounts.find(
		(account) => account.account_uuid === accountUuid,
	);
	success(
		`Okay, we'll use the ${account.email} (UUID: ${account.account_uuid}) account.`,
	);

	info("Next we'll create a new vault.");
	const vaultName = "Example Vault";
	const createVault = await getConfirmation(
		`A new vault called ${vaultName} will be created in the ${account.email} account. Continue?`,
	);
	if (!createVault) {
		warn("Vault creation not confirmed, exiting.");
		return;
	}
	const vault = cli.vault.create(vaultName, {
		account: account.account_uuid,
	});
	success(`Vault ${vault.name} (UUID: ${vault.id}) created successfully!`);

	const tokenValue = "xyz123";
	info(`Now we'll create a new Login item in the ${vault.name} vault.`);
	const item = cli.item.create([["token", "concealed", tokenValue]], {
		title: "Example Item",
		vault: vault.id,
		account: account.account_uuid,
		category: "Login",
	});
	success(
		`Item ${item.title} (UUID: ${item.id}) created successfully, with the token field set to "${tokenValue}".`,
	);

	info("Now we'll find the token field and set up the environment variable.");
	const tokenField = item.fields?.find((field) => field.label === "token");
	if (!tokenField) {
		error("Token field not found in the created item, exiting.");
		return;
	}
	if (!tokenField.reference) {
		error("Token field does not have a secret reference, exiting.");
		return;
	}

	const confirmSettingEnvVar = await getConfirmation(
		`Now we'll assign the token field's reference to the SECRET_TOKEN environment variable. Continue?`,
	);
	if (!confirmSettingEnvVar) {
		warn("Environment variable assignment not confirmed, exiting.");
		return;
	}
	process.env.SECRET_TOKEN = tokenField.reference;

	info(
		"Now we'll run a command that uses the secret from the environment variable.",
	);
	try {
		const result = await cli.run.exec("echo $SECRET_TOKEN");
		success(`Command output: ${result.stdout.trim()}`);
		if (result.stderr) {
			warn(`Command stderr: ${result.stderr}`);
		}
	} catch (err) {
		error(`Failed to run command: ${err}`);
		return;
	}

	info("Cleaning up environment variable.");
	delete process.env.SECRET_TOKEN;
	success("Environment variable unset.");

	info("Now we'll delete the item.");
	cli.item.delete(item.id, {
		archive: false,
		account: account.account_uuid,
		vault: vault.id,
	});
	success(
		`Item ${item.title} deleted successfully from the ${vault.name} vault.`,
	);

	info("Finally, we'll delete the vault itself.");
	cli.vault.delete(vault.id, {
		account: account.account_uuid,
	});
	success(
		`Vault ${vault.name} (UUID: ${vault.id}) deleted successfully from the ${account.email} account!`,
	);
};

if (require.main === module) {
	main().catch(console.error);
}
