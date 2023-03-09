import Joi from "joi";
import OPJS from "../src";
import { DEFAULT_VAULT, MALICIOUS_STRING } from "./test-utils";

describe("inject", () => {
	describe("data", () => {
		it("returns injected data", () => {
			const cli = new OPJS();

			// eslint-disable-next-line no-restricted-syntax
			const random = Math.random().toString();
			const injectable = cli.item.create([["foo", "text", MALICIOUS_STRING]], {
				vault: DEFAULT_VAULT,
				category: "Login",
				title: `Injectable ${random}`,
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
