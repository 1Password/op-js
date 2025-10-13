/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
	buildCommand,
	parseFlagName,
	parseFlagValue,
	parseFieldAssignment,
	processArgs,
	processFlags,
	processStdin,
	processSubCommand,
	MAX_ARG_LENGTH,
	MAX_ARGS,
	MAX_FLAG_NAME_LENGTH,
	MAX_FLAG_VALUE_LENGTH,
	MAX_FLAGS,
	MAX_STDIN_LENGTH,
	MAX_SUBCOMMAND_PARTS,
} from "./build-command";
import { ComponentLengthError } from "./errors";

describe("parseFlagName", () => {
	it("converts camel case to hyphens", () => {
		expect(parseFlagName("someFlag")).toEqual("some-flag");
		expect(parseFlagName("anotherFlag")).toEqual("another-flag");
		expect(parseFlagName("myCustomFlag")).toEqual("my-custom-flag");
	});

	it("correctly handles pascal case", () => {
		expect(parseFlagName("SomeFlag")).toEqual("some-flag");
		expect(parseFlagName("AnotherFlag")).toEqual("another-flag");
	});

	it("handles single words", () => {
		expect(parseFlagName("flag")).toEqual("flag");
		expect(parseFlagName("Flag")).toEqual("flag");
	});

	it("handles multiple consecutive capitals", () => {
		expect(parseFlagName("XMLHttpRequest")).toEqual("x-m-l-http-request");
		expect(parseFlagName("HTTPSConnection")).toEqual("h-t-t-p-s-connection");
	});

	it("validates flag names", () => {
		expect(() => parseFlagName("")).toThrow(
			"Flag names must be non-empty strings",
		);
		expect(() => parseFlagName(null as unknown as string)).toThrow(
			"Flag names must be non-empty strings",
		);
		expect(() => parseFlagName(undefined as unknown as string)).toThrow(
			"Flag names must be non-empty strings",
		);
	});

	it("enforces maximum flag name length", () => {
		const longName = "a".repeat(MAX_FLAG_NAME_LENGTH + 1);
		expect(() => parseFlagName(longName)).toThrow(ComponentLengthError);
	});
});

describe("parseFlagValue", () => {
	it("parses string type values", () => {
		expect(parseFlagValue("foo")).toEqual("=foo");
		expect(parseFlagValue("bar")).toEqual("=bar");
		expect(parseFlagValue("")).toEqual("");
	});

	it("parses string array type values", () => {
		expect(parseFlagValue(["foo", "bar"])).toEqual("=foo,bar");
		expect(parseFlagValue(["a", "b", "c"])).toEqual("=a,b,c");
		expect(parseFlagValue([])).toEqual("");
	});

	it("parses boolean type values", () => {
		expect(parseFlagValue(true)).toEqual("");
		expect(parseFlagValue(false)).toEqual("");
	});

	it("handles null and undefined", () => {
		expect(parseFlagValue(null)).toEqual("");
		expect(parseFlagValue(undefined)).toEqual("");
	});

	it("parses type field selector values", () => {
		expect(
			parseFlagValue({
				type: ["string"],
			}),
		).toEqual("=type=string");
		expect(
			parseFlagValue({
				type: ["string", "concealed"],
			}),
		).toEqual("=type=string,type=concealed");
		expect(
			parseFlagValue({
				type: [],
			}),
		).toEqual("");
	});

	it("parses label field selector values", () => {
		expect(
			parseFlagValue({
				label: ["username", "password"],
			}),
		).toEqual("=label=username,label=password");
		expect(
			parseFlagValue({
				label: ["email"],
			}),
		).toEqual("=label=email");
		expect(
			parseFlagValue({
				label: [],
			}),
		).toEqual("");
	});

	it("parses combined type and label field selector values", () => {
		expect(
			parseFlagValue({
				type: ["string"],
				label: ["username"],
			}),
		).toEqual("=label=username,type=string");
	});

	it("handles empty object", () => {
		expect(parseFlagValue({})).toEqual("");
	});

	it("validates input types", () => {
		expect(() => parseFlagValue([123] as any)).toThrow(
			"Array flag values must be strings",
		);
		expect(() => parseFlagValue({ label: [123] } as any)).toThrow(
			"Field labels must be strings",
		);
		expect(() => parseFlagValue({ type: [123] } as any)).toThrow(
			"Field types must be strings",
		);
	});

	it("enforces length limits", () => {
		const longString = "a".repeat(MAX_FLAG_VALUE_LENGTH + 1);
		expect(() => parseFlagValue(longString)).toThrow(ComponentLengthError);
		expect(() => parseFlagValue([longString])).toThrow(ComponentLengthError);
	});
});

