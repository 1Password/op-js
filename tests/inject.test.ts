import Joi from "joi";
import { inject, item } from "../src";

describe("inject", () => {
	describe("data", () => {
		it("returns injected data", () => {
			const value = "bar";
			const injectable = item.create([["foo", "text", value]], {
				vault: process.env.OP_VAULT,
				category: "Login",
				title: "Injectable",
			});
			const reference = injectable.fields.find(
				(f) => f.label === "foo",
			).reference;

			const result = inject.data(`foo ${reference}`);
			expect(result).toMatchSchema(Joi.string().required());
			expect(result).toEqual(`foo ${value}`);

			item.delete(injectable.id);
		});
	});
});
