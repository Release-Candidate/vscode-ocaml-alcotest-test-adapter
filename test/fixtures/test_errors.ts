/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     test_errors.ts
 * Date:     19.Feb.2023
 *
 * =============================================================================
 * Strings that contain Alcotest test runs with errors and the expected result
 * objects.
 */

import { TestType } from "../../src/parsing";

/**
 * The output of a test runner if no tests have been found to run.
 */
export const noTestsFound = `Invalid request (no tests to run, filter skipped everything)!
`;

/**
 * This test failed because of an exception.
 * The error is: suite: 'AlOcaml', group: 'Environment Model tests', id: 4,
 * name: '11.+    11'.
 */
export const exceptionError = `Testing \`AlOcaml'.
This run has ID \`WHF3OZ3W'.

SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSFSSSSSSSSSSSSSSS
SSSSSSSSSSSSSSSSS

┌──────────────────────────────────────────────────────────────────────────────┐
│ [FAIL]        Environment Model tests          4   11.+    11.               │
└──────────────────────────────────────────────────────────────────────────────┘
[exception] Alocaml.Interp_common.TypeError("not a function type!")
            Raised at Alocaml__Interp_common.type_error in file "lib/interp_common.ml", line 98, characters 19-38
            Called from Alocaml__Interp.typeof_binop in file "lib/interp.ml", line 68, characters 28-41
            Called from Alocaml__Interp.typecheck in file "lib/interp.ml" (inlined), line 160, characters 9-25
            Called from Alocaml__Interp.interp_env in file "lib/interp.ml", line 276, characters 2-25
            Called from Dune__exe__Test.test_interp_env in file "test/test.ml", line 59, characters 45-78
            Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23
            Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35

Logs saved to \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml/Environment Model tests.004.output'.
 ──────────────────────────────────────────────────────────────────────────────

Full test results in \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml'.
1 failure! in 0.000s. 1 test run.`;

/**
 * The result object of parsing `exceptionError`.
 */
export const exceptionErrorObject: { name: string; tests: TestType[] }[] = [
    {
        name: "Environment Model tests",
        tests: [
            {
                actual: 'Alocaml.Interp_common.TypeError("not a function type!")\n            Raised at Alocaml__Interp_common.type_error in file "lib/interp_common.ml", line 98, characters 19-38\n            Called from Alocaml__Interp.typeof_binop in file "lib/interp.ml", line 68, characters 28-41\n            Called from Alocaml__Interp.typecheck in file "lib/interp.ml" (inlined), line 160, characters 9-25\n            Called from Alocaml__Interp.interp_env in file "lib/interp.ml", line 276, characters 2-25\n            Called from Dune__exe__Test.test_interp_env in file "test/test.ml", line 59, characters 45-78\n            Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23\n            Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35',
                id: 4,
                name: "11.+    11",
            },
        ],
    },
];

/**
 * The error is: suite: 'AlOcaml', group: 'Big Step tests', id: 26,
 * name: 'comment should be ign...'.
 */
export const oneError = `Testing \`AlOcaml'.
This run has ID \`VTPVT45N'.

SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSFSSSSSSSSSSSSSSSSSSSS
SSSSSSSSSSSSSSSSS

┌──────────────────────────────────────────────────────────────────────────────┐
│ [FAIL]        Big Step tests                  26   comment should be ign...  │
└──────────────────────────────────────────────────────────────────────────────┘
ASSERT same strings
FAIL same strings

   Expected: \`"221"'
   Received: \`"22"'

Raised at Alcotest_engine__Test.check in file "src/alcotest-engine/test.ml", line 196, characters 4-261
Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23
Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35

Logs saved to \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml/Big Step tests.026.output'.
 ──────────────────────────────────────────────────────────────────────────────

Full test results in \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml'.
1 failure! in 0.000s. 1 test run.`;

/**
 * The result object of parsing `oneError`.
 */
export const oneErrorObject = [
    {
        name: "Big Step tests",
        tests: [
            {
                actual: '"22"',
                expected: '"221"',
                id: 26,
                name: "comment should be ign",
            },
        ],
    },
];

/**
 * The errors are:
 * suite: 'AlOcaml', group: 'Big Step tests', id: 25, name: 'let ... if ... 2.'.
 * suite: 'AlOcaml', group: 'Big Step tests', id: 26, name: 'comment should be ign...'.
 */
