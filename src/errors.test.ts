import {
	CLIError,
	ExecutionError,
	VerificationError,
	VerificationErrorType,
} from "./errors";

describe("VerificationError", () => {
	describe("not-found", () => {
		it("sets the correct message", () => {
			const error = new VerificationError("not-found");
			expect(error.message).toBe("Could not find `op` executable");
			expect(error.name).toBe("VerificationError");
			expect(error.type).toBe("not-found");
			expect(error.requiredVersion).toBeUndefined();
			expect(error.currentVersion).toBeUndefined();
		});
	});

	describe("version", () => {
		const requiredVersion = "3.2.1";
		const currentVersion = "1.2.3";

		it("sets the correct message", () => {
			const error = new VerificationError(
				"version",
				requiredVersion,
				currentVersion,
			);
			expect(error.message).toBe(
				`CLI version ${currentVersion} does not satisfy required version ${requiredVersion}`,
			);
			expect(error.name).toBe("VerificationError");
			expect(error.type).toBe("version");
			expect(error.requiredVersion).toBe(requiredVersion);
			expect(error.currentVersion).toBe(currentVersion);
		});

		it("handles undefined versions", () => {
			const error = new VerificationError("version");
			expect(error.message).toBe(
				"CLI version undefined does not satisfy required version undefined",
			);
			expect(error.requiredVersion).toBeUndefined();
			expect(error.currentVersion).toBeUndefined();
		});

		it("handles only required version", () => {
			const error = new VerificationError("version", requiredVersion);
			expect(error.message).toBe(
				`CLI version undefined does not satisfy required version ${requiredVersion}`,
			);
			expect(error.requiredVersion).toBe(requiredVersion);
			expect(error.currentVersion).toBeUndefined();
		});

		it("handles only current version", () => {
			const error = new VerificationError("version", undefined, currentVersion);
			expect(error.message).toBe(
				`CLI version ${currentVersion} does not satisfy required version undefined`,
			);
			expect(error.requiredVersion).toBeUndefined();
			expect(error.currentVersion).toBe(currentVersion);
		});
	});

	describe("error inheritance", () => {
		it("inherits from Error", () => {
			const error = new VerificationError("not-found");
			expect(error).toBeInstanceOf(Error);
			expect(error.stack).toBeDefined();
		});

		it("can be caught and re-thrown", () => {
			const originalError = new VerificationError("not-found");
			expect(() => {
				try {
					throw originalError;
				} catch (e) {
					if (e instanceof VerificationError) {
						throw e;
					}
				}
			}).toThrow(VerificationError);
		});
	});
});

describe("ExecutionError", () => {
	describe("basic functionality", () => {
		it("sets the correct message and status", () => {
			const message = "Test error message";
			const status = 1;
			const error = new ExecutionError(message, status);

			expect(error.message).toBe(message);
			expect(error.status).toBe(status);
			expect(error.name).toBe("ExecutionError");
		});

		it("handles different status codes", () => {
			const error1 = new ExecutionError("Error 1", 0);
			const error2 = new ExecutionError("Error 2", 255);
			const error3 = new ExecutionError("Error 3", -1);

			expect(error1.status).toBe(0);
			expect(error2.status).toBe(255);
			expect(error3.status).toBe(-1);
		});

		it("handles empty message", () => {
			const error = new ExecutionError("", 1);
			expect(error.message).toBe("");
			expect(error.status).toBe(1);
		});
	});

	describe("error inheritance", () => {
		it("inherits from Error", () => {
			const error = new ExecutionError("test", 1);
			expect(error).toBeInstanceOf(Error);
			expect(error.stack).toBeDefined();
		});

		it("can be caught and re-thrown", () => {
			const originalError = new ExecutionError("test", 1);
			expect(() => {
				try {
					throw originalError;
				} catch (e) {
					if (e instanceof ExecutionError) {
						throw e;
					}
				}
			}).toThrow(ExecutionError);
		});
	});
});

