import type { Config } from "jest";

const config: Config = {
	testEnvironment: "node",
	preset: "ts-jest/presets/js-with-ts",
	transform: {
		"^.+\\.(ts|tsx|js|jsx)$": "ts-jest",
	},
	testMatch: ["<rootDir>/src/**/*.test.ts"],
	moduleFileExtensions: ["ts", "js", "json", "node"],
	testPathIgnorePatterns: [
		"<rootDir>/dist/",
		"<rootDir>/node_modules/",
		"<rootDir>/.git/",
	],
	clearMocks: true,
	verbose: true,
};

export default config;
