# Contributing

- [What does the extension do?](#what-does-the-extension-do)
- [Setup](#setup)
- [Sources](#sources)
- [Build commands](#build-commands)
  - [Internal targets](#internal-targets)

## What does the extension do?

On starting the extension - see `activationEvents` in [./package.json](./package.json) and function `activate` in [./src/extension.ts](./src/extension.ts):

- add, update or remove tests to Test Explorer's test tree for every existing workspace (folder) in the current workspace:
  - inline tests:
    - search for the inline test runner executables
    - run every one of them with `dune exec` so that the test runners are recompiled if necessary.
    - use test runner arguments to print the list of tests
    - parse this output and add, update or remove nodes in the Test Explorer's tree
    - parse source files for the location of the test cases and set them.
  - process 'normal' test cases
    - search for dune configuration files (with name `dune`) in all configured test subdirectories of the current workspace root.
    - grep for test runner executable names in these files
    - the rest is the same as for inline tests ('run every one of them ...')

If a user presses the `Refresh Tests` button - see `controller.refreshHandler`:

- the same as in **add, update or remove tests to Test Explorer's test tree**

If a user runs a test - see function `runHandler` in [./src/run_tests.ts](./src/run_tests.ts):

- as above, add, update or remove tests to Test Explorer's test tree for the workspace that contains the tests to run
- Run the tests:
  - run every single test using `dune exec` on the test runner.
  - parse the output of the test
  - if a test failed, set the 'test message' to the output of the failed test

## Setup

- install [yarn](https://yarnpkg.com/getting-started/install).
- Clone the GitHub repository [vscode-ocaml-alcotest-test-adapter](https://github.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter)
- run `yarn install` to install all dependencies and development dependencies. You need the development dependencies to build and package the extension.
- run `yarn --ignore-engines package` - this generates the extension package `vscode-ocaml-alcotest-test-adapter-VERSION.vsix` which you can install to VS Code

## Sources

- [./src/extension.ts](./src/extension.ts) - the main entry point of the extension
- [./src/list_tests.ts](./src/list_tests.ts) - parse and generate the list of test cases / tree
- [./src/run_tests.ts](./src/run_tests.ts) - run tests
- [./src/constants.ts](./src/constants.ts) - all constants except for regexps, which are located in [./src/parsing.ts](./src/parsing.ts)
- [./src/extension_helpers.ts](./src/extension_helpers.ts) - all other functions that didn't fit in another file
- [./src/osInteraction.ts](./src/osInteraction.ts) - I/O: run commands, read files, ...
- [./src/parsing.ts](./src/parsing.ts) - parse test runner outputs, parse content of files, ...
- [./test](./test) - tests

## Build commands

The `scripts` field of [package.json](package.json).

All yarn commands add `--ignore-engines` to not get a spurious warning:
`warning vscode-ocaml-alcotest-test-adapter@VERSION:The engine "vscode" appears to be invalid.`

- `yarn --ignore-engines clean` - deletes the directory `./out`
- `yarn --ignore-engines lint` - runs eslint on all source files
- `yarn --ignore-engines lint-github` - runs eslint on all source files, writes report to `./eslint_report.json`
- `yarn --ignore-engines compile` - compiles the Typescript sources to `./out/` and generates the source maps
- `yarn --ignore-engines test` - compiles the extension and runs the tests
- `yarn --ignore-engines esbuild` - compiles the Typescript sources and bundles them to `./out/extension.js` and adds a source map `./out/extension.js.map`. This is used for testing.
- `yarn --ignore-engines esbuild-watch` - runs the same commands as `yarn --ignore-engines esbuild-watch` in watch mode, that is, it re-bundles everything if a file has been changed
- `yarn --ignore-engines bundle` - compiles and minifies the Typescript sources and bundles them to `./out/extension.js`, no source maps are generated. This is used for releases.
- `yarn --ignore-engines package` - generates a VSIX package of the extension. That is, a 'normal' VS Code extension package
- `yarn --ignore-engines publish` - publishes the extension to the marketplace. This needs a working marketplace account and an access token. To publish interactively, you can login with your token first by calling `yarn --ignore-engines vsce login YOUR_PUBLISHER_NAME`, where `YOUR_PUBLISHER_NAME` is the account to publish the extension to.

### Internal targets

- `vscode:prepublish` - used by `yarn --ignore-engines package` (by `vsce package`)
- `esbuild-base` - used by other targets that call Esbuild with additional options
