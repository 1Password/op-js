import { executeSpy } from "../jest.setup";
import { camelToHyphen, cli } from "./cli";

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
				{ args: ["howdy"], flags: { foo: "bar", lorem: true } },
			]);
			expect(execute).madeOpCommand(
				`example command "howdy" --foo="bar" --lorem`,
			);
		});

		it("constructs field assignments for the command", () => {
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

		it("parses command JSON responses", () => {
			const data = { foo: "bar" };
			const execute = executeSpy([["foo"]], { stdout: JSON.stringify(data) });
			expect(execute.response).toEqual(data);
		});

		it("handles non-JSON responses", () => {
			const message = "some message";
			const execute = executeSpy([["foo"]], { stdout: message });
			expect(execute.response).toEqual({ message });
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
