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
		"This scenario will have us create, edit, and delete a single vault and item in an account.",
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
	const vaultName = await getInput("Enter a name for the vault:");
	if (!vaultName) {
		warn("No vault name provided, exiting.");
		return;
	}
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

	info(`Now we'll create a new Login item in the ${vault.name} vault.`);
	const itemName = await getInput("Enter a name for the item:");
	if (!itemName) {
		warn("No item name provided, exiting.");
		return;
	}
	const item = cli.item.create(
		[
			["username", "text", "test@example.com"],
			["password", "concealed", "somecleverpassword"],
		],
		{
			title: itemName,
			vault: vault.id,
			account: account.account_uuid,
			category: "Login",
		},
	);
	success(`Item ${item.title} (UUID: ${item.id}) created successfully.`);

	info("Now we'll edit the item.");
	const editingFieldId = await getChoice(
		"Which field would you like to edit?",
		item.fields.map((field) => ({
			label: `${field.label} (${field.type})`,
			value: field.id,
		})),
	);
	if (!editingFieldId) {
		warn("No item field selected for editing, exiting.");
		return;
	}
	const editingField = item.fields.find((field) => field.id === editingFieldId);
	if (!editingField) {
		error("No item field found for editing, exiting.");
		return;
	}
	const newFieldValue = await getInput(
		`Enter the new value for the ${editingField.label} field:`,
	);
	if (!newFieldValue) {
		warn("No new value provided, exiting.");
		return;
	}
	const editedItem = cli.item.edit(
		item.id,
		[[editingField.id, "text", newFieldValue]],
		{
			title: item.title,
			vault: vault.id,
			account: account.account_uuid,
		},
	);
	success(
		`Item ${editedItem.title} (UUID: ${editedItem.id}) edited successfully.`,
	);

	info("Now we'll delete the item.");
	const deleteItem = await getConfirmation(
		`The item ${editedItem.title} (UUID: ${editedItem.id}) will be deleted. Continue?`,
	);
	if (!deleteItem) {
		warn("Item deletion not confirmed, exiting.");
		return;
	}
	cli.item.delete(editedItem.id, {
		archive: false,
		account: account.account_uuid,
		vault: vault.id,
	});
	success(
		`Item ${editedItem.title} deleted successfully from the ${vault.name} vault.`,
	);

	info("Finally, we'll delete the vault itself.");
	const deleteVault = await getConfirmation(
		`The vault ${vault.name} (UUID: ${vault.id}) will be deleted. Continue?`,
	);
	if (!deleteVault) {
		warn("Vault deletion not confirmed, exiting.");
		return;
	}
	success(
		`Vault ${vault.name} (UUID: ${vault.id}) deleted successfully from the ${account.email} account!`,
	);
};

if (require.main === module) {
	main().catch(console.error);
}
