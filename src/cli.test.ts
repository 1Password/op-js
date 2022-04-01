import child_process from "child_process";
import { camelToHyphen, cli } from "./cli";

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

	const response = cli.execute(...params);
	const spy = child_process.spawnSync as jest.Mock;
	const call = spy.mock.calls[0] as [string, string[]];
	spy.mockReset();

	return {
		call,
		response,
	};
};

describe("camelToHyphen", () => {
	it("converts camel case to hyphens", () => {
		expect(camelToHyphen("someFlag")).toEqual("some-flag");
	});
});

describe("cli", () => {
	describe("execute", () => {
		it("constructs and calls an op command", () => {
			const execute = executeSpy([
				["example", "command"],
				{
					args: ["howdy"],
					flags: { foo: "bar", lorem: true, howdy: ["dolor", "sit"] },
				},
			]);
			expect(execute).madeOpCommand(
				`example command "howdy" --foo="bar" --lorem --howdy="dolor,sit"`,
			);
		});

		it("handles field assignment arguments", () => {
			const execute = executeSpy([
				["foo"],
				{
					args: [
						["username", "text", "foo"],
						["password", "password", "abc123"],
					],
				},
			]);
			expect(execute).madeOpCommand(
				`foo "username[text]=foo" "password[password]=abc123"`,
			);
		});

		it("throws if there's an error", () => {
			const error = new Error("bar");
			expect(() => executeSpy([["foo"]], { error })).toThrowError(error);
		});

		it("throws if there's a stderr", () => {
			const stderr = "bar";
			expect(() => executeSpy([["foo"]], { stderr })).toThrowError(
				new Error(stderr),
			);
		});

		it("parses command JSON responses by default", () => {
			const data = { foo: "bar" };
			const execute = executeSpy([["foo"]], { stdout: JSON.stringify(data) });
			expect(execute.response).toEqual(data);
		});

		it("can also return non-JSON responses", () => {
			const message = "some message";
			const execute = executeSpy([["foo"], { json: false }], {
				stdout: message,
			});
			expect(execute.response).toEqual(message);
		});
	});

	describe("globalFlags", () => {
		it("applies global flags to a command", () => {
			cli.globalFlags = {
				account: "my.b5test.com",
				isoTimestamps: true,
			};

			const execute = executeSpy([["foo"]]);
			expect(execute).madeOpCommand(
				`foo --account="my.b5test.com" --iso-timestamps`,
			);
		});
	});
});
