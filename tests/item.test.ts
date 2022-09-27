import Joi from "joi";
import { item } from "../src";

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
		const create = item.create([["username", "text", "created"]], {
			vault: process.env.OP_VAULT,
			category: "Login",
			title: "Created Login",
			url: "https://example.com",
		});
		expect(create).toMatchSchema(itemSchema);

		const edit = item.edit(create.id, [["username", "text", "updated"]], {
			title: "Updated Login",
		});
		expect(edit).toMatchSchema(itemSchema);

		const get = item.get(create.id);
		expect(get).toMatchSchema(itemSchema);

		const del = item.delete(create.id);
		expect(del).toBeUndefined();
	});
});
