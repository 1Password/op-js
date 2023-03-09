import child_process from "child_process";
import * as lookpath from "lookpath";
import OPJS, { createFieldAssignment } from ".";
import { ExecutionError, ValidationError } from "./errors";

jest.mock("lookpath");
jest.mock("child_process");

describe("createFieldAssignment", () => {
	it("creates a field assignment from a field assignment object", () => {
		expect(createFieldAssignment(["username", "text", "foo"])).toEqual(
			"username[text]=foo",
		);
		expect(createFieldAssignment(["password", "concealed", "abc123"])).toEqual(
			"password[concealed]=abc123",
		);
	});
});

const fakeOpPath = "/path/to/op";

describe("OPJS", () => {
	it("can set connect info as env vars", () => {
		const connectInfo = {
			host: "https://connect.myserver.com",
			token: "1kjhd9872hd981865s",
		};

		const cli = new OPJS({
			connectInfo,
		});

		const spy = child_process.spawnSync as jest.Mock;
		jest.spyOn<any, any>(child_process, "spawnSync").mockReturnValue({
			error: null,
			stderr: "",
			stdout: "{}",
		});

		// Any command will do
		cli.whoami();

		expect(
			(spy.mock.calls[0] as [null, null, { env: NodeJS.ProcessEnv }])[2].env,
		).toEqual(
			expect.objectContaining({
				OP_CONNECT_HOST: connectInfo.host,
				OP_CONNECT_TOKEN: connectInfo.token,
			}),
		);

		spy.mockReset();
	});

	it("can set a service account token env var", () => {
		const serviceAccountToken = "1kjhd9872hd981865s";

		const cli = new OPJS({
			serviceAccountToken,
		});

		const spy = child_process.spawnSync as jest.Mock;
		jest.spyOn<any, any>(child_process, "spawnSync").mockReturnValue({
			error: null,
			stderr: "",
			stdout: "{}",
		});

		// Any command will do
		cli.whoami();

		expect(
			(spy.mock.calls[0] as [null, null, { env: NodeJS.ProcessEnv }])[2].env,
		).toEqual(
			expect.objectContaining({
				OP_SERVICE_ACCOUNT_TOKEN: serviceAccountToken,
			}),
		);

		spy.mockReset();
	});

	it("throws error when both connect and service account details are set", () => {
		expect(() => {
			new OPJS({
				serviceAccountToken: "1kjhd9872hd981865s",
				connectInfo: {
					host: "https://connect.myserver.com",
					token: "1kjhd9872hd981865s",
				},
			});
		}).toThrow(
			new ExecutionError(
				"Cannot set both Connect info and Service Account token",
				1,
			),
		);
	});

	it("can set the integration details as env vars", () => {
		const integration = {
			name: "foo-bar",
			id: "FOO",
			build: "120239",
		};

		const cli = new OPJS({
			integration,
		});

		const spy = child_process.spawnSync as jest.Mock;
		jest.spyOn<any, any>(child_process, "spawnSync").mockReturnValue({
			error: null,
			stderr: "",
			stdout: "{}",
		});

		// Any command will do
		cli.whoami();

		expect(
			(spy.mock.calls[0] as [null, null, { env: NodeJS.ProcessEnv }])[2].env,
		).toEqual(
			expect.objectContaining({
				OP_INTEGRATION_NAME: integration.name,
				OP_INTEGRATION_ID: integration.id,
				OP_INTEGRATION_BUILDNUMBER: integration.build,
			}),
		);

		spy.mockReset();
	});

	describe("validate", () => {
		it("throws an error when the op cli is not found", async () => {
			const cli = new OPJS();

			const lookpathSpy = jest
				.spyOn(lookpath, "lookpath")
				.mockResolvedValue(undefined);

			await expect(cli.validate()).rejects.toEqual(
				new ValidationError("not-found"),
			);

			lookpathSpy.mockRestore();
		});

		it("throws an error when the cli does not meet the version requirements", async () => {
			const cli = new OPJS();

			const lookpathSpy = jest
				.spyOn(lookpath, "lookpath")
				.mockResolvedValue(fakeOpPath);
			const spawnSpy = jest
				.spyOn<any, any>(child_process, "spawnSync")
				.mockReturnValue({
					error: null,
					stderr: "",
					stdout: "1.0.0",
				});

			await expect(cli.validate()).rejects.toEqual(
				new ValidationError("version", OPJS.recommendedVersion, "1.0.0"),
			);

			lookpathSpy.mockRestore();
			spawnSpy.mockRestore();
		});

		it("does not throw when cli is fully valid", async () => {
			const cli = new OPJS({
				requiredVersion: ">=2.0.0",
			});

			const lookpathSpy = jest
				.spyOn(lookpath, "lookpath")
				.mockResolvedValue(fakeOpPath);
			const spawnSpy = jest
				.spyOn<any, any>(child_process, "spawnSync")
				.mockReturnValue({
					error: null,
					stderr: "",
					stdout: "2.1.0",
				});

			await expect(cli.validate()).resolves.toBeUndefined();

			lookpathSpy.mockRestore();
			spawnSpy.mockRestore();
		});

		it("can handle beta versions", async () => {
			const cli = new OPJS({
				requiredVersion: ">=2.0.0",
			});

			const lookpathSpy = jest
				.spyOn(lookpath, "lookpath")
				.mockResolvedValue(fakeOpPath);
			const spawnSpy = jest
				.spyOn<any, any>(child_process, "spawnSync")
				.mockReturnValue({
					error: null,
					stderr: "",
					stdout: "2.0.1.beta.12",
				});

			await expect(cli.validate()).resolves.toBeUndefined();

			lookpathSpy.mockRestore();
			spawnSpy.mockRestore();
		});

		it("can take a custom version", async () => {
			const cli = new OPJS();

			const lookpathSpy = jest
				.spyOn(lookpath, "lookpath")
				.mockResolvedValue(fakeOpPath);
			const spawnSpy = jest
				.spyOn<any, any>(child_process, "spawnSync")
				.mockReturnValue({
					error: null,
					stderr: "",
					stdout: "2.1.0",
				});

			await expect(cli.validate(">=2.0.0")).resolves.toBeUndefined();

			lookpathSpy.mockRestore();
			spawnSpy.mockRestore();
		});
	});
});
