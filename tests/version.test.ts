import Joi from "joi";
import OPJS from "../src";

describe("version", () => {
	it("returns the version number", () => {
		const cli = new OPJS();

		expect(cli.version).toMatchSchema(Joi.string().required());
	});
});
