export const semverToInt = (value: string) =>
	value
		.split(".")
		.map((n) => n.padStart(2, "0"))
		.join("");

export const camelToHyphen = (value: string) =>
	value.replace(/([A-Za-z])(?=[A-Z])/g, "$1-").toLowerCase();
