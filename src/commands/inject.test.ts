import { ExecutionError } from "../errors";
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

	describe("version-specific behavior", () => {
		it("handles inject command with version >=2.6.2 on non-Windows", () => {
			const originalPlatform = process.platform;
			Object.defineProperty(process, "platform", { value: "darwin" });

			// Mock the version to be >=2.6.2
			jest.spyOn(mockCli, "version").mockReturnValue("2.6.2");

			mockCli.inject.data("test input");

			// Should include inFile flag for non-Windows platforms
			assertOp("inject --in-file=/dev/stdin", mockCli);

			Object.defineProperty(process, "platform", { value: originalPlatform });
			jest.restoreAllMocks();
		});

		it("throws error for inject command with version >=2.6.2 on Windows", () => {
			const originalPlatform = process.platform;
			Object.defineProperty(process, "platform", { value: "win32" });

			// Mock the version to be >=2.6.2
			jest.spyOn(mockCli, "version").mockReturnValue("2.6.2");

			expect(() => {
				mockCli.inject.data("test input");
			}).toThrow(
				new ExecutionError(
					"Inject is not supported on Windows for version >=2.6.2 of the CLI",
					1,
				),
			);

			Object.defineProperty(process, "platform", { value: originalPlatform });
			jest.restoreAllMocks();
		});

		it("does not modify inject command for version <2.6.2", () => {
			// Mock the version to be <2.6.2
			jest.spyOn(mockCli, "version").mockReturnValue("2.6.1");

			mockCli.inject.data("test input");

			// Should not include inFile flag for older versions
			assertOp("inject", mockCli);

			jest.restoreAllMocks();
		});

		it("handles inject command without stdin on version >=2.6.2", () => {
			const originalPlatform = process.platform;
			Object.defineProperty(process, "platform", { value: "darwin" });

			// Mock the version to be >=2.6.2
			jest.spyOn(mockCli, "version").mockReturnValue("2.6.2");

			// Call toFile without stdin to test the behavior
			mockCli.inject.toFile("", "/path/to/output.txt");

			// Should include inFile flag even without stdin
			assertOp(
				"inject --out-file=/path/to/output.txt --in-file=/dev/stdin",
				mockCli,
			);

			Object.defineProperty(process, "platform", { value: originalPlatform });
			jest.restoreAllMocks();
		});
	});
});
