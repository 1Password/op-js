import Joi from "joi";
import OPJS from "../src";
import { DEFAULT_VAULT, MALICIOUS_STRING } from "./test-utils";

const itemSchema = Joi.object({
	id: Joi.string().required(),
	title: Joi.string().required(),
	version: Joi.number().optional(),
	vault: {
		id: Joi.string().required().allow(""),
		name: Joi.string().allow(""),
	},
	category: Joi.string().required(),
	last_edited_by: Joi.string().optional(),
	created_at: Joi.string().required(),
	updated_at: Joi.string().required(),
	additional_information: Joi.string().optional(),
	sections: Joi.array()
		.items({
			id: Joi.string().required(),
		})
		.optional(),
	tags: Joi.array().items(Joi.string().required()).optional(),
	fields: Joi.array()
		.items({
			id: Joi.string().required(),
			type: Joi.string().required(),
			label: Joi.string().required(),
			purpose: Joi.string().optional(),
			value: Joi.string().optional(),
			reference: Joi.string().optional(),
			section: {
				id: Joi.string().required(),
			},
			tags: Joi.array().items(Joi.string().required()).optional(),
			entropy: Joi.number().optional(),
			password_details: Joi.object({
				entropy: Joi.number().optional(),
				generated: Joi.boolean().optional(),
				strength: Joi.string().required(),
			})
				.optional()
				.allow({}),
		})
		.optional(),
	files: Joi.array()
		.items({
			id: Joi.string().required(),
			name: Joi.string().required(),
			size: Joi.number().required(),
			content_path: Joi.string().required(),
			section: {
				id: Joi.string().required(),
			},
		})
		.optional(),
	urls: Joi.array()
		.items({
			label: Joi.string().optional(),
			primary: Joi.boolean().required(),
			href: Joi.string().required(),
		})
		.optional(),
}).required();

describe("item", () => {
	it("CRUDs items", () => {
		const cli = new OPJS();

		const create = cli.item.create([["username", "text", "created"]], {
			vault: DEFAULT_VAULT,
			category: "Login",
			title: "Created Login",
			url: "https://example.com",
		});
		expect(create).toMatchSchema(itemSchema);

		const edit = cli.item.edit(
			create.id,
			[["username", "text", MALICIOUS_STRING]],
			{
				title: MALICIOUS_STRING,
			},
		);
		expect(edit).toMatchSchema(itemSchema);

		const get = cli.item.get(create.id, {
			vault: DEFAULT_VAULT,
			includeArchive: true,
		});
		expect(get).toMatchSchema(itemSchema);

		const del = cli.item.delete(create.id);
		expect(del).toBeUndefined();
	});
});
