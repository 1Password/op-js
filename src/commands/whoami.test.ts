import { assertOp, setupMockCli } from "./test-utils";

describe("WhoamiCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("get", () => {
		it("executes whoami command", () => {
			mockCli.whoami.get();
			assertOp("whoami --format=json", mockCli);
		});

		it("executes whoami command with flags", () => {
			mockCli.whoami.get({ account: "example" });
			assertOp("whoami --account=example --format=json", mockCli);
		});
	});
});
