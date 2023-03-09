import { camelToHyphen, semverToInt } from "./utils";

describe("semverToInt", () => {
	it.each([
		["0.1.2", "000102"],
		["1.2.3", "010203"],
		["12.2.39", "120239"],
		["2.1.284", "0201284"],
	])('convert "%s" to "%s"', (input, output) =>
		expect(semverToInt(input)).toEqual(output),
	);
});

describe("camelToHyphen", () => {
	const expected = "hello-world";

	it.each(["helloWorld", "HelloWorld", "hello-world"])(
		`should convert '%s' to '${expected}'`,
		(input) => {
			expect(camelToHyphen(input)).toEqual(expected);
		},
	);
});
