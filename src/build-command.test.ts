/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
	buildCommand,
	camelToHyphen,
	createFieldAssignment,
	createFlags,
	parseFlagValue,
	sanitizeInput,
} from "./build-command";
import { ExecutionError } from "./errors";

describe("camelToHyphen", () => {
	it("converts camel case to hyphens", () => {
		expect(camelToHyphen("someFlag")).toEqual("some-flag");
		expect(camelToHyphen("anotherFlag")).toEqual("another-flag");
		expect(camelToHyphen("myCustomFlag")).toEqual("my-custom-flag");
	});

	it("correctly handles pascal case", () => {
		expect(camelToHyphen("SomeFlag")).toEqual("some-flag");
		expect(camelToHyphen("AnotherFlag")).toEqual("another-flag");
	});

	it("handles single words", () => {
		expect(camelToHyphen("flag")).toEqual("flag");
		expect(camelToHyphen("Flag")).toEqual("flag");
	});

	it("handles multiple consecutive capitals", () => {
		expect(camelToHyphen("XMLHttpRequest")).toEqual("x-m-l-http-request");
		expect(camelToHyphen("HTTPSConnection")).toEqual("h-t-t-p-s-connection");
	});
});

describe("sanitizeInput", () => {
	it("should escape dangerous shell metacharacters", () => {
		expect(sanitizeInput('abc"test')).toEqual('abc\\"test');
		expect(sanitizeInput("def$test")).toEqual("def\\$test");
		expect(sanitizeInput("xyz'test")).toEqual("xyz\\'test");
		expect(sanitizeInput("fds`test")).toEqual("fds\\`test");
		expect(sanitizeInput("test!test")).toEqual("test\\!test");
		expect(sanitizeInput("test&test")).toEqual("test\\&test");
		expect(sanitizeInput("test(test")).toEqual("test\\(test");
		expect(sanitizeInput("test)test")).toEqual("test\\)test");
		expect(sanitizeInput("test*test")).toEqual("test\\*test");
		expect(sanitizeInput("test;test")).toEqual("test\\;test");
		expect(sanitizeInput("test<test")).toEqual("test\\<test");
		expect(sanitizeInput("test>test")).toEqual("test\\>test");
		expect(sanitizeInput("test?test")).toEqual("test\\?test");
		expect(sanitizeInput("test[test")).toEqual("test\\[test");
		expect(sanitizeInput("test]test")).toEqual("test\\]test");
		expect(sanitizeInput("test{test")).toEqual("test\\{test");
		expect(sanitizeInput("test}test")).toEqual("test\\}test");
		expect(sanitizeInput("test|test")).toEqual("test\\|test");
		expect(sanitizeInput("test~test")).toEqual("test\\~test");
		expect(sanitizeInput("test test")).toEqual("test\\ test");
	});

	it("should preserve CLI syntax characters", () => {
		expect(sanitizeInput("test.test")).toEqual("test.test");
		expect(sanitizeInput("test=test")).toEqual("test=test");
		expect(sanitizeInput("test,test")).toEqual("test,test");
		expect(sanitizeInput("test-test")).toEqual("test-test");
		expect(sanitizeInput("test_test")).toEqual("test_test");
	});

	it("should handle backslashes by escaping them", () => {
		expect(sanitizeInput("test\\")).toEqual("test\\\\");
		expect(sanitizeInput("test\\\\")).toEqual("test\\\\\\\\");
		expect(sanitizeInput("test\\a")).toEqual("test\\\\a");
	});

	it("should handle empty strings", () => {
		expect(sanitizeInput("")).toEqual("");
	});

	it("should handle strings with no special characters", () => {
		expect(sanitizeInput("normalstring")).toEqual("normalstring");
		expect(sanitizeInput("normal-string")).toEqual("normal-string");
		expect(sanitizeInput("normal_string")).toEqual("normal_string");
	});

	it("should handle mixed special characters", () => {
		expect(sanitizeInput('test"$`\\')).toEqual('test\\"\\$\\`\\\\');
		expect(sanitizeInput('test\\"\\$\\`\\\\')).toEqual(
			'test\\\\\\"\\\\\\$\\\\\\`\\\\\\\\',
		);
	});

	it("should validate input", () => {
		expect(() => sanitizeInput(null as unknown as string)).toThrow(
			"Input must be a string",
		);
		expect(() => sanitizeInput(undefined as unknown as string)).toThrow(
			"Input must be a string",
		);
		expect(() => sanitizeInput(123 as unknown as string)).toThrow(
			"Input must be a string",
		);
	});

	it("should enforce maximum input length", () => {
		const longString = "a".repeat(10001);
		expect(() => sanitizeInput(longString)).toThrow(
			"Input too long: maximum 10000 characters allowed",
		);
	});
});

