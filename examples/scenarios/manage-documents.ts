import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { getChoice, getInput, logger as l, openItem, scenario } from "../tools";
import { chooseAccount, createVault, deleteVault } from "../common";

export const name = "Manage Documents";

export const description = "Creates and manages documents in a vault.";

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

	l.info("\nNow we'll manage documents in the new vault.");

	let isManaging = true;
	while (isManaging) {
		const documents = cli.document.list({
			vault: vault.id,
			includeArchive: false,
			account: account.account_uuid,
		});

		const hasDocuments = documents.length > 0;

		let selection = "CREATE_NEW";
		if (hasDocuments) {
			selection = await getChoice(
				"Select a document to open or create a new one:",
				[
					...documents.map((doc) => ({
						label: `${doc.title} (${doc.id})`,
						value: doc.id,
					})),
					{ label: "📝 Create new document", value: "CREATE_NEW" },
					{
						label: "☑️ Done managing documents",
						value: "DONE_MANAGING",
					},
				],
			);
		} else {
			l.info("Start by creating a new document.");
		}

		if (selection === "DONE_MANAGING") {
			isManaging = false;
		} else if (selection === "CREATE_NEW") {
			const documentContents = await getInput(
				"Enter the text content for the document:",
				"This is example document content.",
			);
			if (!documentContents) {
				l.warn("No document contents provided, returning to menu.");
				continue;
			}

			const documentTitle = await getInput(
				"What do you want to call this document?",
				"Demo Document",
			);
			if (!documentTitle) {
				l.warn("No document title provided, returning to menu.");
				continue;
			}

			const document = cli.document.create(documentContents, {
				title: documentTitle,
				vault: vault.id,
				account: account.account_uuid,
				fileName: "example.txt",
			});
			l.success(
				`Successfully created document ${documentTitle} (UUID: ${document.uuid}).`,
			);
		} else {
			const selectedDoc = documents.find((doc) => doc.id === selection);
			if (selectedDoc) {
				l.info(`\nOpening document "${selectedDoc.title}" in 1Password...`);
				await openItem(
					account.account_uuid,
					vault.id,
					selectedDoc.id,
					account.url,
				);
			}
		}
	}

	const deletedVault = await deleteVault(cli, vault, account);
	if (!deletedVault) {
		l.warn("Vault deletion failed, exiting.");
	}
});
