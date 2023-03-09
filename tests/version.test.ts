import Joi from "joi";
import { createOpjs } from "./test-utils";

describe("version", () => {
	it("returns the version number", () => {
		const cli = createOpjs();

		expect(cli.version).toMatchSchema(Joi.string().required());
	});
});
