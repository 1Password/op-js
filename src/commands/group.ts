import { BaseCommand, CommandFlags } from "./base-command";

export type GroupRole = "MEMBER" | "MANAGER";

export type GroupState = "ACTIVE" | "DELETED" | "INACTIVE";

export type GroupType =
	| "ADMINISTRATORS"
	| "OWNERS"
	| "RECOVERY"
	| "TEAM_MEMBERS"
	| "USER_DEFINED"
	| "UNKNOWN_TYPE"
	| "SECURITY";

export interface Group {
	id: string;
	name: string;
	description: string;
	state: GroupState;
	created_at: string;
	updated_at: string;
	type: GroupType;
}

export type CreatedGroup = Omit<Group, "description">;

export type AppreviatedGroup = Pick<
	Group,
	"id" | "name" | "description" | "state" | "created_at"
>;

export type GroupUser = AbbreviatedUser & {
	role: GroupRole;
};

// Import from user command
type AbbreviatedUser = {
	id: string;
	name: string;
	email: string;
	type: string;
	state: string;
};

export class GroupCommand extends BaseCommand {
	/**
	 * Create a group.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-create}
	 */
	create(name: string, flags: CommandFlags<{ description: string }> = {}) {
		return this.cli.execute<CreatedGroup>(["group", "create"], {
			args: [name],
			flags,
		});
	}

	/**
	 * Remove a group.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-delete}
	 */
	delete(nameOrId: string, flags: CommandFlags = {}) {
		return this.cli.execute<void>(["group", "delete"], {
			args: [nameOrId],
			flags,
			json: false,
		});
	}

	/**
	 * Change a group's name or description.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-edit}
	 */
	edit(
		nameOrId: string,
		flags: CommandFlags<{
			description: string;
			name: string;
		}> = {},
	) {
		return this.cli.execute<void>(["group", "edit"], {
			args: [nameOrId],
			flags,
			json: false,
		});
	}

	/**
	 * Get details about a group.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-get}
	 */
	get(nameOrId: string, flags: CommandFlags = {}) {
		return this.cli.execute<Group>(["group", "get"], {
			args: [nameOrId],
			flags,
		});
	}

	/**
	 * List groups.
	 *
	 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-list}
	 */
	list(
		flags: CommandFlags<{
			vault: string;
			user: string;
		}> = {},
	) {
		return this.cli.execute<AppreviatedGroup[]>(["group", "list"], { flags });
	}

	user = {
		/**
		 * Grant a user access to a group.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-user-grant}
		 */
		grant: (
			flags: CommandFlags<{
				group: string;
				role: GroupRole;
				user: string;
			}> = {},
		) =>
			this.cli.execute<void>(["group", "user", "grant"], {
				flags,
				json: false,
			}),

		/**
		 * Retrieve users that belong to a group.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-user-list}
		 */
		list: (group: string, flags: CommandFlags = {}) =>
			this.cli.execute<GroupUser[]>(["group", "user", "list"], {
				args: [group],
				flags,
			}),

		/**
		 * Revoke a user's access to a vault or group.
		 *
		 * {@link https://developer.1password.com/docs/cli/reference/management-commands/group#group-user-revoke}
		 */
		revoke: (
			flags: CommandFlags<{
				group: string;
				user: string;
			}> = {},
		) =>
			this.cli.execute<void>(["group", "user", "revoke"], {
				flags,
				json: false,
			}),
	};
}
