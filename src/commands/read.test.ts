import { assertOp, setupMockCli } from "./test-utils";

describe("ReadCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("parse", () => {
		it("executes read command with secret reference", () => {
			mockCli.read.parse("op://vault/item/field");
			assertOp("read op://vault/item/field", mockCli);
		});

		it("executes read command with noNewline flag", () => {
			mockCli.read.parse("op://vault/item/field", { noNewline: true });
			assertOp("read op://vault/item/field --no-newline", mockCli);
		});
	});

	describe("toFile", () => {
		it("executes read command with output file", () => {
			mockCli.read.toFile("op://vault/item/field", "/path/to/output.txt");
			assertOp(
				"read op://vault/item/field --out-file=/path/to/output.txt",
				mockCli,
			);
		});

		it("executes read command with output file and noNewline flag", () => {
			mockCli.read.toFile("op://vault/item/field", "/path/to/output.txt", {
				noNewline: true,
			});
			assertOp(
				"read op://vault/item/field --out-file=/path/to/output.txt --no-newline",
				mockCli,
			);
		});
	});
});
