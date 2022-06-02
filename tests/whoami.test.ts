import Joi from "joi";
import { whoami } from "../src";

describe("whoami", () => {
	it("returns the authenticated user", () => {
		const result = whoami();
		expect(result).toMatchSchema(
			Joi.alternatives(
				// If you're not authenticated, you'll get null
				null,
				// If you're authenticated, you'll get your account details
				Joi.object({
					url: Joi.string().required(),
					email: Joi.string().required(),
					user_uuid: Joi.string().required(),
					account_uuid: Joi.string().required(),
				}),
			),
		);
	});
});
