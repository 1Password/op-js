import Joi from "joi";
import OPJS from "../src";

describe("eventsApi", () => {
	// Errors with: CLIError: Invalid Environment
	it.skip("creates an Events API token", () => {
		const cli = new OPJS();

		// eslint-disable-next-line no-restricted-syntax
		const random = Math.random().toString();
		const create = cli.eventsApi.create(`Token ${random}`, {
			expiresIn: "1m",
			features: ["signinattempts", "itemusages"],
		});
		expect(create).toMatchSchema(Joi.string().required());
	});
});