describe("CLIError", () => {
	describe("error parsing", () => {
		const dateTime = "2022/06/04 17:59:15";
		const message = "authorization prompt dismissed, please try again";

		it("parses a valid error message from op CLI", () => {
			const error = new CLIError(`[ERROR] ${dateTime} ${message}`, 1);

			expect(error.message).toBe(message);
			expect(error.timestamp).toEqual(new Date(dateTime));
			expect(error.originalMessage).toBe(`[ERROR] ${dateTime} ${message}`);
			expect(error.status).toBe(1);
			expect(error.name).toBe("CLIError");
		});

		it("handles different date formats", () => {
			const dateTime1 = "2023/12/25 09:30:45";
			const message1 = "test error";
			const error1 = new CLIError(`[ERROR] ${dateTime1} ${message1}`, 2);

			expect(error1.message).toBe(message1);
			expect(error1.timestamp).toEqual(new Date(dateTime1));
		});

		it("handles different error messages", () => {
			const dateTime = "2022/01/01 00:00:00";
			const message = "different error message";
			const error = new CLIError(`[ERROR] ${dateTime} ${message}`, 3);

			expect(error.message).toBe(message);
			expect(error.timestamp).toEqual(new Date(dateTime));
		});
	});

	describe("invalid error handling", () => {
		it("gracefully handles not being able to parse op error", () => {
			const invalidError = "invalid error";
			const error = new CLIError(invalidError, 1);

			expect(error.timestamp).toBeUndefined();
			expect(error.message).toBe("Unknown error");
			expect(error.originalMessage).toBe(invalidError);
			expect(error.status).toBe(1);
			expect(error.name).toBe("CLIError");
		});

		it("handles empty error message", () => {
			const error = new CLIError("", 1);

			expect(error.timestamp).toBeUndefined();
			expect(error.message).toBe("Unknown error");
			expect(error.originalMessage).toBe("");
			expect(error.status).toBe(1);
		});

		it("handles malformed error messages", () => {
			const malformedErrors = [
				"[ERROR] invalid date format message",
				"not an error message",
				"[ERROR]",
				"[ERROR] 2022/06/04 17:59:15",
			];

			malformedErrors.forEach((malformedError) => {
				const error = new CLIError(malformedError, 1);
				expect(error.timestamp).toBeUndefined();
				expect(error.message).toBe("Unknown error");
				expect(error.originalMessage).toBe(malformedError);
			});
		});

		it("handles partial error messages", () => {
			const partialError = "[ERROR] 2022/06/04 17:59:15";
			const error = new CLIError(partialError, 1);

			expect(error.timestamp).toBeUndefined();
			expect(error.message).toBe("Unknown error");
			expect(error.originalMessage).toBe(partialError);
		});
	});

	describe("error inheritance", () => {
		it("inherits from ExecutionError", () => {
			const error = new CLIError("test", 1);
			expect(error).toBeInstanceOf(ExecutionError);
			expect(error).toBeInstanceOf(Error);
		});

		it("can be caught as ExecutionError", () => {
			const originalError = new CLIError("test", 1);
			expect(() => {
				try {
					throw originalError;
				} catch (e) {
					if (e instanceof ExecutionError) {
						throw e;
					}
				}
			}).toThrow(ExecutionError);
		});

		it("can be caught as CLIError", () => {
			const originalError = new CLIError("test", 1);
			expect(() => {
				try {
					throw originalError;
				} catch (e) {
					if (e instanceof CLIError) {
						throw e;
					}
				}
			}).toThrow(CLIError);
		});
	});

	describe("status code handling", () => {
		it("preserves status code from parent", () => {
			const error = new CLIError("test", 42);
			expect(error.status).toBe(42);
		});

		it("handles zero status code", () => {
			const error = new CLIError("test", 0);
			expect(error.status).toBe(0);
		});

		it("handles negative status code", () => {
			const error = new CLIError("test", -1);
			expect(error.status).toBe(-1);
		});
	});

	describe("regex edge cases", () => {
		it("handles error messages with brackets", () => {
			const dateTime = "2022/06/04 17:59:15";
			const message = "error with [brackets] in message";
			const error = new CLIError(`[ERROR] ${dateTime} ${message}`, 1);

			expect(error.message).toBe(message);
			expect(error.timestamp).toEqual(new Date(dateTime));
		});

		it("handles error messages with special characters", () => {
			const dateTime = "2022/06/04 17:59:15";
			const message = "error with $pecial ch@rs & symbols!";
			const error = new CLIError(`[ERROR] ${dateTime} ${message}`, 1);

			expect(error.message).toBe(message);
			expect(error.timestamp).toEqual(new Date(dateTime));
		});

		it("handles multiline error messages", () => {
			const dateTime = "2022/06/04 17:59:15";
			const message = "error with multiple lines";
			const error = new CLIError(`[ERROR] ${dateTime} ${message}`, 1);

			expect(error.message).toBe(message);
			expect(error.timestamp).toEqual(new Date(dateTime));
		});
	});
});

describe("Error type exports", () => {
	it("exports VerificationErrorType", () => {
		// This test ensures the type is properly exported
		const type: VerificationErrorType = "not-found";
		expect(type).toBe("not-found");
	});

	it("all error types are properly exported", () => {
		expect(VerificationError).toBeDefined();
		expect(ExecutionError).toBeDefined();
		expect(CLIError).toBeDefined();
	});
});
