import { randomInt } from "crypto";
import { ListAccount, OpCli, Vault } from "../src";
import { getChoice, getConfirmation, logger as l } from "./tools";

export const chooseAccount = async (
	cli: OpCli,
): Promise<ListAccount | null> => {
	l.info("\nPlease choose which 1Password account to use.");
	const accounts = cli.account.list();

	const accountUuid = await getChoice(
		"Select an account:",
		accounts.map((account) => ({
			label: `${account.email} (${account.url})`,
			value: account.account_uuid,
		})),
	);

	if (!accountUuid) {
		return null;
	}

	const account = accounts.find(
		(account) => account.account_uuid === accountUuid,
	);

	return account ?? null;
};

export const createVault = async (
	cli: OpCli,
	account: ListAccount,
): Promise<Vault | null> => {
	l.info("\nNext we'll create a temporary vault.");

	const name = `Demo Vault ${randomInt(100, 999)}`;

	const confirmCreateVault = await getConfirmation(
		`A new vault called "${name}" will be created in the selected account. Continue?`,
	);
	if (!confirmCreateVault) {
		return null;
	}

	const vault = cli.vault.create(name, {
		account: account.account_uuid,
	});

	l.success(`Successfully created vault ${vault.name} (UUID: ${vault.id}).`);

	return vault;
};

export const deleteVault = async (
	cli: OpCli,
	vault: Vault,
	account: ListAccount,
): Promise<boolean> => {
	l.info("\nNow we'll delete the vault and its items.");

	const confirmDeleteVault = await getConfirmation(
		`The vault ${vault.name} (UUID: ${vault.id}) will be deleted. Continue?`,
	);
	if (!confirmDeleteVault) {
		return false;
	}

	cli.vault.delete(vault.id, {
		account: account.account_uuid,
	});

	l.success(
		`Successfully deleted the vault ${vault.name} from the ${account.email} account!`,
	);

	return true;
};
