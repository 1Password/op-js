import chalk from "chalk";
import { CLIManager, getChoice, info, success, warn } from "../scenario-tools";

export const main = async () => {
	const cli = await new CLIManager().getCli();

	info(
		"This scenario will display detailed information about an account, including users and vaults.",
	);

	info("Please select an account.");
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
	const listAccount = accounts.find(
		(account) => account.account_uuid === accountUuid,
	);
	success(`Got it, we'll use your account for ${listAccount?.email}.`);

	// Get current user details
	info("\nFetching user details...");
	const currentUser = cli.user.me({ account: accountUuid });

	// Get account details
	info("Fetching account details...");
	const account = cli.account.get({ account: accountUuid });

	// Get all users in the account
	info("Fetching users...");
	const allUsers = cli.user.list({ account: accountUuid });

	// Count active and suspended users
	const activeUsers = allUsers.filter((user) => user.state === "ACTIVE").length;
	const suspendedUsers = allUsers.filter(
		(user) => user.state === "SUSPENDED",
	).length;
	const otherUsers = allUsers.filter(
		(user) => user.state !== "ACTIVE" && user.state !== "SUSPENDED",
	).length;

	// Get all vaults
	info("Fetching vaults...");
	const vaultsList = cli.vault.list({ account: accountUuid });

	// Get full details for each vault to get item counts
	const vaultsWithDetails = vaultsList.map((vault) => {
		const vaultDetails = cli.vault.get(vault.id, { account: accountUuid });
		return vaultDetails;
	});

	const accountCategory = account.type.toLowerCase();

	info("\n🙂 Who you are:\n");
	console.log(
		`You're signed in to a ${chalk.whiteBright(accountCategory)} account as ${chalk.whiteBright(currentUser.name)} with the email ${chalk.whiteBright(currentUser.email)}.\n`,
	);
	console.log(`User UUID: ${chalk.whiteBright(currentUser.id)}\n`);

	info("📄 About your account:\n");
	const accountNameWithDomain =
		account.domain === "my"
			? chalk.whiteBright(account.name)
			: `${chalk.whiteBright(account.name)} (${chalk.whiteBright(account.domain)})`;
	console.log(
		`Your 1Password account ${accountNameWithDomain} is a ${chalk.whiteBright(account.type.toLowerCase())} account. It was created on ${chalk.whiteBright(new Date(account.created_at).toLocaleDateString())} and is currently ${chalk.whiteBright(account.state.toLowerCase())}. The account has ${chalk.whiteBright(activeUsers)} user${activeUsers !== 1 ? "s" : ""} with an "active" status, ${chalk.whiteBright(suspendedUsers)} user${suspendedUsers !== 1 ? "s" : ""} with a "suspended" status, and ${chalk.whiteBright(otherUsers)} user${otherUsers !== 1 ? "s" : ""} with other statuses.\n`,
	);
	console.log(`Account UUID: ${chalk.whiteBright(account.id)}\n`);

	info("🔐 Your vaults and items:\n");
	if (vaultsWithDetails.length === 0) {
		console.log(
			"Your account has no vaults, or you have no access to any vaults.\n",
		);
	} else {
		const totalItems = vaultsWithDetails.reduce(
			(sum, vault) => sum + (vault.items ?? 0),
			0,
		);
		console.log(
			`You have access to ${chalk.whiteBright(vaultsWithDetails.length)} vault${vaultsWithDetails.length !== 1 ? "s" : ""} ` +
				`containing ${chalk.whiteBright(totalItems)} item${totalItems !== 1 ? "s" : ""}:\n`,
		);
		for (const vault of vaultsWithDetails) {
			console.log(
				`- ${chalk.whiteBright(vault.name)}, created on ${chalk.whiteBright(new Date(vault.created_at).toLocaleDateString())}, has ${chalk.whiteBright(vault.items ?? 0)} item${vault.items !== 1 ? "s" : ""}`,
			);
		}
	}

	success("\nAccount overview displayed successfully!");
};

if (require.main === module) {
	main().catch(console.error);
}
