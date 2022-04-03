import child_process from "child_process";
import {
	camelToHyphen,
	cli,
	createFieldAssignment,
	createFlags,
	parseFlagValue,
} from "./cli";

jest.mock("child_process");

const expectOpCommand = (
	received: {
		call: [string, string[]];
	},
	expected: string,
): void => {
	const actual = `${received.call[0]} ${received.call[1].join(" ")}`;
	expected = `op ${expected} --format="json"`;

	expect(actual).toBe(expected);
};

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

describe("parseFlagValue", () => {
	it("parses string type values", () => {
		expect(parseFlagValue("foo")).toEqual('="foo"');
	});

	it("parses string array type values", () => {
		expect(parseFlagValue(["foo", "bar"])).toEqual('="foo,bar"');
	});

	it("parses boolean type values", () => {
		expect(parseFlagValue(true)).toEqual("");
	});

	it("parses type field selector values", () => {
		expect(
			parseFlagValue({
				type: ["otp"],
			}),
		).toEqual('="type=otp"');
	});

	it("parses label field selector values", () => {
		expect(
			parseFlagValue({
				label: ["username", "password"],
			}),
		).toEqual('="label=username,label=password"');
	});
});

describe("createFlags", () => {
	it("creates flags from a flag object", () => {
		expect(createFlags({ someFlag: "foo" })).toEqual(['--some-flag="foo"']);
	});

	it("ignores null and falsey values", () => {
		expect(
			createFlags({ someFlag: "foo", anotherFlag: false, andAnother: null }),
		).toEqual(['--some-flag="foo"']);
	});
});

describe("createFieldAssignment", () => {
	it("creates a field assignment from a field assignment object", () => {
		expect(createFieldAssignment(["username", "text", "foo"])).toEqual(
			'"username[text]=foo"',
		);
		expect(createFieldAssignment(["password", "password", "abc123"])).toEqual(
			'"password[password]=abc123"',
		);
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
			expectOpCommand(
				execute,
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
			expectOpCommand(
				execute,
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
			expectOpCommand(
				execute,
				`foo --account="my.b5test.com" --iso-timestamps`,
			);
		});
	});
});
