import { assertOp, setupMockCli } from "./test-utils";

describe("InjectCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("data", () => {
		it("executes inject command with stdin data", () => {
			mockCli.inject.data("template with {{ op://vault/item/field }}");
			assertOp("inject", mockCli);
		});
	});

	describe("toFile", () => {
		it("executes inject command with output file", () => {
			mockCli.inject.toFile(
				"template with {{ op://vault/item/field }}",
				"/path/to/output.txt",
			);
			assertOp("inject --out-file=/path/to/output.txt", mockCli);
		});

		it("executes inject command with file mode", () => {
			mockCli.inject.toFile(
				"template with {{ op://vault/item/field }}",
				"/path/to/output.txt",
				{
					fileMode: "600",
				},
			);
			assertOp(
				"inject --out-file=/path/to/output.txt --file-mode=600",
				mockCli,
			);
		});

		it("executes inject command with force flag", () => {
			mockCli.inject.toFile(
				"template with {{ op://vault/item/field }}",
				"/path/to/output.txt",
				{
					force: true,
				},
			);
			assertOp("inject --out-file=/path/to/output.txt --force", mockCli);
		});

		it("executes inject command with all flags", () => {
			mockCli.inject.toFile(
				"template with {{ op://vault/item/field }}",
				"/path/to/output.txt",
				{
					fileMode: "644",
					force: true,
				},
			);
			assertOp(
				"inject --out-file=/path/to/output.txt --file-mode=644 --force",
				mockCli,
			);
		});
	});
});
