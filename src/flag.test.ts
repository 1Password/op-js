import Flag from "./flag";

describe("Flag", () => {
	describe("toCommandFlag", () => {
		it("converts a boolean flag to the correct command flag", () => {
			const flag = new Flag(true);
			const name = "myFlag";
			const expected = "--my-flag";
			expect(flag.toCommandFlag(name)).toEqual(expected);
		});

		it("converts a string flag to the correct command flag", () => {
			const flag = new Flag("hello world");
			const name = "myFlag";
			const expected = "--my-flag=hello world";
			expect(flag.toCommandFlag(name)).toEqual(expected);
		});

		it("converts an array flag to the correct command flag", () => {
			const flag = new Flag(["hello", "world"]);
			const name = "myFlag";
			const expected = "--my-flag=hello,world";
			expect(flag.toCommandFlag(name)).toEqual(expected);
		});

		it("requires command flag name to be alphabetic", () => {
			const flag = new Flag("foo");
			const name = "myFlag:;";
			expect(() => flag.toCommandFlag(name)).toThrowError(
				"Input must contain only alphabetic characters",
			);
		});
	});
});
