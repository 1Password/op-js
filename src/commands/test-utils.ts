import child_process from "child_process";
import { OpCli } from "../op-cli";

jest.mock("child_process");

export const setupMockCli = (): OpCli => {
	const cli = new OpCli();

	jest.spyOn(cli, "version").mockReturnValue("0.0.0");
	jest.spyOn<any, any>(child_process, "spawnSync").mockReturnValue({
		error: null,
		stderr: "",
		stdout: "{}",
	});

	return cli;
};

export const assertOp = (expectedCommand: string, cli: OpCli): void => {
	const spy = child_process.spawnSync as jest.Mock;
	const call = spy.mock.calls[spy.mock.calls.length - 1] as [
		string,
		string[],
		{ stdio: string | string[]; input?: Buffer; env: Record<string, string> },
	];

	const [executable, args] = call;
	const actualCommand = `${executable} ${args.join(" ")}`;

	expect(executable).toBe("op");
	expect(actualCommand).toBe(`op ${expectedCommand}`);
};
