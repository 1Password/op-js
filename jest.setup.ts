import Joi from "joi";

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

if (
	process.env.npm_lifecycle_event === "test:integration" &&
	!process.env.OP_SERVICE_ACCOUNT_TOKEN
) {
	throw new Error(
		"OP_SERVICE_ACCOUNT_TOKEN environment variable is required for integration tests.",
	);
}
