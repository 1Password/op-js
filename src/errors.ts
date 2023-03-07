export type ValidationErrorType = "not-found" | "version";

export class ValidationError extends Error {
	public constructor(
		public type: ValidationErrorType,
		public requiredVersion?: string,
		public currentVersion?: string,
	) {
		let message: string;
		switch (type) {
			case "not-found":
				message = "Could not find `op` executable";
				break;
			case "version":
				message = `CLI version ${currentVersion} does not satisfy required version ${requiredVersion}`;
				break;
		}

		super(message);
		this.name = "ValidationError";
	}
}

export class ExecutionError extends Error {
	public constructor(message: string, public status: number) {
		super(message);
		this.name = "ExecutionError";
	}
}

export class CLIError extends ExecutionError {
	static errorRegex = /\[ERROR] (\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) (.+)/;
	public timestamp?: Date;

	public constructor(public originalMessage: string, status: number) {
		const errorMatch = originalMessage.match(CLIError.errorRegex);
		let parsedMessage: string;
		let parsedTimestamp: Date;

		if (errorMatch) {
			parsedMessage = errorMatch[2];
			parsedTimestamp = new Date(errorMatch[1]);
		} else {
			parsedMessage = "Unknown error";
		}

		super(parsedMessage, status);
		this.name = "CLIError";
		this.timestamp = parsedTimestamp;
	}
}
