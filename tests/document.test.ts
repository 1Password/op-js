import { existsSync, rmSync } from "fs";
import Joi from "joi";
import { document } from "../src";

describe("document", () => {
	it("CRUDs documents", () => {
		const create = document.create("Created Value", {
			vault: process.env.OP_VAULT,
			title: "Created Document",
			fileName: "created-doc.txt",
		});
		expect(create).toMatchSchema(
			Joi.object({
				uuid: Joi.string().required(),
				createdAt: Joi.string().required(),
				updatedAt: Joi.string().required(),
				vaultUuid: Joi.string().required(),
			}).required(),
		);

		const list = document.list({ vault: process.env.OP_VAULT });
		expect(list).toMatchSchema(
			Joi.array()
				.items({
					id: Joi.string().required(),
					title: Joi.string().required(),
					version: Joi.number().required(),
					vault: {
						id: Joi.string().required(),
					},
					last_edited_by: Joi.string().required(),
					created_at: Joi.string().required(),
					updated_at: Joi.string().required(),
					"overview.ainfo": Joi.string(),
				})
				.required(),
		);

		const edit = document.edit(create.uuid, "Updated Value", {
			title: "Updated Value",
			fileName: "updated-doc.txt",
		});
		expect(edit).toBeUndefined();

		const get = document.get(create.uuid);
		expect(get).toMatchSchema(Joi.string().required());

		const fileName = `${__dirname}/test.txt`;
		const toFile = document.toFile(create.uuid, `${__dirname}/test.txt`);
		expect(toFile).toBeUndefined();
		expect(existsSync(fileName)).toBe(true);
		rmSync(fileName);

		const del = document.delete(create.uuid);
		expect(del).toBeUndefined();
	});
});
