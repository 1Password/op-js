import { assertOp, setupMockCli } from "./test-utils";

describe("EventsApiCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("create", () => {
		it("executes events-api create command", () => {
			mockCli.eventsApi.create("myintegration");
			assertOp("events-api create myintegration", mockCli);
		});

		it("executes events-api create command with expiresIn flag", () => {
			mockCli.eventsApi.create("myintegration", { expiresIn: "1h" });
			assertOp("events-api create myintegration --expires-in=1h", mockCli);
		});

		it("executes events-api create command with features flag", () => {
			mockCli.eventsApi.create("myintegration", {
				features: ["signinattempts", "itemusages"],
			});
			assertOp(
				"events-api create myintegration --features=signinattempts,itemusages",
				mockCli,
			);
		});

		it("executes events-api create command with all flags", () => {
			mockCli.eventsApi.create("myintegration", {
				expiresIn: "24h",
				features: ["signinattempts"],
			});
			assertOp(
				"events-api create myintegration --expires-in=24h --features=signinattempts",
				mockCli,
			);
		});
	});
});
