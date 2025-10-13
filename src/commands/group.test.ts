import { assertOp, setupMockCli } from "./test-utils";

describe("GroupCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("create", () => {
		it("executes group create command", () => {
			mockCli.group.create("mygroup");
			assertOp("group create mygroup --format=json", mockCli);
		});

		it("executes group create command with description", () => {
			mockCli.group.create("mygroup", {
				description: "My group description",
			});
			assertOp(
				"group create mygroup --description=My group description --format=json",
				mockCli,
			);
		});
	});

	describe("delete", () => {
		it("executes group delete command", () => {
			mockCli.group.delete("mygroup");
			assertOp("group delete mygroup", mockCli);
		});
	});

	describe("edit", () => {
		it("executes group edit command", () => {
			mockCli.group.edit("mygroup");
			assertOp("group edit mygroup", mockCli);
		});

		it("executes group edit command with name and description", () => {
			mockCli.group.edit("mygroup", {
				name: "newname",
				description: "New description",
			});
			assertOp(
				"group edit mygroup --name=newname --description=New description",
				mockCli,
			);
		});
	});

	describe("get", () => {
		it("executes group get command", () => {
			mockCli.group.get("mygroup");
			assertOp("group get mygroup --format=json", mockCli);
		});
	});

	describe("list", () => {
		it("executes group list command", () => {
			mockCli.group.list();
			assertOp("group list --format=json", mockCli);
		});

		it("executes group list command with vault filter", () => {
			mockCli.group.list({ vault: "myvault" });
			assertOp("group list --vault=myvault --format=json", mockCli);
		});

		it("executes group list command with user filter", () => {
			mockCli.group.list({ user: "myuser" });
			assertOp("group list --user=myuser --format=json", mockCli);
		});
	});

	describe("user", () => {
		describe("grant", () => {
			it("executes group user grant command", () => {
				mockCli.group.user.grant({
					group: "mygroup",
					user: "myuser",
					role: "MEMBER",
				});
				assertOp(
					"group user grant --group=mygroup --user=myuser --role=MEMBER",
					mockCli,
				);
			});

			it("executes group user grant command with MANAGER role", () => {
				mockCli.group.user.grant({
					group: "mygroup",
					user: "myuser",
					role: "MANAGER",
				});
				assertOp(
					"group user grant --group=mygroup --user=myuser --role=MANAGER",
					mockCli,
				);
			});
		});

		describe("list", () => {
			it("executes group user list command", () => {
				mockCli.group.user.list("mygroup");
				assertOp("group user list mygroup --format=json", mockCli);
			});
		});

		describe("revoke", () => {
			it("executes group user revoke command", () => {
				mockCli.group.user.revoke({
					group: "mygroup",
					user: "myuser",
				});
				assertOp("group user revoke --group=mygroup --user=myuser", mockCli);
			});
		});
	});
});
