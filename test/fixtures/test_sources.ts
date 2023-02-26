/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     test_sources.ts
 * Date:     25.Feb.2023
 *
 * ==============================================================================
 * File containing test sources and the ranges of certain test names in these.
 */

import * as vscode from "vscode";

/* eslint-disable no-magic-numbers */

export const testSource1 = `(*******************************************************************************
    Some tests. *)

let%test "parse true" =
  Alcotest.(check bool) "parse true" true (Bool true = parse "true")

let%test "parse false" =
  Alcotest.(check bool) "parse false" true (Bool false = parse "false")

let%test "parse not true" =
  Alcotest.(check bool)
    "parse not true" true
    (Unop (Not, Bool true) = parse "not true")

let%test "parse not false" =
  Alcotest.(check bool)
    "parse not false" true
    (Unop (Not, Bool false) = parse "not false")

let%test "parse 1" = Alcotest.(check bool) "parse 1" true (Int 1 = parse "1")

let%test "parse 1.1" =
  Alcotest.(check bool) "parse 1.1" true (Float 1.1 = parse "1.1")

let%test "parse -1" =
  Alcotest.(check bool) "parse -1" true (Unop (Minus, Int 1) = parse "-1")

let%test "parse -1.1" =
  Alcotest.(check bool)
    "parse -1.1" true
    (Unop (Minus, Float 1.1) = parse "-1.1")

let%test "parse 11+11" =
  Alcotest.(check bool)
    "parse 11+11" true
    (Binop (Add, Int 11, Int 11) = parse "11+11")

let%test "parse not true" =
  Alcotest.(check bool)
    "parse not true" true
    (Binop (Add, Float 21., Float 21.2) = parse "21.+21.2")

let%test "parse 11-11" =
  Alcotest.(check bool)
    "parse 11-11" true
    (Binop (Subtr, Int 11, Int 11) = parse "11-11")

let%test "parse 21.-21.2" =
  Alcotest.(check bool)
    "parse 21.-21.2" true
    (Binop (Subtr, Float 21., Float 21.2) = parse "21.-21.2")

let%test "parse 11*11" =
  Alcotest.(check bool)
    "parse 11*11" true
    (Binop (Mult, Int 11, Int 11) = parse "11*11")

let%test "parse 21.*21.2" =
  Alcotest.(check bool)
    "parse 21.*21.2" true
    (Binop (Mult, Float 21., Float 21.2) = parse "21.*21.2")

let%test
  "parse 11/-11" =
    Alcotest.(check bool)
      "parse 11/-11" true
      (Binop (Div, Int 11, Unop (Minus, Int 11)) = parse "11/-11")

let%test
"parse 21./-21.2" =
  Alcotest.(check bool)
    "parse 21./-21.2" true
    (Binop (Div, Float 21., Unop (Minus, Float 21.2)) = parse "21./-21.2")

(* =============================================================================
   Error messages
*)
`;

/**
 * The location of "parse 11*11" in `testSource1`.
 */
export const testSource1Range = new vscode.Range(
    new vscode.Position(52, 9),
    new vscode.Position(52, 21)
);

/**
 * The location of "parse 11/-11" in `testSource1`.
 */
export const testSource1Range2 = new vscode.Range(
    new vscode.Position(63, 2),
    new vscode.Position(63, 15)
);

/**
 * The location of "parse 21./-21.2" in `testSource1`.
 */
export const testSource1Range3 = new vscode.Range(
    new vscode.Position(69, 0),
    new vscode.Position(69, 16)
);

/**
 * The location of "parse 11*11" in `testSource1`, searching for inline tests.
 */
export const testSource1RangeInl = new vscode.Range(
    new vscode.Position(52, 0),
    new vscode.Position(52, 21)
);

/**
 * The location of "parse 11/-11" in `testSource1`, searching for inline tests.
 */
export const testSource1Range2Inl = new vscode.Range(
    new vscode.Position(62, 0),
    new vscode.Position(63, 15)
);

/**
 * The location of "parse 21./-21.2" in `testSource1`, searching for inline tests.
 */
export const testSource1Range3Inl = new vscode.Range(
    new vscode.Position(68, 0),
    new vscode.Position(69, 16)
);