describe("processSubCommand", () => {
	it("processes valid subcommands", () => {
		expect(processSubCommand(["item"])).toEqual(["item"]);
		expect(processSubCommand(["item", "get"])).toEqual(["item", "get"]);
		expect(processSubCommand(["vault", "user", "list"])).toEqual([
			"vault",
			"user",
			"list",
		]);
	});

	it("validates subcommand is an array", () => {
		expect(() => processSubCommand("item" as any)).toThrow(
			"Sub-command must be an array",
		);
		expect(() => processSubCommand(null as any)).toThrow(
			"Sub-command must be an array",
		);
	});

	it("enforces maximum subcommand parts", () => {
		const tooManyParts = Array(MAX_SUBCOMMAND_PARTS + 1).fill("part");
		expect(() => processSubCommand(tooManyParts)).toThrow(ComponentLengthError);
	});

	it("validates subcommand parts", () => {
		expect(() => processSubCommand([""])).toThrow(
			"Sub-commands must be non-empty strings without spaces",
		);
		expect(() => processSubCommand(["has space"])).toThrow(
			"Sub-commands must be non-empty strings without spaces",
		);
		expect(() => processSubCommand([123 as any])).toThrow(
			"Sub-commands must be non-empty strings without spaces",
		);
	});
});

describe("processArgs", () => {
	it("processes string arguments", () => {
		expect(processArgs(["arg1"])).toEqual(["arg1"]);
		expect(processArgs(["arg1", "arg2"])).toEqual(["arg1", "arg2"]);
	});

	it("processes field assignment arguments", () => {
		expect(processArgs([["username", "text", "value"]])).toEqual([
			"username[text]=value",
		]);
	});

	it("validates args is an array", () => {
		expect(() => processArgs("arg" as any)).toThrow(
			"Arguments must be an array",
		);
		expect(() => processArgs(null as any)).toThrow(
			"Arguments must be an array",
		);
	});

	it("enforces maximum args", () => {
		const tooManyArgs = Array(MAX_ARGS + 1).fill("arg");
		expect(() => processArgs(tooManyArgs)).toThrow(ComponentLengthError);
	});

	it("enforces maximum arg length", () => {
		const longArg = "a".repeat(MAX_ARG_LENGTH + 1);
		expect(() => processArgs([longArg])).toThrow(ComponentLengthError);
	});

	it("validates argument types", () => {
		expect(() => processArgs([123 as any])).toThrow(
			"Arguments must be string or field assignment array",
		);
		expect(() => processArgs([null as any])).toThrow(
			"Arguments must be string or field assignment array",
		);
		expect(() => processArgs([{} as any])).toThrow(
			"Arguments must be string or field assignment array",
		);
	});
});

describe("parseFieldAssignment", () => {
	it("creates a field assignment from a field assignment array", () => {
		expect(parseFieldAssignment(["username", "text", "foo"])).toEqual(
			"username[text]=foo",
		);
		expect(parseFieldAssignment(["password", "concealed", "abc123"])).toEqual(
			"password[concealed]=abc123",
		);
	});

	it("handles empty values", () => {
		expect(parseFieldAssignment(["field", "text", ""])).toEqual("field[text]=");
	});

	it("handles field purposes", () => {
		expect(
			parseFieldAssignment(["username", "text", "foo", "USERNAME"]),
		).toEqual("username[text]=foo[USERNAME]");
		expect(
			parseFieldAssignment(["password", "concealed", "abc123", "PASSWORD"]),
		).toEqual("password[concealed]=abc123[PASSWORD]");
		expect(parseFieldAssignment(["note", "text", "value", "NOTE"])).toEqual(
			"note[text]=value[NOTE]",
		);
	});

	it("validates field assignment structure", () => {
		expect(() => parseFieldAssignment([] as any)).toThrow(
			"Field assignment must be an array of [label, type, value] or [label, type, value, purpose]",
		);
		expect(() => parseFieldAssignment(["label"] as any)).toThrow(
			"Field assignment must be an array of [label, type, value] or [label, type, value, purpose]",
		);
		expect(() => parseFieldAssignment(["label", "text"] as any)).toThrow(
			"Field assignment must be an array of [label, type, value] or [label, type, value, purpose]",
		);
		expect(() =>
			parseFieldAssignment(["label", "text", "value", "extra", "more"] as any),
		).toThrow(
			"Field assignment must be an array of [label, type, value] or [label, type, value, purpose]",
		);
	});

	it("validates field assignment types", () => {
		expect(() => parseFieldAssignment([123, "type", "value"] as any)).toThrow(
			"Field label must be a non-empty string",
		);
		expect(() => parseFieldAssignment(["", "text", "value"])).toThrow(
			"Field label must be a non-empty string",
		);
		expect(() => parseFieldAssignment(["label", 123, "value"] as any)).toThrow(
			"Field type must be a non-empty string",
		);
		expect(() => parseFieldAssignment(["label", "" as any, "value"])).toThrow(
			"Field type must be a non-empty string",
		);
		expect(() => parseFieldAssignment(["label", "type", 123] as any)).toThrow(
			"Field value must be a string",
		);
	});

	it("validates field purpose", () => {
		expect(() =>
			parseFieldAssignment(["label", "text", "value", "INVALID"] as any),
		).toThrow("Invalid field purpose: must be one of USERNAME, PASSWORD, NOTE");
		expect(() =>
			parseFieldAssignment(["label", "text", "value", ""] as any),
		).toThrow("Field purpose must be a non-empty string");
		expect(() =>
			parseFieldAssignment(["label", "text", "value", 123] as any),
		).toThrow("Field purpose must be a non-empty string");
	});
});

