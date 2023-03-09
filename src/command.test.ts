import { CLIError, ExecutionError } from "./errors";
import { executeSpy, expectOpCommand } from "./test-utils";

describe("Command", () => {
	describe("execute()", () => {
		it("constructs and calls an op command", () => {
			const execute = executeSpy({
				command: ["example", "command"],
				opts: {
					args: ["howdy"],
					flags: { foo: "bar", lorem: true, howdy: ["dolor", "sit"] },
				},
			});

			expectOpCommand(
				execute,
				"example command howdy --foo=bar --lorem --howdy=dolor,sit",
			);
		});

		it("throws on invalid args", () => {
			expect(() =>
				executeSpy({
					command: ["foo"],
					opts: {
						// @ts-expect-error test invalid type
						args: [123],
					},
				}),
			).toThrowError(new TypeError("Invalid argument"));
		});

		it("throws if there's an execution error", () => {
			const message = "bar";

			expect(() =>
				executeSpy({ command: ["foo"] }, { error: new Error(message) }),
			).toThrowError(new ExecutionError(message, 0));
		});

		it("throws if there's a stderr", () => {
			const stderr = "bar";

			expect(() => executeSpy({ command: ["foo"] }, { stderr })).toThrowError(
				new CLIError(stderr, 0),
			);
		});

		it("parses command JSON responses by default", () => {
			const data = { foo: "bar" };

			const execute = executeSpy(
				{ command: ["foo"] },
				{ stdout: JSON.stringify(data) },
			);

			expect(execute.response).toEqual(data);
		});

		it("can also return non-JSON responses", () => {
			const message = "some message";

			const execute = executeSpy(
				{ command: ["foo"], opts: { json: false } },
				{
					stdout: message,
				},
			);

			expect(execute.response).toEqual(message);
		});

		it("takes in and sets env vars", () => {
			const env = {
				FOO: "lorem",
				BAR: "ipsum",
			};

			const execute = executeSpy({ command: ["foo"], env });

			expect(execute.call[2].env).toEqual(expect.objectContaining(env));
		});
	});
});
