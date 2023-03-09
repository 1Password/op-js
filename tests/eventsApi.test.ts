import Joi from "joi";
import { createOpjs } from "./test-utils";

describe("eventsApi", () => {
	it("creates an Events API token", () => {
		const cli = createOpjs();

		// eslint-disable-next-line no-restricted-syntax
		const random = Math.random().toString();
		const create = cli.eventsApi.create(`Token ${random}`, {
			expiresIn: "1m",
			features: ["signinattempts", "itemusages"],
		});
		expect(create).toMatchSchema(Joi.string().required());
	});
});
