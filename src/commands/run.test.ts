/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */

import { spawn, exec, spawnSync } from "child_process";
import { OpCli } from "../op-cli";

jest.mock("child_process", () => ({
	spawn: jest.fn(),
	exec: jest.fn(),
	spawnSync: jest.fn(),
}));

jest.mock("util", () => ({
	promisify: jest.fn((fn: any) => fn),
}));

describe("RunCommand", () => {
	let mockCli: OpCli;

	beforeEach(() => {
		mockCli = new OpCli();
		jest.spyOn(mockCli, "version").mockReturnValue("0.0.0");
		(spawnSync as jest.Mock).mockReturnValue({
			error: null,
			stderr: "",
			stdout: "{}",
		});
		jest.clearAllMocks();
	});

	describe("spawn", () => {
		it("executes run command with spawn", async () => {
			jest.spyOn(mockCli, "execute").mockReturnValue({
				SECRET_KEY: "secret-value",
				API_TOKEN: "token-value",
			});

			const mockChild = {
				stdout: { on: jest.fn() },
				stderr: { on: jest.fn() },
				on: jest.fn((event: string, callback: (code: number) => void) => {
					if (event === "close") {
						setTimeout(() => callback(0), 10);
					}
				}),
			};
			(spawn as unknown as jest.Mock).mockReturnValue(mockChild);

			await mockCli.run.spawn("echo", ["hello"], {
				envFile: [".env"],
				noMasking: false,
			});

			expect(mockCli.execute).toHaveBeenCalledWith(["run"], {
				args: ["echo", "hello"],
				flags: {
					envFile: [".env"],
					noMasking: false,
				},
				json: true,
			});

			expect(spawn).toHaveBeenCalledWith("echo", ["hello"], {
				env: expect.objectContaining({
					SECRET_KEY: "secret-value",
					API_TOKEN: "token-value",
				}),
				stdio: "pipe",
			});
		});
	});

	describe("exec", () => {
		it("executes run command with exec", async () => {
			jest.spyOn(mockCli, "execute").mockReturnValue({
				SECRET_KEY: "secret-value",
				API_TOKEN: "token-value",
			});

			(exec as unknown as jest.Mock).mockResolvedValue({
				stdout: "command output",
				stderr: "",
			});

			const result = await mockCli.run.exec("echo hello", {
				envFile: [".env"],
				noMasking: false,
			});

			expect(mockCli.execute).toHaveBeenCalledWith(["run"], {
				args: ["echo hello"],
				flags: {
					envFile: [".env"],
					noMasking: false,
				},
				json: true,
			});

			expect(exec).toHaveBeenCalledWith("echo hello", {
				env: expect.objectContaining({
					SECRET_KEY: "secret-value",
					API_TOKEN: "token-value",
				}),
			});

			expect(result).toEqual({
				stdout: "command output",
				stderr: "",
				exitCode: 0,
			});
		});

		it("handles command execution errors", async () => {
			jest.spyOn(mockCli, "execute").mockReturnValue({
				SECRET_KEY: "secret-value",
			});

			(exec as unknown as jest.Mock).mockRejectedValue({
				stdout: "command output",
				stderr: "command error",
				code: 1,
			});

			const result = await mockCli.run.exec("invalid-command");

			expect(result).toEqual({
				stdout: "command output",
				stderr: "command error",
				exitCode: 1,
			});
		});
	});
});
