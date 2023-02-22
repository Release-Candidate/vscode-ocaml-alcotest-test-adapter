# ![Alcotest logo](./images/alcotest-logo_rect.png) OCaml Alcotest Test Explorer for Visual Studio Code

[![Lint](https://github.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/actions/workflows/lint.yml/badge.svg)](https://github.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/actions/workflows/lint.yml)

This extension lets you run OCaml [Alcotests](<https://github.com/mirage/alcotest>) and [inline Alcotests](https://gitlab.com/gopiandcode/ppx-inline-alcotest) with the (native) Test Explorer UI.

## Getting started

### Dependencies

- Visual Studio Code version 1.59 (July 2021) or higher (for native Test Explorer support)
- [Alcotest](<https://github.com/mirage/alcotest>) or [PPX Inline Alcotest](https://gitlab.com/gopiandcode/ppx-inline-alcotest)
- [Dune](https://dune.build/) the extension uses Dune to build and run the test runners.

### Installation

Either

- install the extension directly from the Visual Studio Code Marketplace [Alcotest Test Explorer](https://marketplace.visualstudio.com/publishers/release-candidate)
- or download the extension from the [latest release at GitHub](https://github.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/releases/latest)
- or build the extension yourself by cloning the [GitHub Repository](https://github.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter) and running `yarn install` and `yarn package` in the root directory of the cloned repo.

## Configuration

- `alcotest.testDirectories` - Array of strings containing the relative (to the workspace root directory) paths to the test directories to search for dune configuration files. The default is `[ "test", "tests"]`

## Changes

See file [CHANGELOG.md](CHANGELOG.md).

## Contributing

See file [CONTRIBUTING.md](CONTRIBUTING.md)

## License

OCaml Alcotest Test Explorer for Visual Studio Code is licensed under MIT license. See file [LICENSE](LICENSE)
