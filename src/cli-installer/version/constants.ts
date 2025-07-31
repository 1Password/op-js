/* eslint-disable @typescript-eslint/naming-convention */
export enum ReleaseChannel {
	Stable = "latest",
	Beta = "latest-beta",
}

export interface VersionResponse {
	CLI2: {
		release: { version: string };
		beta: { version: string };
	};
}
/* eslint-enable @typescript-eslint/naming-convention */
