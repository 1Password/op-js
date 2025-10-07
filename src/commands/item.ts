import semverCoerce from "semver/functions/coerce";
import semverSatisfies from "semver/functions/satisfies";
import { BaseCommand, CommandFlags } from "./base-command";

export type InputCategory =
	| "Email Account"
	| "Medical Record"
	| "Password"
	| "Bank Account"
	| "Membership"
	| "Reward Program"
	| "Credit Card"
	| "Driver License"
	| "Outdoor License"
	| "Passport"
	| "Wireless Router"
	| "Social Security Number"
	| "Software License"
	| "API Credential"
	| "Database"
	| "Document"
	| "Identity"
	| "Login"
	| "Secure Note"
	| "Server"
	// Disabled until CLI gets this category
	// | "Crypto Wallet"
	| "SSH Key";

export type OutputCategory =
	| "EMAIL_ACCOUNT"
	| "MEDICAL_RECORD"
	| "PASSWORD"
	| "BANK_ACCOUNT"
	| "MEMBERSHIP"
	| "REWARD_PROGRAM"
	| "CREDIT_CARD"
	| "DRIVER_LICENSE"
	| "OUTDOOR_LICENSE"
	| "PASSPORT"
	| "WIRELESS_ROUTER"
	| "SOCIAL_SECURITY_NUMBER"
	| "SOFTWARE_LICENSE"
	| "API_CREDENTIAL"
	| "DATABASE"
	| "DOCUMENT"
	| "IDENTITY"
	| "LOGIN"
	| "SECURE_NOTE"
	| "SERVER"
	// Disabled until CLI gets this category
	// | "CRYPTO_WALLET"
	| "SSH_KEY";

export type PasswordStrength =
	| "TERRIBLE"
	| "WEAK"
	| "FAIR"
	| "GOOD"
	| "VERY_GOOD"
	| "EXCELLENT"
	| "FANTASTIC";

// These are the possible field types you can
// use to *create* an item
export type FieldAssignmentType =
	| "concealed"
	| "text"
	| "email"
	| "url"
	| "date"
	| "monthYear"
	| "phone"
	// Used for deleting a field
	| "delete";

// These are the possible field types you can
// use when querying fields by type
export type QueryFieldType =
	| "string"
	| "concealed"
	| "date"
	| "phone"
	| "address"
	| "URL"
	| "email"
	| "monthYear"
	| "gender"
	| "cctype"
	| "ccnum"
	| "reference"
	| "menu"
	| "month"
	| "OTP"
	| "file"
	| "sshKey";

// These are the possible field types that can be
// returned on a item's field
export type ResponseFieldType =
	| "UNKNOWN"
	| "ADDRESS"
	| "CONCEALED"
	| "CREDIT_CARD_NUMBER"
	| "CREDIT_CARD_TYPE"
	| "DATE"
	| "EMAIL"
	| "GENDER"
	| "MENU"
	| "MONTH_YEAR"
	| "OTP"
	| "PHONE"
	| "REFERENCE"
	| "STRING"
	| "URL"
	| "FILE"
	| "SSHKEY";

export const validFieldPurposes = ["USERNAME", "PASSWORD", "NOTE"];
export type FieldPurpose = (typeof validFieldPurposes)[number];

export type FieldAssignment = [
	label: string,
	type: FieldAssignmentType,
	value: string,
	purpose?: FieldPurpose,
];

export interface FieldLabelSelector {
	label?: string[];
}
export interface FieldTypeSelector {
	type?: QueryFieldType[];
}

export interface Section {
	id: string;
	label?: string;
}

interface BaseField {
	id: string;
	type: ResponseFieldType;
	label: string;
	reference?: string;
	section?: Section;
	tags?: string[];
}

export type ValueField = BaseField & {
	value: string;
};

export type GenericField = ValueField & {
	type:
		| "STRING"
		| "URL"
		| "ADDRESS"
		| "DATE"
		| "MONTH_YEAR"
		| "EMAIL"
		| "PHONE"
		| "REFERENCE";
};

export type UsernameField = ValueField & {
	type: "STRING";
	purpose: "USERNAME";
};

export type NotesField = ValueField & {
	type: "STRING";
	purpose: "NOTES";
};

export type OtpField = ValueField & {
	type: "OTP";
	totp: string;
};

export type PasswordField = ValueField & {
	type: "CONCEALED";
	purpose: "PASSWORD";
	entropy: number;
	password_details: {
		entropy?: number;
		generated?: boolean;
		strength: PasswordStrength;
	};
};

export interface File {
	id: string;
	name: string;
	size: number;
	content_path: string;
	section: Section;
}

export interface URL {
	label?: string;
	primary: boolean;
	href: string;
}

export type Field =
	| UsernameField
	| PasswordField
	| OtpField
	| NotesField
	| GenericField;

