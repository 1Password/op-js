import { OpCli, Flags, GlobalFlags } from "../op-cli";

export type CommandFlags<TOptional extends Flags = Record<string, never>> =
	Partial<TOptional & GlobalFlags>;

export abstract class BaseCommand {
	protected cli: OpCli;

	constructor(cli: OpCli) {
		this.cli = cli;
	}
}
