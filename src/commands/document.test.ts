import { assertOp, setupMockCli } from "./test-utils";

describe("DocumentCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("create", () => {
		it("executes document create command with data", () => {
			mockCli.document.create("document content");
			assertOp("document create  --format=json", mockCli);
		});

		it("executes document create command with file path", () => {
			mockCli.document.create("/path/to/file.txt", {}, true);
			assertOp("document create /path/to/file.txt --format=json", mockCli);
		});

		it("executes document create command with all flags", () => {
			mockCli.document.create("document content", {
				fileName: "mydoc.txt",
				tags: ["tag1", "tag2"],
				title: "My Document",
				vault: "myvault",
			});
			assertOp(
				"document create  --file-name=mydoc.txt --tags=tag1,tag2 --title=My Document --vault=myvault --format=json",
				mockCli,
			);
		});
	});

	describe("delete", () => {
		it("executes document delete command", () => {
			mockCli.document.delete("mydoc");
			assertOp("document delete mydoc --format=json", mockCli);
		});

		it("executes document delete command with archive flag", () => {
			mockCli.document.delete("mydoc", {
				archive: true,
				vault: "myvault",
			});
			assertOp(
				"document delete mydoc --archive --vault=myvault --format=json",
				mockCli,
			);
		});
	});

	describe("edit", () => {
		it("executes document edit command with data", () => {
			mockCli.document.edit("mydoc", "updated content");
			assertOp("document edit mydoc  --format=json", mockCli);
		});

		it("executes document edit command with file path", () => {
			mockCli.document.edit("mydoc", "/path/to/file.txt", {}, true);
			assertOp("document edit mydoc /path/to/file.txt --format=json", mockCli);
		});

		it("executes document edit command with all flags", () => {
			mockCli.document.edit("mydoc", "updated content", {
				fileName: "newdoc.txt",
				tags: ["tag1", "tag2"],
				title: "Updated Document",
				vault: "myvault",
			});
			assertOp(
				"document edit mydoc  --file-name=newdoc.txt --tags=tag1,tag2 --title=Updated Document --vault=myvault --format=json",
				mockCli,
			);
		});
	});

	describe("get", () => {
		it("executes document get command", () => {
			mockCli.document.get("mydoc");
			assertOp("document get mydoc", mockCli);
		});

		it("executes document get command with flags", () => {
			mockCli.document.get("mydoc", {
				includeArchive: true,
				vault: "myvault",
			});
			assertOp("document get mydoc --include-archive --vault=myvault", mockCli);
		});
	});

	describe("toFile", () => {
		it("executes document get command with output file", () => {
			mockCli.document.toFile("mydoc", "/path/to/output.txt");
			assertOp("document get mydoc --output=/path/to/output.txt", mockCli);
		});

		it("executes document get command with output file and other flags", () => {
			mockCli.document.toFile("mydoc", "/path/to/output.txt", {
				includeArchive: true,
				vault: "myvault",
			});
			assertOp(
				"document get mydoc --output=/path/to/output.txt --include-archive --vault=myvault",
				mockCli,
			);
		});
	});

	describe("list", () => {
		it("executes document list command", () => {
			mockCli.document.list();
			assertOp("document list --format=json", mockCli);
		});

		it("executes document list command with flags", () => {
			mockCli.document.list({
				includeArchive: true,
				vault: "myvault",
			});
			assertOp(
				"document list --include-archive --vault=myvault --format=json",
				mockCli,
			);
		});
	});
});
