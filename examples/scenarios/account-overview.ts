import { chooseAccount } from "../common";
import { logger as l, pluralize, scenario } from "../tools";

export const name = "Account Overview";

export const description = "Displays detailed information about an account.";

export const main = scenario(async (cli) => {
	const account = await chooseAccount(cli);
	if (!account) {
		l.warn("No account selected, exiting.");
		return;
	}

	l.info("\nFetching user details...");
	const currentUser = cli.user.me({ account: account.account_uuid });

	l.info("Fetching account details...");
	const accountDetails = cli.account.get({ account: account.account_uuid });

	l.info("Fetching users...");
	const allUsers = cli.user.list({ account: account.account_uuid });

	const activeUsers = allUsers.filter((user) => user.state === "ACTIVE").length;
	const suspendedUsers = allUsers.filter(
		(user) => user.state === "SUSPENDED",
	).length;
	const otherUsers = allUsers.filter(
		(user) => user.state !== "ACTIVE" && user.state !== "SUSPENDED",
	).length;

	l.info("Fetching vaults...");
	const vaultsList = cli.vault.list({ account: account.account_uuid });

	const vaultsWithDetails = vaultsList.map((vault) => {
		const vaultDetails = cli.vault.get(vault.id, {
			account: account.account_uuid,
		});
		return vaultDetails;
	});

	const accountType = accountDetails.type.toLowerCase();

	l.info("\n👤 Who you are:\n");
	l.log(`User UUID: ${l.highlight(currentUser.id)}\n`);
	l.log(
		`You're signed in to a ${l.highlight(accountType)} account as ${l.highlight(currentUser.name)} with the email ${l.highlight(currentUser.email)}.\n`,
	);

	l.info("🧾 About your account:\n");
	const accountNameWithDomain =
		accountDetails.domain === "my"
			? l.highlight(accountDetails.name)
			: `${l.highlight(accountDetails.name)} (${l.highlight(accountDetails.domain)})`;

	l.log(`Account UUID: ${l.highlight(accountDetails.id)}\n`);
	l.log(
		`Your 1Password account ${accountNameWithDomain} is a ${l.highlight(accountType)} account. It was created on ${l.highlight(new Date(accountDetails.created_at).toLocaleDateString())} and is currently ${l.highlight(accountDetails.state.toLowerCase())}. The account has ${l.highlight(activeUsers.toString())} ${pluralize(activeUsers, "user")} with an "active" status, ${l.highlight(suspendedUsers.toString())} ${pluralize(suspendedUsers, "user")} with a "suspended" status, and ${l.highlight(otherUsers.toString())} ${pluralize(otherUsers, "user")} with other statuses.\n`,
	);

	l.info("🔐 Your vaults and items:\n");
	if (vaultsWithDetails.length === 0) {
		l.log("Your account has no vaults, or you have no access to any vaults.\n");
	} else {
		const totalItems = vaultsWithDetails.reduce(
			(sum, vault) => sum + (vault.items ?? 0),
			0,
		);

		l.log(
			`You have access to ${l.highlight(vaultsWithDetails.length.toString())} ${pluralize(vaultsWithDetails.length, "vault")} ` +
				`containing ${l.highlight(totalItems.toString())} ${pluralize(totalItems, "item")}:\n`,
		);

		for (const vault of vaultsWithDetails) {
			l.log(
				`- ${l.highlight(vault.name)}, created on ${l.highlight(new Date(vault.created_at).toLocaleDateString())}, has ${l.highlight(vault.items?.toString() ?? "0")} ${pluralize(vault.items ?? 0, "item")}`,
			);
		}
	}
});
