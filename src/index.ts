export { OpCli, type GlobalFlags } from "./op-cli";

export {
	CLIError,
	ExecutionError,
	VerificationError,
	VerificationErrorType,
} from "./errors";

export type { CommandFlags } from "./commands/base-command";

export type {
	AccountType,
	AccountState,
	Account,
	ListAccount,
} from "./commands/account";

export type { Document, CreatedDocument } from "./commands/document";

export type {
	InputCategory,
	OutputCategory,
	PasswordStrength,
	FieldAssignmentType,
	QueryFieldType,
	ResponseFieldType,
	FieldPurpose,
	FieldAssignment,
	FieldLabelSelector,
	FieldTypeSelector,
	Section,
	ValueField,
	GenericField,
	UsernameField,
	NotesField,
	OtpField,
	PasswordField,
	File,
	URL,
	Field,
	Item,
	ItemTemplate,
	ListItemTemplate,
} from "./commands/item";

export type {
	VaultIcon,
	VaultPermisson,
	VaultType,
	Vault,
	AbbreviatedVault,
	VaultUserAccess,
	VaultGroupAccess,
	VaultGroup,
	VaultUser,
} from "./commands/vault";

export type {
	UserType,
	UserState,
	User,
	AbbreviatedUser,
} from "./commands/user";

export type {
	GroupRole,
	GroupState,
	GroupType,
	Group,
	CreatedGroup,
	AppreviatedGroup,
	GroupUser,
} from "./commands/group";

export type {
	ConnectServerState,
	VaultClaim,
	ConnectServer,
	ConnectServerToken,
} from "./commands/connect";

export type { RunOptions } from "./commands/run";

export type {
	ServiceAccount,
	ServiceAccountRateLimit,
} from "./commands/service-account";

export type { WhoamiCommand } from "./commands/whoami";
