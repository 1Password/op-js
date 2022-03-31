import child_process from "child_process";
import { cli } from "./src/cli";

jest.mock("child_process");

declare global {
	namespace jest {
		interface Matchers<R> {
			madeOpCommand(expected: string): R;
		}
	}
}

expect.extend({
	madeOpCommand: (
		received: {
			call: [string, string[]];
		},
		expected: string,
	) => {
		const actual = `${received.call[0]} ${received.call[1].join(" ")}`;
		expected = `op ${expected} --format="json"`;

		return {
			pass: expected === actual,
			message: () => `Expected command '${expected}' to equal '${actual}'`,
		};
	},
});

export const executeSpy = (
	params: Parameters<typeof cli.execute>,
	{
		error = null,
		stderr = "",
		stdout = "",
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

	const response = cli.execute(...params);
	const spy = child_process.spawnSync as jest.Mock;
	const call = spy.mock.calls[0] as [string, string[]];
	spy.mockReset();

	return {
		call,
		response,
	};
};
