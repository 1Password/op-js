# op-js

This package is a simple JavaScript wrapper for the [1Password CLI](https://developer.1password.com/docs/cli). It provides methods for most of the CLI's [commands](https://developer.1password.com/docs/cli/reference), and in many cases extends the CLI's ability to authenticate using [biometrics](https://developer.1password.com/docs/cli/about-biometric-unlock) to whatever Node-based application you're building. It also includes TypeScript declarations.

## Installation

Install using pnpm:

```shell
pnpm add @1password/op-js
```

Or using NPM:

```shell
npm install @1password/op-js
```

## Usage

After installation you'll use the `OpCli` class to interact with the 1Password CLI:

```js
import { OpCli } from "@1password/op-js";

const op = new OpCli();

// Get the version of the CLI
op.version();

// Get an item's detail
await op.item.get("x1oszeq62e2ys32v9a3l2sgcwly");
```

The CLI takes flags as `kebab-case`, however to align better with JS object convention all flags should be provided as `camelCase`.

### Verifying the CLI

Since this package depends on the 1Password CLI it's up to the user to install it, and the types may depend on a specific version. You can validate that the user has the CLI installed at a specific version:

```js
// Verify that the executable is available
op.verify().catch((error) => {
	console.log("CLI is not available:", error.message);
});

// Verify the CLI version using a semver version
op.verify(">=2.3.1").catch((error) => {
	console.log("CLI is not valid:", error.message);
});
```

### Available Commands

There are roughly 70 commands available for use, so you're encouraged to check out the main [`index.ts`](./src/index.ts) file to get a better sense of what's available. Generally, though, here are the top-level command namespaces available on the `OpCli` instance:

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

## Configuration

You can configure the `OpCli` instance with global flags, authentication, and other settings.

### Global Flags

All command methods support [global command flags](https://developer.1password.com/docs/cli/reference#global-flags), as well as their own flags. You can set global flags when creating the OpCli instance:

```js
const op = new OpCli({
	globalFlags: { account: "example.1password.com" },
});
```

Note that you should not try to set the `--format` flag as this is set under the hood to `json` for all commands that can return JSON format; it is otherwise a string or null response.

### Authentication

By default `op-js` uses system authentication (e.g. biometrics), but it also supports automated authentication via [Connect Server](https://developer.1password.com/docs/connect) or [Service Account](https://developer.1password.com/docs/service-accounts).

**Connect**

If you've got a Connect Server set up you can configure it when creating the OpCli instance:

```js
const op = new OpCli({
	authConfig: {
		host: "https://connect.myserver.com",
		token: "1kjhd9872hd981865s",
	},
});
```

**Service Account**

If you're using service accounts you can configure it when creating the OpCli instance:

```js
const op = new OpCli({
	authConfig: {
		saToken: "1kjhd9872hd981865s",
	},
});
```

### Custom CLI Path

If you need to use a custom path to the 1Password CLI executable, you can specify it when creating the `OpCli` instance:

```js
const op = new OpCli({
	opPath: "/custom/path/to/op",
});
```

## Contributing and feedback

🐛 If you find an issue you'd like to report, or otherwise have feedback, please [file a new Issue](https://github.com/1Password/op-js/issues/new).

🧑‍💻 If you'd like to contribute to the project please start by filing or commenting on an [Issue](https://github.com/1Password/op-js/issues) so we can track the work. Refer to the [Contributing doc](https://github.com/1Password/op-js/blob/main/CONTRIBUTING.md) for development setup instructions.

💬 Share your feedback and connect with the Developer Products team in the [1Password Developers Slack](https://developer.1password.com/joinslack) workspace.

## License

MIT
