# Contributing

## Development

This is a JavaScript wrapper for 1Password CLI, written in TypeScript.

Requires [Node](https://nodejs.org/en/) and [1Password CLI](https://developer.1password.com/docs/cli/).

### Dependencies

To install dependencies:

```shell
yarn # or yarn install
```

### Running locally

While you're working on this project you should watch for changes:

```shell
yarn watch
```

This will recompile the project into the `/dist` folder whenever a file changes. You can then import the package into a local project for testing purposes.

### Linting and formatting

Code should be linted and formatted where appropriate. We have commands for all types of code in this project:

```shell
# Run Prettier on all TS files
yarn prettier

# Run ESLint on all TS files
yarn eslint

# Typecheck all TS files
yarn typecheck
```

The above commands will only return linting reports. You can optionally attach the appropriate `--fix` / `--write` flag when running the commands, which will modify the files to fix issues that can be done so automatically. Some issues will need to be manually addressed.

#### Pre-commit checks

This project is set up to use [Husky](https://typicode.github.io/husky/), which allows us to hook into Git operations, and [lint-staged](https://www.npmjs.com/package/lint-staged), a way to run commands against globs of files staged in Git.

When you run `git commit` Husky invokes its pre-commit hook, which runs lint-staged, resulting in all the above linter commands getting called with flags set to automatically fix issues. If the linters have issues that can't be automatically addressed the commit will be aborted, giving you a chance to manually fix things. The purpose of this is to enforce code consistency across the project.

There may come a time when you need to skip these checks; to prevent the pre-commit hook from running add `--no-verify` to your commit command.

### Testing

Code should be reasonably tested. We do not currently have any required coverage threshold, but if you are adding new or changing existing functionality you should consider writing/updating tests.

This project uses [Jest](https://jestjs.io/). We have two types of tests at the moment.

- **Unit tests** are for anything broadly applicable to the whole wrapper library that can be broken into units of code, such as command execution, helpers, error handling, etc.
- **Integration tests** are intended to test out the individual command implementations, to assert their expected functionality and schemas. Currently this requires you to use biometrics with a real 1Password account by setting up the following `.env` file:

  ```
  OP_ACCOUNT=[account URL]
  OP_VAULT=[vault name]
  ```

Commands are pretty straightforward:

```shell
# Run the entire unit test suite
yarn test:unit

# Run the entire integration test suite
yarn test:integration

# Run the unit test suite, re-running on changes
yarn test:unit --watch

# Run only integration tests that have a specific description
yarn test:integration -t="returns injected data"
```

## Distribution

### Publishing the package

We have a Workflow set up to automatically publish a new version of [the package on NPM](https://www.npmjs.com/package/@1password/op-js) whenever a new version tag is pushed.

You should only need to do the following on the `main` branch:

```shell
# Replace VERSION with the version you are bumping to
yarn version --new-version VERSION && git push
```

This will:

1. Update the `version` property in `package.json`
2. Commit this version change
3. Create a new version tag
4. Push the commit and tag to the remote

Afterward the Workflow will take over, publishing the package's new version to NPM.
