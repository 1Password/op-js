import { assertOp, setupMockCli } from "./test-utils";

describe("UserCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("confirm", () => {
		it("executes user confirm command", () => {
			mockCli.user.confirm("user@example.com");
			assertOp("user confirm user@example.com", mockCli);
		});
	});

	describe("confirmAll", () => {
		it("executes user confirm command with all flag", () => {
			mockCli.user.confirmAll();
			assertOp("user confirm --all", mockCli);
		});
	});

	describe("delete", () => {
		it("executes user delete command", () => {
			mockCli.user.delete("user@example.com");
			assertOp("user delete user@example.com", mockCli);
		});
	});

	describe("edit", () => {
		it("executes user edit command", () => {
			mockCli.user.edit("user@example.com");
			assertOp("user edit user@example.com", mockCli);
		});

		it("executes user edit command with name", () => {
			mockCli.user.edit("user@example.com", { name: "New Name" });
			assertOp("user edit user@example.com --name=New\\ Name", mockCli);
		});

		it("executes user edit command with travelMode on", () => {
			mockCli.user.edit("user@example.com", { travelMode: "on" });
			assertOp("user edit user@example.com --travel-mode=on", mockCli);
		});

		it("executes user edit command with travelMode off", () => {
			mockCli.user.edit("user@example.com", { travelMode: "off" });
			assertOp("user edit user@example.com --travel-mode=off", mockCli);
		});
	});

	describe("get", () => {
		it("executes user get command", () => {
			mockCli.user.get("user@example.com");
			assertOp("user get user@example.com --format=json", mockCli);
		});
	});

	describe("me", () => {
		it("executes user get command with me flag", () => {
			mockCli.user.me();
			assertOp("user get --me --format=json", mockCli);
		});
	});

	describe("fingerprint", () => {
		it("executes user get command with fingerprint flag", () => {
			mockCli.user.fingerprint("user@example.com");
			assertOp("user get user@example.com --fingerprint", mockCli);
		});
	});

	describe("publicKey", () => {
		it("executes user get command with publicKey flag", () => {
			mockCli.user.publicKey("user@example.com");
			assertOp("user get user@example.com --public-key", mockCli);
		});
	});

	describe("list", () => {
		it("executes user list command", () => {
			mockCli.user.list();
			assertOp("user list --format=json", mockCli);
		});

		it("executes user list command with group filter", () => {
			mockCli.user.list({ group: "mygroup" });
			assertOp("user list --group=mygroup --format=json", mockCli);
		});

		it("executes user list command with vault filter", () => {
			mockCli.user.list({ vault: "myvault" });
			assertOp("user list --vault=myvault --format=json", mockCli);
		});
	});

	describe("provision", () => {
		it("executes user provision command", () => {
			mockCli.user.provision("user@example.com", "User Name", {
				language: "en",
			});
			assertOp(
				"user provision --email=user@example.com --name=User\\ Name --language=en --format=json",
				mockCli,
			);
		});
	});

	describe("reactivate", () => {
		it("executes user reactivate command", () => {
			mockCli.user.reactivate("user@example.com");
			assertOp("user reactivate user@example.com", mockCli);
		});
	});

	describe("suspend", () => {
		it("executes user suspend command", () => {
			mockCli.user.suspend("user@example.com");
			assertOp("user suspend user@example.com", mockCli);
		});

		it("executes user suspend command with deauthorizeDevicesAfter", () => {
			mockCli.user.suspend("user@example.com", {
				deauthorizeDevicesAfter: "1h",
			});
			assertOp(
				"user suspend user@example.com --deauthorize-devices-after=1h",
				mockCli,
			);
		});
	});
});
