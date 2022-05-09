import Joi from "joi";
import { setCommandLogger, setGlobalFlags } from "./src";

declare global {
	namespace jest {
		interface Matchers<R, T> {
			toMatchSchema(schema: Joi.AnySchema): R;
		}
	}
}

expect.extend({
	toMatchSchema: (receivedInput: any, schema: Joi.AnySchema) => {
		const { error } = schema.validate(receivedInput);
		const pass = error === undefined;
		return {
			message: () =>
				pass
					? "Success"
					: `Error: ${error.message}\n\nReceived: ${JSON.stringify(
							receivedInput,
							null,
							2,
					  )}`,
			pass,
		};
	},
});

if (process.env.npm_lifecycle_event === "test:integration") {
	for (const envVar of ["ACCOUNT", "VAULT"]) {
		if (!process.env[`OP_${envVar}`]) {
			throw new Error(
				`OP_${envVar} environment variable is required for integration tests.`,
			);
		}
	}

	setCommandLogger((message) =>
		process.stdout.write(`\nCommand used:\n\u001B[93m${message}\u001B[39m\n`),
	);

	setGlobalFlags({
		account: process.env.OP_ACCOUNT,
	});
}
