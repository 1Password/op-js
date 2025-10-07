import { assertOp, setupMockCli } from "./test-utils";

describe("ConnectCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("group", () => {
		describe("grant", () => {
			it("executes connect group grant command", () => {
				mockCli.connect.group.grant("mygroup");
				assertOp("connect group grant --group=mygroup", mockCli);
			});

			it("executes connect group grant command with all flags", () => {
				mockCli.connect.group.grant("mygroup", {
					allServers: true,
					server: "myserver",
				});
				assertOp(
					"connect group grant --group=mygroup --all-servers --server=myserver",
					mockCli,
				);
			});
		});

		describe("revoke", () => {
			it("executes connect group revoke command", () => {
				mockCli.connect.group.revoke("mygroup");
				assertOp("connect group revoke --group=mygroup", mockCli);
			});

			it("executes connect group revoke command with all flags", () => {
				mockCli.connect.group.revoke("mygroup", {
					allServers: true,
					server: "myserver",
				});
				assertOp(
					"connect group revoke --group=mygroup --all-servers --server=myserver",
					mockCli,
				);
			});
		});
	});

	describe("server", () => {
		describe("create", () => {
			it("executes connect server create command", () => {
				mockCli.connect.server.create("myserver");
				assertOp("connect server create myserver", mockCli);
			});

			it("executes connect server create command with vaults", () => {
				mockCli.connect.server.create("myserver", {
					vaults: ["vault1", "vault2"],
				});
				assertOp(
					"connect server create myserver --vaults=vault1,vault2",
					mockCli,
				);
			});
		});

		describe("delete", () => {
			it("executes connect server delete command", () => {
				mockCli.connect.server.delete("myserver");
				assertOp("connect server delete myserver --format=json", mockCli);
			});
		});

		describe("edit", () => {
			it("executes connect server edit command", () => {
				mockCli.connect.server.edit("myserver", "newname");
				assertOp("connect server edit myserver --name=newname", mockCli);
			});
		});

		describe("get", () => {
			it("executes connect server get command", () => {
				mockCli.connect.server.get("myserver");
				assertOp("connect server get myserver --format=json", mockCli);
			});
		});

		describe("list", () => {
			it("executes connect server list command", () => {
				mockCli.connect.server.list();
				assertOp("connect server list --format=json", mockCli);
			});
		});
	});

	describe("token", () => {
		describe("create", () => {
			it("executes connect token create command", () => {
				mockCli.connect.token.create("mytoken", "myserver");
				assertOp("connect token create mytoken --server=myserver", mockCli);
			});

			it("executes connect token create command with all flags", () => {
				mockCli.connect.token.create("mytoken", "myserver", {
					expiresIn: "1h",
					vaults: ["vault1", "vault2"],
				});
				assertOp(
					"connect token create mytoken --server=myserver --expires-in=1h --vaults=vault1,vault2",
					mockCli,
				);
			});
		});

		describe("delete", () => {
			it("executes connect token delete command", () => {
				mockCli.connect.token.delete("mytoken", { server: "myserver" });
				assertOp("connect token delete mytoken --server=myserver", mockCli);
			});
		});

		describe("edit", () => {
			it("executes connect token edit command", () => {
				mockCli.connect.token.edit("mytoken", "newname", {
					server: "myserver",
				});
				assertOp(
					"connect token edit mytoken --name=newname --server=myserver",
					mockCli,
				);
			});
		});

		describe("list", () => {
			it("executes connect token list command", () => {
				mockCli.connect.token.list({ server: "myserver" });
				assertOp("connect token list --server=myserver --format=json", mockCli);
			});
		});
	});

	describe("vault", () => {
		describe("grant", () => {
			it("executes connect vault grant command", () => {
				mockCli.connect.vault.grant("myserver", "myvault");
				assertOp(
					"connect vault grant --server=myserver --vault=myvault",
					mockCli,
				);
			});
		});

		describe("revoke", () => {
			it("executes connect vault revoke command", () => {
				mockCli.connect.vault.revoke("myserver", "myvault");
				assertOp(
					"connect vault revoke --server=myserver --vault=myvault",
					mockCli,
				);
			});
		});
	});
});
