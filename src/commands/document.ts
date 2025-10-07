import { BaseCommand, CommandFlags } from "./base-command";

export interface Document {
	id: string;
	title: string;
	version: number;
	vault: {
		id: string;
		name: string;
	};
	last_edited_by?: string;
	created_at: string;
	updated_at: string;
	"overview.ainfo"?: string;
}

export interface CreatedDocument {
	uuid: string;
	createdAt: string;
	updatedAt: string;
	vaultUuid: string;
}

export class DocumentCommand extends BaseCommand {
	/**
	 * Create a document item with data or a file on disk.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-create}
	 */
	create(
		dataOrFile: string,
		flags: CommandFlags<{
			fileName: string;
			tags: string[];
			title: string;
			vault: string;
		}> = {},
		fromFile = false,
	) {
		return this.cli.execute<CreatedDocument>(["document", "create"], {
			args: [fromFile ? dataOrFile : ""],
			flags,
			stdin: fromFile ? undefined : dataOrFile,
		});
	}

	/**
	 * Permanently delete a document.
	 *
	 * Set `archive` to move it to the Archive instead.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-delete}
	 */
	delete(
		nameOrId: string,
		flags: CommandFlags<{ archive: boolean; vault: string }> = {},
	) {
		return this.cli.execute<void>(["document", "delete"], {
			args: [nameOrId],
			flags,
		});
	}

	/**
	 * Update a document.
	 *
	 * Replaces the file contents with the provided file path or data.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-edit}
	 */
	edit(
		nameOrId: string,
		dataOrFile: string,
		flags: CommandFlags<{
			fileName: string;
			tags: string[];
			title: string;
			vault: string;
		}> = {},
		fromFile = false,
	) {
		return this.cli.execute<void>(["document", "edit"], {
			args: [nameOrId, fromFile ? dataOrFile : ""],
			flags,
			stdin: fromFile ? undefined : dataOrFile,
		});
	}

	/**
	 * Download a document and return its contents.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-get}
	 */
	get(
		nameOrId: string,
		flags: CommandFlags<{
			includeArchive: boolean;
			vault: string;
		}> = {},
	) {
		return this.cli.execute<string>(["document", "get"], {
			args: [nameOrId],
			flags,
			json: false,
		});
	}

	/**
	 * Download a document and save it to a file.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-get}
	 */
	toFile(
		nameOrId: string,
		outputPath: string,
		flags: CommandFlags<{
			includeArchive: boolean;
			vault: string;
		}> = {},
	) {
		return this.cli.execute<void>(["document", "get"], {
			args: [nameOrId],
			flags: {
				output: outputPath,
				...flags,
			},
			json: false,
		});
	}

	/**
	 * List documents.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/document#document-list}
	 */
	list(
		flags: CommandFlags<{
			includeArchive: boolean;
			vault: string;
		}> = {},
	) {
		return this.cli.execute<Document[]>(["document", "list"], {
			flags,
		});
	}
}
