import { assertOp, setupMockCli } from "./test-utils";

describe("ServiceAccountCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("create", () => {
		it("executes service-account create command", () => {
			mockCli.serviceAccount.create("Test Service Account");
			assertOp(
				"service-account create Test\\ Service\\ Account --format=json",
				mockCli,
			);
		});

		it("executes service-account create command with vault flags", () => {
			mockCli.serviceAccount.create("Test Service Account", {
				vault: ["vault1:read_items", "vault2:write_items"],
			});
			assertOp(
				"service-account create Test\\ Service\\ Account --vault=vault1:read_items,vault2:write_items --format=json",
				mockCli,
			);
		});

		it("executes service-account create command with expiresIn flag", () => {
			mockCli.serviceAccount.create("Test Service Account", {
				expiresIn: "1y",
			});
			assertOp(
				"service-account create Test\\ Service\\ Account --expires-in=1y --format=json",
				mockCli,
			);
		});

		it("executes service-account create command with all flags", () => {
			mockCli.serviceAccount.create("Test Service Account", {
				vault: ["vault1:read_items", "vault2:write_items"],
				expiresIn: "1y",
			});
			assertOp(
				"service-account create Test\\ Service\\ Account --vault=vault1:read_items,vault2:write_items --expires-in=1y --format=json",
				mockCli,
			);
		});
	});

	describe("ratelimit", () => {
		it("executes service-account ratelimit command", () => {
			mockCli.serviceAccount.ratelimit("sa_123456789");
			assertOp("service-account ratelimit sa_123456789 --format=json", mockCli);
		});

		it("executes service-account ratelimit command with flags", () => {
			mockCli.serviceAccount.ratelimit("sa_123456789", {
				account: "test-account",
			});
			assertOp(
				"service-account ratelimit sa_123456789 --account=test-account --format=json",
				mockCli,
			);
		});
	});
});
