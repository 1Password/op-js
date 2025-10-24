import { chooseAccount, createVault, deleteVault } from "../common";
import { logger as l, getChoice, getInput, scenario } from "../tools";

export const name = "CRUD Vault Item";

export const description =
	"Creates, edits, and deletes a single vault and item in an account.";

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

	l.info(
		"\nWe'll create a Login item in the new vault, using a generated password.",
	);
	const itemName = await getInput(
		"What do you want to call this item?",
		"Demo Login",
	);
	if (!itemName) {
		l.warn("No item name provided, exiting.");
		return;
	}
	const item = cli.item.create([["username", "text", "test@example.com"]], {
		title: itemName,
		vault: vault.id,
		account: account.account_uuid,
		category: "Login",
		generatePassword: true,
	});
	l.success(`Successfully created item ${item.title} (UUID: ${item.id}).`);

	l.info("\nNow let's make some edits to the item.");
	let currentItem = item;
	let isEditing = true;

	while (isEditing) {
		const editingFieldId = await getChoice("Which field do you want to edit?", [
			...currentItem.fields.map((field) => ({
				label: field.label,
				value: field.id,
			})),
			{
				label: "☑️ Done editing",
				value: "DONE_EDITING",
			},
		]);

		if (!editingFieldId || editingFieldId === "DONE_EDITING") {
			l.info("Finished editing item.");
			isEditing = false;
			break;
		}

		const editingField = currentItem.fields.find(
			(field) => field.id === editingFieldId,
		);
		if (!editingField) {
			l.error("No item field found for editing, exiting.");
			return;
		}

		const newFieldValue = await getInput(
			`Enter the new value for the ${editingField.label} field:`,
		);
		if (!newFieldValue) {
			l.warn("No new value provided, skipping edit.");
			continue;
		}

		currentItem = cli.item.edit(
			currentItem.id,
			[[editingField.id, "text", newFieldValue]],
			{
				title: currentItem.title,
				vault: vault.id,
				account: account.account_uuid,
			},
		);

		l.success("Successfully edited item.\n");
	}

	const deletedVault = await deleteVault(cli, vault, account);
	if (!deletedVault) {
		l.warn("Vault deletion not confirmed, exiting.");
	}
});
