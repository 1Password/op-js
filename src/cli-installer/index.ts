import * as core from "@actions/core";

import { newCliInstaller } from "./installer";
import { VersionResolver } from "./version";

// Installs 1Password CLI on GitHub runners
export const installCliOnGithubRunner = async (version?: string): Promise<void> => {
	try {
		const versionResolver = new VersionResolver(version ?? core.getInput("version"));
		await versionResolver.resolve();
		const installer = newCliInstaller(versionResolver.get());
		await installer.installCli();
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("error:", error);
			core.setFailed(error.message);
		} else {
			console.error("Unknown error:", error);
			core.setFailed("Unknown error occurred");
		}
	}
};
