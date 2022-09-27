# op-js

This package is a simple JavaScript wrapper for the [1Password CLI](https://developer.1password.com/docs/cli). It provides methods for most of the CLI's [commands](https://developer.1password.com/docs/cli/reference), and in many cases extends the CLI's ability to authenticate using [biometrics](https://developer.1password.com/docs/cli/about-biometric-unlock) to whatever Node-based application you're building. It also includes TypeScript declarations.

## Installation

Install using Yarn:

```shell
yarn add @1password/op-js
```

Or using NPM:

```shell
npm install @1password/op-js
```

## Usage

After installation you can start using command methods:

```js
import { version, item, connect } from "@1password/op-js";

// Some command functions may be directly imported
version();

// But most exist on their parent command's object
item.get("x1oszeq62e2ys32v9a3l2sgcwly");

// And sub-commands are nested even further
connect.group.revoke({
	group: "MyGroup",
	allServers: true,
});
```

The CLI takes flags as `kebab-case`, however to align better with JS object convention all flags should be provided as `camelCase`.

### Flags

All command methods support support [global command flags](https://developer.1password.com/docs/cli/reference#global-flags), as well as their own flags, but this package also provides a helper to set global command flags do you don't need to each time. For example:

```js
import { setGlobalFlags } from "@1password/op-js";

setGlobalFlags({
	account: "example.1password.com",
});
```

Note that you should not try to set the `--format` flag as this is set under the hood to `json` for all commands that can return JSON format; it is otherwise a string response.

### Validating the CLI

Since this package depends on the 1Password CLI it's up to the user to install it, and the types may depend on a specific version. There is a function that your application can call to validate that the user has the CLI installed at a specific version:

```js
import { validateCli } from "@1password/op-js";

validateCli().catch((error) => {
	console.log("CLI is not valid:", error.message);
});

// defaults to the recommended version, but you can supply a semver:
validateCli(">=2.3.1").catch((error) => {
	console.log("CLI is not valid:", error.message);
});
```

### Available commands and functions

There are roughly 70 commands available for use, so you're encouraged to check out the main [`index.ts`](./src/index.ts) file to get a better sense of what's available. Generally, though, here are the top-level commands/namespaces you can import:

- `version` - Retrieve the current version of the CLI
- `inject` - Inject secrets into a config file
- `read` - Read a secret by secret references
- `account` - Manage accounts
- `document` - Manage documents in a vault
- `eventsApi` - Create an Events API integration token
- `connect` - Manage Connect groups, services, tokens, and vaults
- `item` - Manage vault items and templates
- `vault` - Manage account vaults
- `user` - Manage account users
- `group` - Manage groups and their users
- `whoami` - Get details about the authenticated account

## License

MIT
