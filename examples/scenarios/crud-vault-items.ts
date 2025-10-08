import { CLIManager } from "../setup-cli";

export const main = async () => {
	const cli = await new CLIManager().getCli();

	console.log("Available accounts:", cli.account.list());
};

if (require.main === module) {
	main().catch(console.error);
}
