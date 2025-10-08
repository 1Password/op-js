import { assertOp, setupMockCli } from "./test-utils";

describe("AccountCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("get", () => {
		it("executes account get command", () => {
			mockCli.account.get();
			assertOp("account get --format=json", mockCli);
		});

		it("executes account get command with flags", () => {
			mockCli.account.get({ account: "myaccount.com" });
			assertOp("account get --account=myaccount.com --format=json", mockCli);
		});
	});

	describe("list", () => {
		it("executes account list command", () => {
			mockCli.account.list();
			assertOp("account list --format=json", mockCli);
		});

		it("executes account list command with flags", () => {
			mockCli.account.list({ account: "myaccount.com" });
			assertOp("account list --account=myaccount.com --format=json", mockCli);
		});
	});
});
