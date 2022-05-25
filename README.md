# 1password-js

This package is a simple JavaScript wrapper for the [1Password CLI](https://developer.1password.com/docs/cli). It provides methods for most of the CLI's [commands](https://developer.1password.com/docs/cli/reference), and in many cases extends the CLI's ability to authenticate using [biometrics](https://developer.1password.com/docs/cli/about-biometric-unlock) to whatever Node-based application you're building. It also includes TypeScript declarations.

## Installation

Install using Yarn:

```shell
yarn add @1password/1password-js
```

Or using NPM:

```shell
npm install @1password/1password-js
```

## Usage

After installation you can start using command methods:

```js
import { inject, item, connect } from "@1password/1password-js";

// Some command functions may be directly imported
inject("input.txt", {
	outFile: "./output.txt",
});

// But most exist on their parent command's object
item.get("x1oszeq62e2ys32v9a3l2sgcwly");

// And sub-commands are nested even further
connect.group.revoke({
	group: "MyGroup",
	allServers: true,
});
```

The CLI takes flags as `kebab-case`, however to align better with JS object convention all flags should be provided as `camelCase`.

All command methods support support [global command flags](https://developer.1password.com/docs/cli/reference#global-flags), as well as their own flags, but this package also provides a helper to set global command flags do you don't need to each time. For example:

```js
import { setGlobalFlags } from "@1password/1password-js";

setGlobalFlags({
	account: "example.1password.com",
});
```

Note that you should not try to set the `--format` flag as this is set under the hood to `json` for all commands that can return JSON format; it is otherwise a string response.

## License

MIT
