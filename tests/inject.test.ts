import Joi from "joi";
import { createOpjs, MALICIOUS_STRING } from "./test-utils";

describe("inject", () => {
	describe("data", () => {
		it("returns injected data", () => {
			const cli = createOpjs();

			const injectable = cli.item.create([["foo", "text", MALICIOUS_STRING]], {
				vault: process.env.OP_VAULT,
				category: "Login",
				title: "Injectable",
			});
			const reference = injectable.fields.find(
				(f) => f.label === "foo",
			).reference;

			const result = cli.inject.data(`foo ${reference}`);
			expect(result).toMatchSchema(Joi.string().required());
			expect(result).toEqual(`foo ${MALICIOUS_STRING}`);

			cli.item.delete(injectable.id);
		});
	});
});