describe("processFlags", () => {
	it("creates flags from a flag object", () => {
		expect(processFlags({ someFlag: "foo" })).toEqual(["--some-flag=foo"]);
		expect(processFlags({ anotherFlag: "bar" })).toEqual([
			"--another-flag=bar",
		]);
	});

	it("ignores null and falsey values", () => {
		expect(
			processFlags({ someFlag: "foo", anotherFlag: false, andAnother: null }),
		).toEqual(["--some-flag=foo"]);
		expect(
			processFlags({ someFlag: "foo", anotherFlag: undefined, andAnother: "" }),
		).toEqual(["--some-flag=foo"]);
	});

	it("handles empty object", () => {
		expect(processFlags({})).toEqual([]);
	});

	it("handles null/undefined flags", () => {
		expect(processFlags(null)).toEqual([]);
		expect(processFlags(undefined)).toEqual([]);
	});

	it("handles multiple flags", () => {
		expect(
			processFlags({
				flag1: "value1",
				flag2: "value2",
				flag3: true,
			}),
		).toEqual(["--flag1=value1", "--flag2=value2", "--flag3"]);
	});

	it("handles array values", () => {
		expect(processFlags({ items: ["a", "b", "c"] })).toEqual(["--items=a,b,c"]);
	});

	it("handles field selector values", () => {
		expect(
			processFlags({
				fields: { type: ["string"], label: ["username"] },
			}),
		).toEqual(["--fields=label=username,type=string"]);
	});

	it("validates flags object", () => {
		expect(() => processFlags("string" as any)).toThrow(
			"Flags must be an object",
		);
		expect(() => processFlags(123 as any)).toThrow("Flags must be an object");
	});

	it("enforces flag limits", () => {
		const manyFlags: Record<string, string> = {};
		for (let i = 0; i < MAX_FLAGS + 1; i++) {
			manyFlags[`flag${i}`] = "value";
		}
		expect(() => processFlags(manyFlags)).toThrow(ComponentLengthError);
	});
});

describe("processStdin", () => {
	it("handles string stdin", () => {
		expect(processStdin("test input")).toEqual(Buffer.from("test input"));
		expect(processStdin("")).toEqual(Buffer.from(""));
	});

	it("handles object stdin", () => {
		const obj = { key: "value", nested: { prop: 123 } };
		expect(processStdin(obj)).toEqual(Buffer.from(JSON.stringify(obj)));
	});

	it("handles undefined stdin", () => {
		expect(processStdin()).toBeUndefined();
		expect(processStdin(undefined)).toBeUndefined();
	});

	it("validates stdin type", () => {
		expect(() => processStdin(123 as any)).toThrow(
			"Stdin must be a string or object",
		);
		expect(() => processStdin(true as any)).toThrow(
			"Stdin must be a string or object",
		);
	});

	it("enforces stdin length limits", () => {
		const longString = "a".repeat(MAX_STDIN_LENGTH + 1);
		expect(() => processStdin(longString)).toThrow(ComponentLengthError);
	});

	it("validates JSON serialization", () => {
		const circularObj: any = {};
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		circularObj.self = circularObj;
		expect(() => processStdin(circularObj)).toThrow(
			"Invalid stdin object: must be JSON serializable",
		);
	});

	it("enforces stdin JSON length limits", () => {
		const largeObj = { data: "a".repeat(MAX_STDIN_LENGTH) };
		// Note: ComponentLengthError is caught and re-thrown as generic Error due to catch block
		expect(() => processStdin(largeObj)).toThrow(
			"Invalid stdin object: must be JSON serializable",
		);
	});
});

