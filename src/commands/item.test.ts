import { assertOp, setupMockCli } from "./test-utils";

describe("ItemCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("create", () => {
		it("executes item create command with field assignments", () => {
			mockCli.item.create([
				["username", "text", "myuser"],
				["password", "concealed", "mypass"],
			]);
			assertOp("item create --format=json", mockCli);
		});

		it("executes item create command with category", () => {
			mockCli.item.create([["username", "text", "myuser"]], {
				category: "Login",
			});
			assertOp("item create --category=Login --format=json", mockCli);
		});

		it("executes item create command with all flags", () => {
			mockCli.item.create(
				[
					["username", "text", "myuser"],
					["password", "concealed", "mypass"],
				],
				{
					category: "Login",
					title: "My Login",
					tags: ["tag1", "tag2"],
					vault: "myvault",
					url: "https://example.com",
					generatePassword: true,
				},
			);
			assertOp(
				"item create --category=Login --title=My\\ Login --tags=tag1,tag2 --vault=myvault --url=https://example.com --generate-password --format=json",
				mockCli,
			);
		});

		it("executes item create command with dry run", () => {
			mockCli.item.create([["username", "text", "myuser"]], { dryRun: true });
			assertOp("item create --dry-run --format=json", mockCli);
		});

		it("executes item create command with template", () => {
			mockCli.item.create([["username", "text", "myuser"]], {
				template: "Login",
			});
			assertOp("item create --template=Login --format=json", mockCli);
		});
	});

	describe("delete", () => {
		it("executes item delete command", () => {
			mockCli.item.delete("myitem");
			assertOp("item delete myitem", mockCli);
		});

		it("executes item delete command with archive flag", () => {
			mockCli.item.delete("myitem", {
				archive: true,
				vault: "myvault",
			});
			assertOp("item delete myitem --archive --vault=myvault", mockCli);
		});
	});

	describe("edit", () => {
		it("executes item edit command", () => {
			mockCli.item.edit("myitem", [["username", "text", "newuser"]]);
			assertOp(
				"item edit myitem username[text]=newuser --format=json",
				mockCli,
			);
		});

		it("executes item edit command with all flags", () => {
			mockCli.item.edit("myitem", [["username", "text", "newuser"]], {
				title: "Updated Item",
				tags: ["tag1", "tag2"],
				vault: "myvault",
				url: "https://example.com",
				generatePassword: "strong",
			});
			assertOp(
				"item edit myitem username[text]=newuser --title=Updated\\ Item --tags=tag1,tag2 --vault=myvault --url=https://example.com --generate-password=strong --format=json",
				mockCli,
			);
		});
	});

	describe("get", () => {
		it("executes item get command", () => {
			mockCli.item.get("myitem");
			assertOp("item get myitem --format=json", mockCli);
		});

		it("executes item get command with fields filter", () => {
			mockCli.item.get("myitem", {
				fields: { label: ["username", "password"] },
			});
			assertOp(
				"item get myitem --fields=label=username,label=password --format=json",
				mockCli,
			);
		});

		it("executes item get command with type filter", () => {
			mockCli.item.get("myitem", {
				fields: { type: ["string", "concealed"] },
			});
			assertOp(
				"item get myitem --fields=type=string,type=concealed --format=json",
				mockCli,
			);
		});

		it("executes item get command with includeArchive flag", () => {
			mockCli.item.get("myitem", {
				includeArchive: true,
				vault: "myvault",
			});
			assertOp(
				"item get myitem --include-archive --vault=myvault --format=json",
				mockCli,
			);
		});
	});

	describe("otp", () => {
		it("executes item get command with otp flag", () => {
			mockCli.item.otp("myitem");
			assertOp("item get myitem --otp", mockCli);
		});

		it("executes item get command with otp and other flags", () => {
			mockCli.item.otp("myitem", {
				includeArchive: true,
				vault: "myvault",
			});
			assertOp(
				"item get myitem --otp --include-archive --vault=myvault",
				mockCli,
			);
		});
	});

	describe("shareLink", () => {
		it("executes item get command with shareLink flag", () => {
			mockCli.item.shareLink("myitem");
			assertOp("item get myitem --share-link", mockCli);
		});
	});

	describe("list", () => {
		it("executes item list command", () => {
			mockCli.item.list();
			assertOp("item list --format=json", mockCli);
		});

		it("executes item list command with categories filter", () => {
			mockCli.item.list({ categories: ["Login", "Password"] });
			assertOp("item list --categories=Login,Password --format=json", mockCli);
		});

		it("executes item list command with all flags", () => {
			mockCli.item.list({
				categories: ["Login"],
				includeArchive: true,
				long: true,
				tags: ["tag1", "tag2"],
				vault: "myvault",
			});
			assertOp(
				"item list --categories=Login --include-archive --long --tags=tag1,tag2 --vault=myvault --format=json",
				mockCli,
			);
		});
	});

	describe("share", () => {
		it("executes item share command", () => {
			mockCli.item.share("myitem");
			assertOp("item share myitem", mockCli);
		});

		it("executes item share command with all flags", () => {
			mockCli.item.share("myitem", {
				emails: ["user1@example.com", "user2@example.com"],
				expiry: "1h",
				vault: "myvault",
				viewOnce: true,
			});
			assertOp(
				"item share myitem --emails=user1@example.com,user2@example.com --expiry=1h --vault=myvault --view-once",
				mockCli,
			);
		});
	});

	describe("template", () => {
		describe("get", () => {
			it("executes item template get command", () => {
				mockCli.item.template.get("Login");
				assertOp("item template get Login --format=json", mockCli);
			});
		});

		describe("list", () => {
			it("executes item template list command", () => {
				mockCli.item.template.list();
				assertOp("item template list --format=json", mockCli);
			});
		});
	});
});
