/** @type {import('@jest/types/build/Config').DefaultOptions} */
module.exports = {
	roots: ["<rootDir>"],
	testEnvironment: "jest-environment-jsdom",
	preset: "ts-jest/presets/js-with-ts",
	transform: {
		"^.+\\.(ts|js)?$": "ts-jest",
	},
	testPathIgnorePatterns: [
		"<rootDir>/dist",
		"<rootDir>/node_modules",
	],
};