describe("parseFlagValue", () => {
	it("parses string type values", () => {
		expect(parseFlagValue("foo")).toEqual("=foo");
		expect(parseFlagValue("bar")).toEqual("=bar");
		expect(parseFlagValue("")).toEqual("=");
	});

	it("parses string array type values", () => {
		expect(parseFlagValue(["foo", "bar"])).toEqual("=foo,bar");
		expect(parseFlagValue(["a", "b", "c"])).toEqual("=a,b,c");
		expect(parseFlagValue([])).toEqual("=");
	});

	it("parses boolean type values", () => {
		expect(parseFlagValue(true)).toEqual("");
		expect(parseFlagValue(false)).toEqual("");
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

	it("sanitizes values in field selectors", () => {
		expect(
			parseFlagValue({
				label: ["$username"],
			}),
		).toEqual("=label=\\$username");
	});

	it("validates input types", () => {
		// Non-string, non-array, non-object values return empty string (boolean behavior)
		expect(parseFlagValue(123 as any)).toEqual("");
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
		const longString = "a".repeat(5001);
		expect(() => parseFlagValue(longString)).toThrow(
			"Flag value too long: maximum 5000 characters allowed",
		);
		expect(() => parseFlagValue([longString])).toThrow(
			"Flag value too long: maximum 5000 characters allowed",
		);
	});
});

describe("createFlags", () => {
	it("creates flags from a flag object", () => {
		expect(createFlags({ someFlag: "foo" })).toEqual(["--some-flag=foo"]);
		expect(createFlags({ anotherFlag: "bar" })).toEqual(["--another-flag=bar"]);
	});

	it("ignores null and falsey values", () => {
		expect(
			createFlags({ someFlag: "foo", anotherFlag: false, andAnother: null }),
		).toEqual(["--some-flag=foo"]);
		expect(
			createFlags({ someFlag: "foo", anotherFlag: undefined, andAnother: "" }),
		).toEqual(["--some-flag=foo"]);
	});

	it("handles empty object", () => {
		expect(createFlags({})).toEqual([]);
	});

	it("handles multiple flags", () => {
		expect(
			createFlags({
				flag1: "value1",
				flag2: "value2",
				flag3: true,
			}),
		).toEqual(["--flag1=value1", "--flag2=value2", "--flag3"]);
	});

	it("sanitizes flag names", () => {
		expect(createFlags({ $specialFlag: "value" })).toEqual([
			"--\\$special-flag=value",
		]);
	});

	it("handles array values", () => {
		expect(createFlags({ items: ["a", "b", "c"] })).toEqual(["--items=a,b,c"]);
	});

	it("handles field selector values", () => {
		expect(
			createFlags({
				fields: { type: ["string"], label: ["username"] },
			}),
		).toEqual(["--fields=label=username,type=string"]);
	});

	it("validates flag names", () => {
		expect(() => createFlags({ "": "value" })).toThrow(
			"Flag names must be non-empty strings",
		);
		// Note: Object.keys() converts numeric keys to strings, so [123] becomes "123"
		expect(() => createFlags({ [123]: "value" })).not.toThrow();
	});

	it("enforces flag limits", () => {
		const manyFlags: Record<string, string> = {};
		for (let i = 0; i < 101; i++) {
			manyFlags[`flag${i}`] = "value";
		}
		expect(() => createFlags(manyFlags)).toThrow(
			"Too many flags: maximum 100 flags allowed",
		);
	});
});

describe("createFieldAssignment", () => {
	it("creates a field assignment from a field assignment object", () => {
		expect(createFieldAssignment(["username", "text", "foo"])).toEqual(
			"username[text]=foo",
		);
		expect(createFieldAssignment(["password", "concealed", "abc123"])).toEqual(
			"password[concealed]=abc123",
		);
	});

	it("handles empty values", () => {
		expect(createFieldAssignment(["field", "text", ""])).toEqual(
			"field[text]=",
		);
	});

	it("sanitizes field assignments", () => {
		expect(createFieldAssignment(["$username", "text", "\\foo"])).toEqual(
			"\\$username[text]=\\\\foo",
		);
		expect(createFieldAssignment(['"field"', "text", "value"])).toEqual(
			'\\"field\\"[text]=value',
		);
	});

	it("validates field assignment structure", () => {
		expect(() => createFieldAssignment([] as any)).toThrow(
			"Field assignment must be an array of [label, type, value] or [label, type, value, purpose]",
		);
		expect(() => createFieldAssignment(["label"] as any)).toThrow(
			"Field assignment must be an array of [label, type, value] or [label, type, value, purpose]",
		);
		expect(() =>
			createFieldAssignment(["label", "text", "value", "extra"] as any),
		).toThrow("Invalid field purpose: must be one of USERNAME, PASSWORD, NOTE");
	});

	it("validates field assignment types", () => {
		expect(() => createFieldAssignment([123, "type", "value"] as any)).toThrow(
			"Field label must be a non-empty string",
		);
		expect(() => createFieldAssignment(["", "text", "value"])).toThrow(
			"Field label must be a non-empty string",
		);
		expect(() => createFieldAssignment(["label", 123, "value"] as any)).toThrow(
			"Field type must be a non-empty string",
		);
		expect(() => createFieldAssignment(["label", "" as any, "value"])).toThrow(
			"Field type must be a non-empty string",
		);
		expect(() => createFieldAssignment(["label", "type", 123] as any)).toThrow(
			"Field value must be a string",
		);
	});

	it("enforces field assignment length limits", () => {
		const longLabel = "a".repeat(201);
		const longType = "a".repeat(51);
		const longValue = "a".repeat(10001);

		expect(() => createFieldAssignment([longLabel, "text", "value"])).toThrow(
			"Field label too long: maximum 200 characters allowed",
		);
		expect(() =>
			createFieldAssignment(["label", longType as any, "value"]),
		).toThrow("Field type too long: maximum 50 characters allowed");
		expect(() => createFieldAssignment(["label", "text", longValue])).toThrow(
			"Field value too long: maximum 10000 characters allowed",
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

	it("sanitizes command parts", () => {
		const result = buildCommand(['"foo'], [], {}, true, {});
		expect(result.parts).toEqual(['\\"foo', "--format=json"]);
	});

	it("sanitizes arguments", () => {
		const result = buildCommand(["foo"], ['"arg"'], {}, true, {});
		expect(result.parts).toEqual(["foo", '\\"arg\\"', "--format=json"]);
	});

	it("sanitizes field assignments", () => {
		const result = buildCommand(
			["foo"],
			[['"field"', "text", "value"]],
			{},
			true,
			{},
		);
		expect(result.parts).toEqual([
			"foo",
			'\\"field\\"[text]=value',
			"--format=json",
		]);
	});

	it("throws error for invalid arguments", () => {
		expect(() => buildCommand(["foo"], [null], {}, true, {})).toThrow(
			new TypeError(
				"Invalid argument: must be string or field assignment array",
			),
		);
	});

	it("validates buildCommand inputs", () => {
		expect(() => buildCommand(null, [], {}, true, {})).toThrow(
			"subCommand must be an array",
		);
		expect(() => buildCommand([], null, {}, true, {})).toThrow(
			"args must be an array",
		);
		const result = buildCommand([], [], {}, true, {});
		expect(result.parts).toEqual(["--format=json"]);
		expect(() => buildCommand([""], [], {}, true, {})).toThrow(
			"Subcommand parts must be non-empty strings",
		);
		expect(() => buildCommand([123] as any, [], {}, true, {})).toThrow(
			"Subcommand parts must be non-empty strings",
		);
	});

	it("enforces argument limits", () => {
		const manyArgs = Array(51).fill("arg");
		expect(() => buildCommand(["cmd"], manyArgs, {}, true, {})).toThrow(
			"Too many arguments: maximum 50 allowed",
		);

		const manySubParts = Array(11).fill("part");
		expect(() => buildCommand(manySubParts, [], {}, true, {})).toThrow(
			"Too many subcommand parts: maximum 10 allowed",
		);
	});

	it("validates stdin input", () => {
		const longString = "a".repeat(10001);
		expect(() => buildCommand(["cmd"], [], {}, true, {}, longString)).toThrow(
			"Stdin input too long: maximum 10000 characters allowed",
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
