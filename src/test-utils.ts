import child_process from "child_process";
import Command from "./command";

jest.mock("child_process");

type cliCallArgs = [
	string,
	string[],
	{
		stdio: string;
		input: string;
		env: Record<string, string>;
	},
];

export const executeSpy = (
	{
		command,
		opts = {},
		env = {},
	}: {
		command: Parameters<Command["execute"]>[0];
		opts?: Parameters<Command["execute"]>[1];
		env?: NodeJS.ProcessEnv;
	},
	{
		error = null,
		stderr = "",
		stdout = "{}",
	}: {
		error?: null | Error;
		stderr?: string;
		stdout?: string;
	} = {},
) => {
	jest.spyOn<any, any>(child_process, "spawnSync").mockReturnValue({
		error,
		stderr,
		stdout,
	});

	const cmd = new Command("op", {}, { ...process.env, ...env });
	const response = cmd.execute(command, opts);
	const spy = child_process.spawnSync as jest.Mock;
	const call = spy.mock.calls[0] as cliCallArgs;
	spy.mockReset();

	return {
		call,
		response,
	};
};

export const expectOpCommand = (
	received: {
		call: cliCallArgs;
	},
	expected: string,
): void => {
	const actual = `${received.call[0]} ${received.call[1].join(" ")}`;
	expected = `op ${expected} --format=json`;

	expect(actual).toBe(expected);
};
