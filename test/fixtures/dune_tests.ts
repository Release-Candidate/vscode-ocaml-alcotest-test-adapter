/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     dune_tests.ts
 * Date:     21.Feb.2023
 *
 * ==============================================================================
 * Dune test definition examples and expected results of parsing them.
 */

export const duneFile1 = `(test
 (name test)
 (libraries alcotest lib1 lib2
    another-lib3))`;

/**
 * The array of test executables resulting from parsing `duneFile1`.
 */
export const duneFile1Exe = ["./test.exe"];

export const duneFile2 = `(tests
 (names
  testName1
  testName2 testName3 testName4
  )
 (libraries alcotest
    lib1
    lib2
    another-lib3))`;

/**
 * The array of test executables resulting from parsing `duneFile2`.
 */
export const duneFile2Exe = [
    "./testName1.exe",
    "./testName2.exe",
    "./testName3.exe",
    "./testName4.exe",
];

export const duneFile3 = `(executable
 (name main)
 (libraries lib1 lib2 )
 (preprocess (pps some_ppx)))

(alias
 (name runtest)
 (package package-name)
 (action (run %{exe:main.exe})))`;

/**
 * The array of test executables resulting from parsing `duneFile3`.
 */
export const duneFile3Exe = ["./main.exe"];

export const duneFile4 = `(executables
 (names test test2)
 (libraries
  alcotest
  alcotest-lwt
  lib1 lib2
  lib3 )
 (preprocess
  (pps some_ppx)))

(rule
 (alias runtest)
 (package package-1)
 (deps
  (source_tree src2)
  (package package3))
 (action
  (run ./test2.exe -e)))

(rule
 (alias runtest)
 (package package-2)
 (deps
  (source_tree src1)
  (package package4))
 (action
  (run ./test.exe)))`;

/**
 * The array of test executables resulting from parsing `duneFile4`.
 */
export const duneFile4Exe = ["./test2.exe", "./test.exe"];