export interface Item {
	id: string;
	title: string;
	version?: number;
	vault: {
		id: string;
		name: string;
	};
	category: OutputCategory;
	last_edited_by?: string;
	created_at: string;
	updated_at: string;
	additional_information?: string;
	sections?: Section[];
	tags?: string[];
	fields?: Field[];
	files?: File[];
	urls?: URL[];
}

export interface ItemTemplate {
	title: string;
	vault: {
		id: string;
	};
	category: OutputCategory;
	fields: Field[];
}

export interface ListItemTemplate {
	uuid: string;
	name: string;
}

export class ItemCommand extends BaseCommand {
	/**
	 * Create an item.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-create}
	 */
	create(
		assignments: FieldAssignment[],
		flags: CommandFlags<{
			category: InputCategory;
			dryRun: boolean;
			generatePassword: string | boolean;
			tags: string[];
			template: string;
			title: string;
			url: string;
			vault: string;
		}> = {},
	) {
		const options: {
			flags: any;
			args?: FieldAssignment[];
			stdin?: Record<string, any>;
		} = {
			flags,
		};

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
		const version = semverCoerce(this.cli.version());

		// Prior to 2.6.2 the CLI didn't handle field assignments correctly
		// within scripts, so if we're below that version we need to pipe the
		// fields in via stdin
		if (semverSatisfies(version, ">=2.6.2")) {
			options.args = assignments;
		} else {
			options.stdin = {
				fields: assignments.map(([label, type, value, purpose]) => {
					const data = {
						label,
						type,
						value,
					};

					if (purpose) {
						Object.assign(data, { purpose });
					}

					return data;
				}),
			};
		}

		return this.cli.execute<Item>(["item", "create"], options);
	}

	/**
	 * Permanently delete an item.
	 *
	 * Set `archive` to move it to the Archive instead.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-delete}
	 */
	delete(
		nameOrIdOrLink: string,
		flags: CommandFlags<{
			archive: boolean;
			vault: string;
		}> = {},
	) {
		return this.cli.execute<void>(["item", "delete"], {
			args: [nameOrIdOrLink],
			flags,
			json: false,
		});
	}

	/**
	 * Edit an item's details.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-edit}
	 */
	edit(
		nameOrIdOrLink: string,
		assignments: FieldAssignment[],
		flags: CommandFlags<{
			dryRun: boolean;
			generatePassword: string | boolean;
			tags: string[];
			title: string;
			url: string;
			vault: string;
		}> = {},
	) {
		return this.cli.execute<Item>(["item", "edit"], {
			args: [nameOrIdOrLink, ...assignments],
			flags,
		});
	}

	/**
	 * Return details about an item.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-get}
	 */
	get(
		nameOrIdOrLink: string,
		flags: CommandFlags<{
			fields: FieldLabelSelector | FieldTypeSelector;
			includeArchive: boolean;
			vault: string;
		}> = {},
	) {
		return this.cli.execute<Item | ValueField | ValueField[]>(["item", "get"], {
			args: [nameOrIdOrLink],
			flags,
		});
	}

	/**
	 * Output the primary one-time password for this item.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-get}
	 */
	otp(
		nameOrIdOrLink: string,
		flags: CommandFlags<{
			includeArchive: boolean;
			vault: string;
		}> = {},
	) {
		return this.cli.execute<string>(["item", "get"], {
			args: [nameOrIdOrLink],
			flags: { otp: true, ...flags },
			json: false,
		});
	}

	/**
	 * Get a shareable link for the item.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-get}
	 */
	shareLink(
		nameOrIdOrLink: string,
		flags: CommandFlags<{
			includeArchive: boolean;
			vault: string;
		}> = {},
	) {
		return this.cli.execute<string>(["item", "get"], {
			args: [nameOrIdOrLink],
			flags: { shareLink: true, ...flags },
			json: false,
		});
	}

	/**
	 * List items.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-list}
	 */
	list(
		flags: CommandFlags<{
			categories: InputCategory[];
			includeArchive: boolean;
			long: boolean;
			tags: string[];
			vault: string;
		}> = {},
	) {
		return this.cli.execute<Item[]>(["item", "list"], { flags });
	}

	/**
	 * Share an item.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item#item-share}
	 */
	share(
		nameOrId: string,
		flags: CommandFlags<{
			emails: string[];
			expiry: string;
			vault: string;
			viewOnce: boolean;
		}> = {},
	) {
		return this.cli.execute<string>(["item", "share"], {
			args: [nameOrId],
			flags,
			json: false,
		});
	}

	template = {
		/**
		 * Return a template for an item type.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item/#item-template-get}
		 */
		get: (category: InputCategory, flags: CommandFlags = {}) =>
			this.cli.execute<ItemTemplate[]>(["item", "template", "get"], {
				args: [category],
				flags,
			}),

		/**
		 * Lists available item type templates.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/item/#item-template-list}
		 */
		list: (flags: CommandFlags = {}) =>
			this.cli.execute<ListItemTemplate[]>(["item", "template", "list"], {
				flags,
			}),
	};
}
