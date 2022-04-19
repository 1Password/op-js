import Joi from "joi";
import { version } from "../src";

describe("version", () => {
	it("returns the version number", () => {
		expect(version()).toMatchSchema(Joi.string().required());
	});
});
