import { camelToHyphen } from "./utils";

export type FlagPrimitives = string | string[] | boolean;
export type Flags = Record<string, FlagPrimitives | Flag>;

export default class Flag {
	public constructor(private value: FlagPrimitives) {}

	public toCommandFlag(name: string) {
		if (!/^[A-Za-z]+$/.test(name)) {
			throw new Error("Input must contain only alphabetic characters");
		}

		let value = "";
		if (typeof this.value === "string") {
			value = `=${this.value}`;
		} else if (Array.isArray(this.value)) {
			value = `=${this.value.join(",")}`;
		}

		return `--${camelToHyphen(name)}${value}`;
	}
}
