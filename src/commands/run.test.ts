import { assertOp, setupMockCli } from "./test-utils";

describe("RunCommand", () => {
	let mockCli: ReturnType<typeof setupMockCli>;

	beforeEach(() => {
		mockCli = setupMockCli();
	});

	describe("run", () => {
		it("executes run command with basic command", () => {
			mockCli.run.run("echo", ["hello"]);
			assertOp("run echo hello", mockCli);
		});

		it("executes run command with command only", () => {
			mockCli.run.run("ls");
			assertOp("run ls", mockCli);
		});

		it("executes run command with multiple arguments", () => {
			mockCli.run.run("npm", ["run", "test", "--", "--watch"]);
			assertOp("run npm run test -- --watch", mockCli);
		});

		it("executes run command with envFile flag", () => {
			mockCli.run.run("echo", ["hello"], {
				envFile: [".env", ".env.local"],
			});
			assertOp("run echo hello --env-file=.env,.env.local", mockCli);
		});

		it("executes run command with noMasking flag", () => {
			mockCli.run.run("echo", ["hello"], {
				noMasking: true,
			});
			assertOp("run echo hello --no-masking", mockCli);
		});

		it("executes run command with all flags", () => {
			mockCli.run.run("npm", ["start"], {
				envFile: [".env.production"],
				noMasking: true,
			});
			assertOp(
				"run npm start --env-file=.env.production --no-masking",
				mockCli,
			);
		});

		it("executes run command with empty args array", () => {
			mockCli.run.run("pwd", []);
			assertOp("run pwd", mockCli);
		});

		it("executes run command with complex command and flags", () => {
			mockCli.run.run("docker", ["run", "-it", "myimage"], {
				envFile: [".env.docker"],
				noMasking: false,
			});
			assertOp("run docker run -it myimage --env-file=.env.docker", mockCli);
		});

		it("executes run command with single envFile", () => {
			mockCli.run.run("node", ["app.js"], {
				envFile: [".env"],
			});
			assertOp("run node app.js --env-file=.env", mockCli);
		});

		it("executes run command with noMasking false (should not include flag)", () => {
			mockCli.run.run("echo", ["test"], {
				noMasking: false,
			});
			assertOp("run echo test", mockCli);
		});

		it("executes run command with empty flags object", () => {
			mockCli.run.run("echo", ["hello"], {});
			assertOp("run echo hello", mockCli);
		});
	});
});