export const twoErrors = `Testing \`AlOcaml'.
This run has ID \`1210QBDN'.

..........................................................FF....................
.................

┌──────────────────────────────────────────────────────────────────────────────┐
│ [FAIL]        Big Step tests                  25   let ... if ... 2.         │
└──────────────────────────────────────────────────────────────────────────────┘
ASSERT same strings
FAIL same strings

   Expected: \`"01"'
   Received: \`"0"'

Raised at Alcotest_engine__Test.check in file "src/alcotest-engine/test.ml", line 196, characters 4-261
Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23
Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35

Logs saved to \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml/Big Step tests.025.output'.
 ──────────────────────────────────────────────────────────────────────────────


┌──────────────────────────────────────────────────────────────────────────────┐
│ [FAIL]        Big Step tests                  26   comment should be ign...  │
└──────────────────────────────────────────────────────────────────────────────┘
ASSERT same strings
FAIL same strings

   Expected: \`"221"'
   Received: \`"22"'

Raised at Alcotest_engine__Test.check in file "src/alcotest-engine/test.ml", line 196, characters 4-261
Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23
Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35

Logs saved to \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml/Big Step tests.026.output'.
 ──────────────────────────────────────────────────────────────────────────────

Full test results in \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml'.
2 failures! in 0.008s. 97 tests run.`;

/**
 * The result object of parsing `twoErrors`.
 */
export const twoErrorsObject = [
    {
        name: "Big Step tests",
        tests: [
            {
                actual: '"0"',
                expected: '"01"',
                id: 25,
                name: "let ... if ... 2",
            },
            {
                actual: '"22"',
                expected: '"221"',
                id: 26,
                name: "comment should be ign",
            },
        ],
    },
];

/**
 * Three failed tests, two with a 'normal' failure and one exception.
 * To test whether the regexps correctly parse mixed error messages.
 */
export const threeErrors1 = `Testing \`AlOcaml'.
This run has ID \`1210QBDN'.

..........................................................FF....................
.................

┌──────────────────────────────────────────────────────────────────────────────┐
│ [FAIL]        Big Step tests                  25   let ... if ... 2.         │
└──────────────────────────────────────────────────────────────────────────────┘
ASSERT same strings
FAIL same strings

   Expected: \`"01"'
   Received: \`"0"'

Raised at Alcotest_engine__Test.check in file "src/alcotest-engine/test.ml", line 196, characters 4-261
Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23
Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35

Logs saved to \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml/Big Step tests.025.output'.
 ──────────────────────────────────────────────────────────────────────────────

┌──────────────────────────────────────────────────────────────────────────────┐
│ [FAIL]        Environment Model tests          4   11.+    11.               │
└──────────────────────────────────────────────────────────────────────────────┘
[exception] Alocaml.Interp_common.TypeError("not a function type!")
            Raised at Alocaml__Interp_common.type_error in file "lib/interp_common.ml", line 98, characters 19-38
            Called from Alocaml__Interp.typeof_binop in file "lib/interp.ml", line 68, characters 28-41
            Called from Alocaml__Interp.typecheck in file "lib/interp.ml" (inlined), line 160, characters 9-25
            Called from Alocaml__Interp.interp_env in file "lib/interp.ml", line 276, characters 2-25
            Called from Dune__exe__Test.test_interp_env in file "test/test.ml", line 59, characters 45-78
            Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23
            Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35

Logs saved to \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml/Environment Model tests.004.output'.
 ──────────────────────────────────────────────────────────────────────────────


┌──────────────────────────────────────────────────────────────────────────────┐
│ [FAIL]        Big Step tests                  26   comment should be ign...  │
└──────────────────────────────────────────────────────────────────────────────┘
ASSERT same strings
FAIL same strings

   Expected: \`"221"'
   Received: \`"22"'

Raised at Alcotest_engine__Test.check in file "src/alcotest-engine/test.ml", line 196, characters 4-261
Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23
Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35

Logs saved to \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml/Big Step tests.026.output'.
 ──────────────────────────────────────────────────────────────────────────────

Full test results in \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml'.
2 failures! in 0.008s. 97 tests run.`;

/**
 * Three failed tests, two with a 'normal' failure and one exception.
 * To test whether the regexps correctly parse mixed error messages.
 */
