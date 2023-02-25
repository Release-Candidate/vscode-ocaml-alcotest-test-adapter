# ![Alcotest logo](./images/alcotest-logo_rect.png) OCaml Alcotest Test Explorer for Visual Studio Code

[![Lint](https://github.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/actions/workflows/lint.yml/badge.svg)](https://github.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/actions/workflows/lint.yml)

This extension lets you run OCaml [Alcotests](<https://github.com/mirage/alcotest>) and [inline Alcotests](https://gitlab.com/gopiandcode/ppx-inline-alcotest) with the (native) Test Explorer UI.

![Animation of a test run](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/main/images/run_tests.gif)

- [Features and drawbacks](#features-and-drawbacks)
  - [Drawbacks](#drawbacks)
- [Getting started](#getting-started)
  - [Dependencies](#dependencies)
  - [Installation](#installation)
  - [Q \& A](#q--a)
    - [Q: What do the groups in the Test Explorer view mean?](#q-what-do-the-groups-in-the-test-explorer-view-mean)
    - [Q: A test has been added, how can I add that to the Test Explorer?](#q-a-test-has-been-added-how-can-i-add-that-to-the-test-explorer)
    - [Q: I am not seeing the full name of my test case, why?](#q-i-am-not-seeing-the-full-name-of-my-test-case-why)
    - [Q: Where can I see the output of the test run(s)?](#q-where-can-i-see-the-output-of-the-test-runs)
    - [Q: What does the red circle with a point in the middle mean?](#q-what-does-the-red-circle-with-a-point-in-the-middle-mean)
    - [Q: Where can I see the log of the extension?](#q-where-can-i-see-the-log-of-the-extension)
    - [Q: I have two or more test cases with the same name in the same file, why are they all pointing to the first test case in the source file?](#q-i-have-two-or-more-test-cases-with-the-same-name-in-the-same-file-why-are-they-all-pointing-to-the-first-test-case-in-the-source-file)
- [Configuration](#configuration)
- [Changes](#changes)
- [Contributing](#contributing)
- [License](#license)

## Features and drawbacks

- uses dune to compile and run the tests
- support for 'normal' Alcotests and inline PPX Alcotests
- filtering of tests by name
- parses the test list output of the test runners to fill the Test Explorer view: faster than grepping every source file for test cases and the test tree view is consistent with the test runners
- support for multiple workspaces
- Uses VS Code's native Test Explorer (no additional extension needed)

### Drawbacks

- needs dune
- you need to run a test to discover changes or new test cases
- test case names are truncated by the Alcotest test runners
- the assumption is that all test cases of a test are contained in the same source file
- the name of the tests is searched for in source files, so the source's location can be off from the real definition
- the name of test cases is searched for in the source files, so if the same test case name is used more than once in the same file, all tests point to the first usage of this test's name in the source -> a single test in the source view triggers more than one test (but they are different in the Test Explorer's tree view)
- when running tests, every test is run on its own, sequentially (I do not collect the tests to run and dune does not allow more than one running instance in the same directory/workspace)
- Alcotest suit names are not used, because they are not printed in the output of the test list
- Uses VS Code's native Test Explorer UI

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

### Q & A

#### Q: What do the groups in the Test Explorer view mean?

![The Test Explorer's tree view](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/main/images/treeview.png)

A: Every workspace folder in the current project has it's own node, `Workspace: WORKSPACE_NAME`. If the project is a single workspace, only one of these exists. A group `Alcotest Tests` containing 'normal' Alcotest tests - if any exist at all - and a group `Inline Tests (PPX)` containing inline tests. In these subtrees the test cases are grouped by tests ('normal' tests) or filename (inline tests).

#### Q: A test has been added, how can I add that to the Test Explorer?

A: Run any test case to re-discover all tests in the same workspace. **Note:** it's best to run a test case that does not take long.

#### Q: I am not seeing the full name of my test case, why?

A: Alcotest test runners truncate too long (for some definition of 'too long') test case names. It also adds a point at the end of each test case name if it doesn't already have one which I have to remove to be able to grep for test case names.

#### Q: Where can I see the output of the test run(s)?

A: You can either click the `Show Output` button in the upper right corner of the Test Explorer to see the output in a new terminal window,
![Show test output in terminal](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/main/images/test_output_terminal.png)
click on `Go To Test` to the right of a failed test in the test explorer and then `Peek Error` or `Peek Test Output`
![Peek Error or Peek Test Output](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/main/images/peek_error.png)
or hover over the [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) output in the source file - this preview is too narrow, so the test output is mangled.
![HOver over the Error Lens text](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/main/images/hover_error_lens.png)

#### Q: What does the red circle with a point in the middle mean?

![Compile error](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/main/images/compile_error.png)
A: That means that dune returned an error (not a failed test). Mostly because of code that does not compile.

#### Q: Where can I see the log of the extension?

![Output tab of Alcotest Extension](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/main/images/output.png)

A: In the `OUTPUT` tab of the Panel, you have to select the extension named `Alcotest Tests` in the upper right drop-down menu.

#### Q: I have two or more test cases with the same name in the same file, why are they all pointing to the first test case in the source file?

A: Because I am only grepping for the test case name all the tests are mapped to the first test case in the source. By right clicking the test run symbol in the source view you can run any of these instead of all at the same time (three test cases with name `-42` in the image). In Test Explorer tree they are separate nodes.
![Three tests with the same name in the same file](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-alcotest-test-adapter/main/images/same_name.png)

## Configuration

- `alcotest.testDirectories` - Array of strings containing the relative (to the workspace root directory) paths to the test directories to search for dune configuration files. The default is `[ "test", "tests"]`. If your dune test configuration files are contained other directories, add these directories to this list.

## Changes

See file [CHANGELOG.md](CHANGELOG.md).

## Contributing

See file [CONTRIBUTING.md](CONTRIBUTING.md)

## License

OCaml Alcotest Test Explorer for Visual Studio Code is licensed under MIT license. See file [LICENSE](LICENSE)