describe("buildCommand", () => {
	it("builds a basic command", () => {
		const result = buildCommand(["foo"], [], {}, true, {});
		expect(result.parts).toEqual(["foo", "--format=json"]);
		expect(result.input).toBeUndefined();
	});

	it("builds a command with arguments", () => {
		const result = buildCommand(["foo", "bar"], ["arg1", "arg2"], {}, true, {});
		expect(result.parts).toEqual([
			"foo",
			"bar",
			"arg1",
			"arg2",
			"--format=json",
		]);
	});

	it("builds a command with field assignments", () => {
		const result = buildCommand(
			["foo"],
			[["username", "text", "value"]],
			{},
			true,
			{},
		);
		expect(result.parts).toEqual([
			"foo",
			"username[text]=value",
			"--format=json",
		]);
	});

	it("builds a command with flags", () => {
		const result = buildCommand(
			["foo"],
			[],
			{ flag1: "value1", flag2: true },
			true,
			{},
		);
		expect(result.parts).toEqual([
			"foo",
			"--flag1=value1",
			"--flag2",
			"--format=json",
		]);
	});

	it("builds a command without JSON format", () => {
		const result = buildCommand(["foo"], [], {}, false, {});
		expect(result.parts).toEqual(["foo"]);
	});

	it("builds a command with no subcommand (like op -v)", () => {
		const result = buildCommand([], [], { v: true }, false, {});
		expect(result.parts).toEqual(["--v"]);
	});

	it("builds a command with no subcommand and JSON format", () => {
		const result = buildCommand([], [], {}, true, {});
		expect(result.parts).toEqual(["--format=json"]);
	});

	it("merges global flags with command flags", () => {
		const globalFlags = { globalFlag: "global" };
		const commandFlags = { commandFlag: "command" };
		const result = buildCommand(["foo"], [], commandFlags, true, globalFlags);
		expect(result.parts).toEqual([
			"foo",
			"--global-flag=global",
			"--command-flag=command",
			"--format=json",
		]);
	});

	it("command flags override global flags", () => {
		const globalFlags = { flag: "global" };
		const commandFlags = { flag: "command" };
		const result = buildCommand(["foo"], [], commandFlags, true, globalFlags);
		expect(result.parts).toEqual(["foo", "--flag=command", "--format=json"]);
	});

	it("handles stdin input", () => {
		const stdin = "test input";
		const result = buildCommand(["foo"], [], {}, true, {}, stdin);
		expect(result.input).toEqual(Buffer.from(stdin));
	});

	it("handles object stdin input", () => {
		const stdin = { key: "value" };
		const result = buildCommand(["foo"], [], {}, true, {}, stdin);
		expect(result.input).toEqual(Buffer.from(JSON.stringify(stdin)));
	});

	it("passes through command parts without sanitization", () => {
		const result = buildCommand(['"foo'], [], {}, true, {});
		expect(result.parts).toEqual(['"foo', "--format=json"]);
	});

	it("passes through arguments without sanitization", () => {
		const result = buildCommand(["foo"], ['"arg"'], {}, true, {});
		expect(result.parts).toEqual(["foo", '"arg"', "--format=json"]);
	});

	it("passes through field assignments without sanitization", () => {
		const result = buildCommand(
			["foo"],
			[['"field"', "text", "value"]],
			{},
			true,
			{},
		);
		expect(result.parts).toEqual([
			"foo",
			'"field"[text]=value',
			"--format=json",
		]);
	});

	it("validates buildCommand inputs", () => {
		expect(() => buildCommand(null as any, [], {}, true, {})).toThrow(
			"Sub-command must be an array",
		);
		expect(() => buildCommand([], null as any, {}, true, {})).toThrow(
			"Arguments must be an array",
		);
		const result = buildCommand([], [], {}, true, {});
		expect(result.parts).toEqual(["--format=json"]);
		expect(() => buildCommand([""], [], {}, true, {})).toThrow(
			"Sub-commands must be non-empty strings without spaces",
		);
		expect(() => buildCommand([123] as any, [], {}, true, {})).toThrow(
			"Sub-commands must be non-empty strings without spaces",
		);
	});

	it("enforces argument limits", () => {
		const manyArgs = Array(MAX_ARGS + 1).fill("arg");
		expect(() => buildCommand(["cmd"], manyArgs, {}, true, {})).toThrow(
			ComponentLengthError,
		);

		const manySubParts = Array(MAX_SUBCOMMAND_PARTS + 1).fill("part");
		expect(() => buildCommand(manySubParts, [], {}, true, {})).toThrow(
			ComponentLengthError,
		);
	});

	it("validates stdin input", () => {
		const longString = "a".repeat(MAX_STDIN_LENGTH + 1);
		expect(() => buildCommand(["cmd"], [], {}, true, {}, longString)).toThrow(
			ComponentLengthError,
		);

		const circularObj: any = {};
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		circularObj.self = circularObj;
		expect(() => buildCommand(["cmd"], [], {}, true, {}, circularObj)).toThrow(
			"Invalid stdin object: must be JSON serializable",
		);

		expect(() => buildCommand(["cmd"], [], {}, true, {}, 123 as any)).toThrow(
			"Stdin must be a string or object",
		);
	});
});