export const threeErrors2 = `Testing \`AlOcaml'.
This run has ID \`1210QBDN'.

..........................................................FF....................
.................

┌──────────────────────────────────────────────────────────────────────────────┐
│ [FAIL]        Big Step tests                  25   let ... if ... 2.         │
└──────────────────────────────────────────────────────────────────────────────┘
ASSERT same strings
FAIL same strings

   Expected: \`"01"'
   Received: \`"0"'

Raised at Alcotest_engine__Test.check in file "src/alcotest-engine/test.ml", line 196, characters 4-261
Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23
Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35

Logs saved to \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml/Big Step tests.025.output'.
 ──────────────────────────────────────────────────────────────────────────────


┌──────────────────────────────────────────────────────────────────────────────┐
│ [FAIL]        Big Step tests                  26   comment should be ign...  │
└──────────────────────────────────────────────────────────────────────────────┘
ASSERT same strings
FAIL same strings

   Expected: \`"221"'
   Received: \`"22"'

Raised at Alcotest_engine__Test.check in file "src/alcotest-engine/test.ml", line 196, characters 4-261
Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23
Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35

Logs saved to \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml/Big Step tests.026.output'.
 ──────────────────────────────────────────────────────────────────────────────

┌──────────────────────────────────────────────────────────────────────────────┐
│ [FAIL]        Environment Model tests          4   11.+    11.               │
└──────────────────────────────────────────────────────────────────────────────┘
[exception] Alocaml.Interp_common.TypeError("not a function type!")
            Raised at Alocaml__Interp_common.type_error in file "lib/interp_common.ml", line 98, characters 19-38
            Called from Alocaml__Interp.typeof_binop in file "lib/interp.ml", line 68, characters 28-41
            Called from Alocaml__Interp.typecheck in file "lib/interp.ml" (inlined), line 160, characters 9-25
            Called from Alocaml__Interp.interp_env in file "lib/interp.ml", line 276, characters 2-25
            Called from Dune__exe__Test.test_interp_env in file "test/test.ml", line 59, characters 45-78
            Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23
            Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35

Logs saved to \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml/Environment Model tests.004.output'.
 ──────────────────────────────────────────────────────────────────────────────

Full test results in \`~/Documents/code/OCaml-Interp/_build/_tests/AlOcaml'.
1 failure! in 0.000s. 1 test run.`;

/**
 * The result object of parsing `threeErrors1` and `threeErrors2`.
 */
export const threeErrorsObject = [
    {
        name: "Big Step tests",
        tests: [
            {
                actual: '"0"',
                expected: '"01"',
                id: 25,
                name: "let ... if ... 2",
            },
            {
                actual: '"22"',
                expected: '"221"',
                id: 26,
                name: "comment should be ign",
            },
        ],
    },
    {
        name: "Environment Model tests",
        tests: [
            {
                actual: 'Alocaml.Interp_common.TypeError("not a function type!")\n            Raised at Alocaml__Interp_common.type_error in file "lib/interp_common.ml", line 98, characters 19-38\n            Called from Alocaml__Interp.typeof_binop in file "lib/interp.ml", line 68, characters 28-41\n            Called from Alocaml__Interp.typecheck in file "lib/interp.ml" (inlined), line 160, characters 9-25\n            Called from Alocaml__Interp.interp_env in file "lib/interp.ml", line 276, characters 2-25\n            Called from Dune__exe__Test.test_interp_env in file "test/test.ml", line 59, characters 45-78\n            Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23\n            Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35',
                id: 4,
                name: "11.+    11",
            },
        ],
    },
];

/**
 * The error is: suite: 'Inline Tests', group: 'lib/interp_common.ml',
 * id: 11, name: 'parse 1.'
 */
export const oneErrorInline = `Testing \`_build/default/lib/'.
This run has ID \`1VEG7NUJ'.

SSSSSSSSSSSFSSSS

┌──────────────────────────────────────────────────────────────────────────────┐
│ [FAIL]        lib/interp_common.ml         11   parse 1.                     │
└──────────────────────────────────────────────────────────────────────────────┘
ASSERT parse 1
FAIL parse 1

   Expected: \`false'
   Received: \`true'

Raised at Alcotest_engine__Test.check in file "src/alcotest-engine/test.ml", line 196, characters 4-261
Called from Alcotest_engine__Core.Make.protect_test.(fun) in file "src/alcotest-engine/core.ml", line 180, characters 17-23
Called from Alcotest_engine__Monad.Identity.catch in file "src/alcotest-engine/monad.ml", line 24, characters 31-35

Logs saved to \`~/Documents/code/OCaml-Interp/_build/_tests/_build-default-lib-/lib-interp_common.ml.011.output'.
 ──────────────────────────────────────────────────────────────────────────────

Full test results in \`~/Documents/code/OCaml-Interp/_build/_tests/_build-default-lib-'.
1 failure! in 0.000s. 1 test run.`;

/**
 * The result object of parsing `oneErrorInline`.
 */
export const oneErrorInlineObject = [
    {
        name: "lib/interp_common.ml",
        tests: [{ actual: "true", expected: "false", id: 11, name: "parse 1" }],
    },
];
