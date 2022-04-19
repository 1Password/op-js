import Joi from "joi";
import { eventsApi } from "../src";

describe("eventsApi", () => {
	it("creates an Events API token", () => {
		// eslint-disable-next-line no-restricted-syntax
		const random = Math.random().toString();
		const create = eventsApi.create(`Token ${random}`, {
			expiresIn: "1m",
			features: ["signinattempts", "itemusages"],
		});
		expect(create).toMatchSchema(Joi.string().required());
	});
});
