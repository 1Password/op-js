import { assertOp, setupMockCli } from "./test-utils";

describe("AccountCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("forget", () => {
		it("executes account forget command with account name", () => {
			mockCli.account.forget("myaccount.com");
			assertOp("account forget myaccount.com", mockCli);
		});

		it("executes account forget command without account name", () => {
			mockCli.account.forget(null);
			assertOp("account forget", mockCli);
		});

		it("executes account forget command with all flag", () => {
			mockCli.account.forget(undefined, { all: true });
			assertOp("account forget --all", mockCli);
		});
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
