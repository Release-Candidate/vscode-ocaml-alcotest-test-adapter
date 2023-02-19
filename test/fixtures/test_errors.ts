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
                id: 26,
                name: "comment should be ign..",
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
                id: 25,
                name: "let ... if ... 2",
            },
            {
                id: 26,
                name: "comment should be ign..",
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
        tests: [{ id: 11, name: "parse 1" }],
    },
];
