# OCaml Alcotest Test Explorer for Visual Studio Code Changelog

## Version 0.2.0 (2023-02-27)

- Drop support for VS Code versions < 1.65 (February 2022) because of [Testing refresh action](https://code.visualstudio.com/updates/v1_65#_testing-refresh-action-and-sorttext)
- Test discovery can be triggered by the 'Refresh' button in the Test Explorer view

### Bugfixes

- Remove deleted tests from the Test Explorer tree
- Find multiline inline test case names like `let%test\nTEST_CASE_NAME`
- README.md: fix link to Alcotest

### Internal Changes

- Refactor test name parsing in source files to new function in [./src/parsing.ts](./src/parsing.ts) and add tests

## Version 0.1.0 (2023-02-25)

Initial release
