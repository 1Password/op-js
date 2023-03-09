import { existsSync, readFileSync, rmSync } from "fs";
import Joi from "joi";
import OPJS from "../src";
import { DEFAULT_VAULT, MALICIOUS_STRING } from "./test-utils";

describe("document", () => {
	it("CRUDs documents", () => {
		const cli = new OPJS();

		const initialValue =
			"1Password's proven dual-key encryption protects your logins, payment cards, and more.";

		const create = cli.document.create(initialValue, {
			vault: DEFAULT_VAULT,
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

		const list = cli.document.list({
			vault: DEFAULT_VAULT,
		});
		expect(list).toMatchSchema(
			Joi.array()
				.items({
					id: Joi.string().required(),
					title: Joi.string().required(),
					version: Joi.number().required(),
					vault: {
						id: Joi.string().required().allow(""),
						name: Joi.string().allow(""),
					},
					last_edited_by: Joi.string().optional(),
					created_at: Joi.string().required(),
					updated_at: Joi.string().required(),
					"overview.ainfo": Joi.string(),
				})
				.required(),
		);

		const edit = cli.document.edit(create.uuid, MALICIOUS_STRING, {
			title: MALICIOUS_STRING,
			fileName: "updated-doc.txt",
		});
		expect(edit).toBeUndefined();

		const get = cli.document.get(create.uuid);
		expect(get).toMatchSchema(Joi.string().required());

		const fileName = `${__dirname}/test.txt`;
		const toFile = cli.document.toFile(create.uuid, `${__dirname}/test.txt`);
		expect(toFile).toBeUndefined();

		expect(existsSync(fileName)).toBe(true);
		const fileValue = readFileSync(fileName, "utf-8");
		expect(fileValue).toEqual(MALICIOUS_STRING);
		rmSync(fileName);

		const del = cli.document.delete(create.uuid);
		expect(del).toBeUndefined();
	});
});
