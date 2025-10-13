import { assertOp, setupMockCli } from "./test-utils";

describe("VaultCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("create", () => {
		it("executes vault create command", () => {
			mockCli.vault.create("myvault");
			assertOp("vault create myvault --format=json", mockCli);
		});

		it("executes vault create command with description", () => {
			mockCli.vault.create("myvault", {
				description: "My vault description",
			});
			assertOp(
				"vault create myvault --description=My vault description --format=json",
				mockCli,
			);
		});

		it("executes vault create command with icon", () => {
			mockCli.vault.create("myvault", { icon: "vault-door" });
			assertOp("vault create myvault --icon=vault-door --format=json", mockCli);
		});

		it("executes vault create command with allowAdminsToManage", () => {
			mockCli.vault.create("myvault", { allowAdminsToManage: "true" });
			assertOp(
				"vault create myvault --allow-admins-to-manage=true --format=json",
				mockCli,
			);
		});

		it("executes vault create command with all flags", () => {
			mockCli.vault.create("myvault", {
				description: "My vault description",
				icon: "treasure-chest",
				allowAdminsToManage: "false",
			});
			assertOp(
				"vault create myvault --description=My vault description --icon=treasure-chest --allow-admins-to-manage=false --format=json",
				mockCli,
			);
		});
	});

	describe("delete", () => {
		it("executes vault delete command", () => {
			mockCli.vault.delete("myvault");
			assertOp("vault delete myvault", mockCli);
		});
	});

	describe("edit", () => {
		it("executes vault edit command", () => {
			mockCli.vault.edit("myvault");
			assertOp("vault edit myvault", mockCli);
		});

		it("executes vault edit command with name", () => {
			mockCli.vault.edit("myvault", { name: "newname" });
			assertOp("vault edit myvault --name=newname", mockCli);
		});

		it("executes vault edit command with description", () => {
			mockCli.vault.edit("myvault", { description: "New description" });
			assertOp("vault edit myvault --description=New description", mockCli);
		});

		it("executes vault edit command with icon", () => {
			mockCli.vault.edit("myvault", { icon: "globe" });
			assertOp("vault edit myvault --icon=globe", mockCli);
		});

		it("executes vault edit command with travelMode on", () => {
			mockCli.vault.edit("myvault", { travelMode: "on" });
			assertOp("vault edit myvault --travel-mode=on", mockCli);
		});

		it("executes vault edit command with travelMode off", () => {
			mockCli.vault.edit("myvault", { travelMode: "off" });
			assertOp("vault edit myvault --travel-mode=off", mockCli);
		});
	});

	describe("get", () => {
		it("executes vault get command", () => {
			mockCli.vault.get("myvault");
			assertOp("vault get myvault --format=json", mockCli);
		});
	});

	describe("list", () => {
		it("executes vault list command", () => {
			mockCli.vault.list();
			assertOp("vault list --format=json", mockCli);
		});

		it("executes vault list command with group filter", () => {
			mockCli.vault.list({ group: "mygroup" });
			assertOp("vault list --group=mygroup --format=json", mockCli);
		});

		it("executes vault list command with user filter", () => {
			mockCli.vault.list({ user: "myuser" });
			assertOp("vault list --user=myuser --format=json", mockCli);
		});
	});

	describe("group", () => {
		describe("grant", () => {
			it("executes vault group grant command", () => {
				mockCli.vault.group.grant({
					group: "mygroup",
					vault: "myvault",
					permissions: ["allow_viewing", "allow_editing"],
				});
				assertOp(
					"vault group grant --no-input --group=mygroup --vault=myvault --permissions=allow_viewing,allow_editing --format=json",
					mockCli,
				);
			});
		});

		describe("revoke", () => {
			it("executes vault group revoke command", () => {
				mockCli.vault.group.revoke({
					group: "mygroup",
					vault: "myvault",
					permissions: ["allow_viewing"],
				});
				assertOp(
					"vault group revoke --no-input --group=mygroup --vault=myvault --permissions=allow_viewing --format=json",
					mockCli,
				);
			});
		});

		describe("list", () => {
			it("executes vault group list command", () => {
				mockCli.vault.group.list("myvault");
				assertOp("vault group list myvault --format=json", mockCli);
			});
		});
	});

	describe("user", () => {
		describe("grant", () => {
			it("executes vault user grant command", () => {
				mockCli.vault.user.grant({
					user: "myuser",
					vault: "myvault",
					permissions: ["allow_viewing", "allow_editing"],
				});
				assertOp(
					"vault user grant --no-input --user=myuser --vault=myvault --permissions=allow_viewing,allow_editing --format=json",
					mockCli,
				);
			});
		});

		describe("revoke", () => {
			it("executes vault user revoke command", () => {
				mockCli.vault.user.revoke({
					user: "myuser",
					vault: "myvault",
					permissions: ["allow_viewing"],
				});
				assertOp(
					"vault user revoke --no-input --user=myuser --vault=myvault --permissions=allow_viewing --format=json",
					mockCli,
				);
			});
		});

		describe("list", () => {
			it("executes vault user list command", () => {
				mockCli.vault.user.list("myvault");
				assertOp("vault user list myvault --format=json", mockCli);
			});
		});
	});
});
