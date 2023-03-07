import { CLIError, ExecutionError, ValidationError } from "./errors";

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

describe("ExecutionError", () => {
	test("creates an instance with the correct message and status", () => {
		const message = "Execution failed";
		const status = 500;
		const error = new ExecutionError(message, status);

		expect(error.message).toEqual(message);
		expect(error.status).toEqual(status);
		expect(error.name).toEqual("ExecutionError");
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
