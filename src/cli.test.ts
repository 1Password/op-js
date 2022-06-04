import child_process from "child_process";
import * as lookpath from "lookpath";
import {
	camelToHyphen,
	CLI,
	cli,
	CLIError,
	createFieldAssignment,
	createFlags,
	ExecutionError,
	parseFlagValue,
	ValidationError,
} from "./cli";

jest.mock("child_process");
jest.mock("lookpath");

const fakeOpPath = "/path/to/op";

const expectOpCommand = (
	received: {
		call: [string, string[]];
	},
	expected: string,
): void => {
	const actual = `${received.call[0]} ${received.call[1].join(" ")}`;
	expected = `op ${expected} --format=json`;

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

describe("ValidationError", () => {
	describe("not-found", () => {
		it("sets the correct message", () => {
			const error = new ValidationError("not-found");
			expect(error.message).toBe("Could not find `op` executable");
		});
	});

	describe("version", () => {
		const requiredVersion = "3.2.1";
		const currentVersion = "1.2.3";

		it("sets the correct message", () => {
			const error = new ValidationError(
				"version",
				requiredVersion,
				currentVersion,
			);
			expect(error.message).toBe(
				`CLI version ${currentVersion} does not satisfy required version ${requiredVersion}`,
			);
		});

		it("attaches the current and required versions", () => {
			const error = new ValidationError(
				"version",
				requiredVersion,
				currentVersion,
			);
			expect(error.requiredVersion).toBe(requiredVersion);
			expect(error.currentVersion).toBe(currentVersion);
		});
	});
});

describe("CLIError", () => {
	const dateTime = "2022/06/04 17:59:15";
	const message = "authorization prompt dismissed, please try again";

	it("attaches the status code", () => {
		const error = new CLIError("", 1);
		expect(error.status).toBe(1);
	});

	it("parses an error message from op CLI", () => {
		const error = new CLIError(`[ERROR] ${dateTime} ${message}`, 1);
		expect(error.timestamp).toEqual(new Date(dateTime));
		expect(error.message).toEqual(message);
	});

	it("gracefully handles not being able to parse op error", () => {
		const invalidError = "invalid error";
		const error = new CLIError(invalidError, 1);
		expect(error.timestamp).toBeUndefined();
		expect(error.message).toEqual("Unknown error");
		expect(error.originalMessage).toEqual(invalidError);
	});
});

describe("camelToHyphen", () => {
	it("converts camel case to hyphens", () => {
		expect(camelToHyphen("someFlag")).toEqual("some-flag");
	});

	it("correctly handles pascal case", () => {
		expect(camelToHyphen("SomeFlag")).toEqual("some-flag");
	});
});

describe("parseFlagValue", () => {
	it("parses string type values", () => {
		expect(parseFlagValue("foo")).toEqual("=foo");
	});

	it("parses string array type values", () => {
		expect(parseFlagValue(["foo", "bar"])).toEqual("=foo,bar");
	});

	it("parses boolean type values", () => {
		expect(parseFlagValue(true)).toEqual("");
	});

	it("parses type field selector values", () => {
		expect(
			parseFlagValue({
				type: ["OTP"],
			}),
		).toEqual("=type=OTP");
	});

	it("parses label field selector values", () => {
		expect(
			parseFlagValue({
				label: ["username", "password"],
			}),
		).toEqual("=label=username,label=password");
	});
});

describe("createFlags", () => {
	it("creates flags from a flag object", () => {
		expect(createFlags({ someFlag: "foo" })).toEqual(["--some-flag=foo"]);
	});

	it("ignores null and falsey values", () => {
		expect(
			createFlags({ someFlag: "foo", anotherFlag: false, andAnother: null }),
		).toEqual(["--some-flag=foo"]);
	});
});

describe("createFieldAssignment", () => {
	it("creates a field assignment from a field assignment object", () => {
		expect(createFieldAssignment(["username", "text", "foo"])).toEqual(
			"username[text]=foo",
		);
		expect(createFieldAssignment(["password", "concealed", "abc123"])).toEqual(
			"password[concealed]=abc123",
		);
	});
});

describe("cli", () => {
	describe("validate", () => {
		it("throws an error when the op cli is not found", async () => {
			const lookpathSpy = jest
				.spyOn(lookpath, "lookpath")
				.mockResolvedValue(undefined);

			await expect(cli.validate()).rejects.toEqual(
				new ValidationError("not-found"),
			);

			lookpathSpy.mockRestore();
		});

		it("throws an error when the cli does not meet the version requirements", async () => {
			const lookpathSpy = jest
				.spyOn(lookpath, "lookpath")
				.mockResolvedValue(fakeOpPath);
			const spawnSpy = jest
				.spyOn<any, any>(child_process, "spawnSync")
				.mockReturnValue({
					error: null,
					stderr: "",
					stdout: "1.0.0",
				});

			await expect(cli.validate()).rejects.toEqual(
				new ValidationError("version", CLI.recommendedVersion, "1.0.0"),
			);

			lookpathSpy.mockRestore();
			spawnSpy.mockRestore();
		});

		it("does not throw when cli is fully valid", async () => {
			CLI.recommendedVersion = ">=2.0.0";

			const lookpathSpy = jest
				.spyOn(lookpath, "lookpath")
				.mockResolvedValue(fakeOpPath);
			const spawnSpy = jest
				.spyOn<any, any>(child_process, "spawnSync")
				.mockReturnValue({
					error: null,
					stderr: "",
					stdout: "2.1.0",
				});

			await expect(cli.validate()).resolves.toBeUndefined();

			lookpathSpy.mockRestore();
			spawnSpy.mockRestore();
		});

		it("can handle beta versions", async () => {
			CLI.recommendedVersion = ">=2.0.0";

			const lookpathSpy = jest
				.spyOn(lookpath, "lookpath")
				.mockResolvedValue(fakeOpPath);
			const spawnSpy = jest
				.spyOn<any, any>(child_process, "spawnSync")
				.mockReturnValue({
					error: null,
					stderr: "",
					stdout: "2.0.1.beta.12",
				});

			await expect(cli.validate()).resolves.toBeUndefined();

			lookpathSpy.mockRestore();
			spawnSpy.mockRestore();
		});

		it("can take a custom version", async () => {
			const lookpathSpy = jest
				.spyOn(lookpath, "lookpath")
				.mockResolvedValue(fakeOpPath);
			const spawnSpy = jest
				.spyOn<any, any>(child_process, "spawnSync")
				.mockReturnValue({
					error: null,
					stderr: "",
					stdout: "2.1.0",
				});

			await expect(cli.validate(">=2.0.0")).resolves.toBeUndefined();

			lookpathSpy.mockRestore();
			spawnSpy.mockRestore();
		});
	});

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
				`example command howdy --foo=bar --lorem --howdy=dolor,sit`,
			);
		});

		it("handles field assignment arguments", () => {
			const execute = executeSpy([
				["foo"],
				{
					args: [
						["username", "text", "foo"],
						["password", "concealed", "abc123"],
					],
				},
			]);
			expectOpCommand(
				execute,
				`foo username[text]=foo password[concealed]=abc123`,
			);
		});

		it("sanitizes input in commands, arguments, and flags", () => {
			const execute = executeSpy([
				['"foo'],
				{
					args: ['bar"'],
					flags: { $lorem: "`ipsum`" },
				},
			]);
			expectOpCommand(execute, `\\"foo bar\\" --\\$lorem=\\\`ipsum\\\``);
		});

		it("sanitizes field assignments", () => {
			const execute = executeSpy([
				["foo"],
				{
					args: [
						// @ts-expect-error we're testing invalid input
						["$username", "'text'", "\\foo"],
					],
				},
			]);
			expectOpCommand(execute, `foo \\$username[\\'text\\']=\\\\foo`);
		});

		it("throws if there's an error", () => {
			const message = "bar";
			expect(() =>
				executeSpy([["foo"]], { error: new Error(message) }),
			).toThrowError(new ExecutionError(message, 0));
		});

		it("throws if there's a stderr", () => {
			const stderr = "bar";
			expect(() => executeSpy([["foo"]], { stderr })).toThrowError(
				new CLIError(stderr, 0),
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
			expectOpCommand(execute, `foo --account=my.b5test.com --iso-timestamps`);
		});
	});
});
