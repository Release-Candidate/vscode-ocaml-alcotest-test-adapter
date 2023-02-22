/* eslint-disable max-lines */
/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     test_lists.ts
 * Date:     19.Feb.2023
 *
 * ==============================================================================
 * Output of Alcotest 'normal' and inline test lists and the expected result
 * objects.
 */

/**
 * The output of a 'normal' Alcotest test list command.
 */
export const normalList = `Big Step tests                   0   -42.
Big Step tests                   1   4.2.
Big Step tests                   2   11+11.
Big Step tests                   3   11 + 20 -11.
Big Step tests                   4   11.+    11.
Big Step tests                   5   11. -11.
Big Step tests                   6   6* 6.
Big Step tests                   7   -45 /9.
Big Step tests                   8   6    * -6.
Big Step tests                   9   45./9.
Big Step tests                  10   2+2*10.
Big Step tests                  11   2*2+10.
Big Step tests                  12   2 * 2* 10.
Big Step tests                  13   ((6. + 4.) * 4. - 10.) * 2.
Big Step tests                  14   let x = 0 in let x = 22 in x.
Big Step tests                  15   let x = 22 in x.
Big Step tests                  16   unbound var x.
Big Step tests                  17   let x = true in x && not x.
Big Step tests                  18   if guard not bool.
Big Step tests                  19   if true then 22 else 0.
Big Step tests                  20   true.
Big Step tests                  21   1<=1.
Big Step tests                  22   if 1+2 <= 3+4 then 22 else 0.
Big Step tests                  23   if ... then let ...
Big Step tests                  24   let ... if ...
Big Step tests                  25   let ... if ... 2.
Big Step tests                  26   comment should be ignored.
Environment Model tests          0   -42.
Environment Model tests          1   4.2.
Environment Model tests          2   11+11.
Environment Model tests          3   11 -11.
Environment Model tests          4   11.+    11.
Environment Model tests          5   11. -11.
Environment Model tests          6   6* 6.
Environment Model tests          7   -45 /9.
Environment Model tests          8   6    * -6.
Environment Model tests          9   45./9.
Environment Model tests         10   2+2*10.
Environment Model tests         11   2*2+10.
Environment Model tests         12   2 * 2* 10.
Environment Model tests         13   ((6. + 4.) * 4. - 10.) * 2.
Environment Model tests         14   let x = 0 in let x : int = 22 in x.
Environment Model tests         15   let x= 22 in x.
Environment Model tests         16   unbound name x.
Environment Model tests         17   let x : bool = true in x && not x.
Environment Model tests         18   if guard is not bool.
Environment Model tests         19   if true then 22 else 0.
Environment Model tests         20   true.
Environment Model tests         21   1<=1.
Environment Model tests         22   if 1+2 <= 3+4 then 22 else 0.
Environment Model tests         23   if 1+2 <= 3*4 then let x = 22 in x else 0.
Environment Model tests         24   let ... in if...
Environment Model tests         25   let ... in if ... 2.
Environment Model tests         26   let in fun ...
Environment Model tests         27   let in let in fun ...
Environment Model tests         28   fun in fun.
Environment Model tests         29   fun in fun 2.
Environment Model tests         30   error: if guard is a function value.
Environment Model tests         31   then and else branch have differnet types.
Environment Model tests         32   A function is not a value.
Environment Model tests         33   missing function parameter type.
Environment Model tests         34   function parameter: wrong type.
Environment Model tests         35   error: let expression type annotation.
Environment Model tests         36   comment should be ignored.
Parser tests                     0   Bool Test 1.
Parser tests                     1   Bool Test 2.
Parser tests                     2   Int Test 1.
Parser tests                     3   Int Test 2.
Parser tests                     4   Float Test 1.
Parser tests                     5   Float Test 2.
Small Step tests                 0   -42.
Small Step tests                 1   4.2.
Small Step tests                 2   11+11.
Small Step tests                 3   11 -11.
Small Step tests                 4   11.+    11.
Small Step tests                 5   11. -11.
Small Step tests                 6   6* 6.
Small Step tests                 7   -45 /9.
Small Step tests                 8   6    * -6.
Small Step tests                 9   45./9.
Small Step tests                10   2+2*10.
Small Step tests                11   2*2+10.
Small Step tests                12   2 * 2* 10.
Small Step tests                13   ((6. + 4.) * 4. - 10.) * 2.
Small Step tests                14   let x = 0 in let x  = 22 in x.
Small Step tests                15   let x = 22 in x.
Small Step tests                16   unbound var x.
Small Step tests                17   let x  = true in x && not x.
Small Step tests                18   if guard not bool.
Small Step tests                19   if true then 22 else 0.
Small Step tests                20   true.
Small Step tests                21   1<=1.
Small Step tests                22   if 1+2 <= 3+4 then 22 else 0.
Small Step tests                23   if ... then let ... else ...
Small Step tests                24   let ... in if ...
Small Step tests                25   let ... in if ... 2.
Small Step tests                26   Comment in if.`;

/**
 * The result object of parsing `normalList`.
 */
export const normalListObject = [
    {
        name: "Big Step tests",
        tests: [
            {
                id: 0,
                name: "-42",
            },
            {
                id: 1,
                name: "4.2",
            },
            {
                id: 2,
                name: "11+11",
            },
            {
                id: 3,
                name: "11 + 20 -11",
            },
            {
                id: 4,
                name: "11.+    11",
            },
            {
                id: 5,
                name: "11. -11",
            },
            {
                id: 6,
                name: "6* 6",
            },
            {
                id: 7,
                name: "-45 /9",
            },
            {
                id: 8,
                name: "6    * -6",
            },
            {
                id: 9,
                name: "45./9",
            },
            {
                id: 10,
                name: "2+2*10",
            },
            {
                id: 11,
                name: "2*2+10",
            },
            {
                id: 12,
                name: "2 * 2* 10",
            },
            {
                id: 13,
                name: "((6. + 4.) * 4. - 10.) * 2",
            },
            {
                id: 14,
                name: "let x = 0 in let x = 22 in x",
            },
            {
                id: 15,
                name: "let x = 22 in x",
            },
            {
                id: 16,
                name: "unbound var x",
            },
            {
                id: 17,
                name: "let x = true in x && not x",
            },
            {
                id: 18,
                name: "if guard not bool",
            },
            {
                id: 19,
                name: "if true then 22 else 0",
            },
            {
                id: 20,
                name: "true",
            },
            {
                id: 21,
                name: "1<=1",
            },
            {
                id: 22,
                name: "if 1+2 <= 3+4 then 22 else 0",
            },
            {
                id: 23,
                name: "if ... then let ",
            },
            {
                id: 24,
                name: "let ... if ",
            },
            {
                id: 25,
                name: "let ... if ... 2",
            },
            {
                id: 26,
                name: "comment should be ignored",
            },
        ],
    },
    {
        name: "Environment Model tests",
        tests: [
            {
                id: 0,
                name: "-42",
            },
            {
                id: 1,
                name: "4.2",
            },
            {
                id: 2,
                name: "11+11",
            },
            {
                id: 3,
                name: "11 -11",
            },
            {
                id: 4,
                name: "11.+    11",
            },
            {
                id: 5,
                name: "11. -11",
            },
            {
                id: 6,
                name: "6* 6",
            },
            {
                id: 7,
                name: "-45 /9",
            },
            {
                id: 8,
                name: "6    * -6",
            },
            {
                id: 9,
                name: "45./9",
            },
            {
                id: 10,
                name: "2+2*10",
            },
            {
                id: 11,
                name: "2*2+10",
            },
            {
                id: 12,
                name: "2 * 2* 10",
            },
            {
                id: 13,
                name: "((6. + 4.) * 4. - 10.) * 2",
            },
            {
                id: 14,
                name: "let x = 0 in let x : int = 22 in x",
            },
            {
                id: 15,
                name: "let x= 22 in x",
            },
            {
                id: 16,
                name: "unbound name x",
            },
            {
                id: 17,
                name: "let x : bool = true in x && not x",
            },
            {
                id: 18,
                name: "if guard is not bool",
            },
            {
                id: 19,
                name: "if true then 22 else 0",
            },
            {
                id: 20,
                name: "true",
            },
            {
                id: 21,
                name: "1<=1",
            },
            {
                id: 22,
                name: "if 1+2 <= 3+4 then 22 else 0",
            },
            {
                id: 23,
                name: "if 1+2 <= 3*4 then let x = 22 in x else 0",
            },
            {
                id: 24,
                name: "let ... in if",
            },
            {
                id: 25,
                name: "let ... in if ... 2",
            },
            {
                id: 26,
                name: "let in fun ",
            },
            {
                id: 27,
                name: "let in let in fun ",
            },
            {
                id: 28,
                name: "fun in fun",
            },
            {
                id: 29,
                name: "fun in fun 2",
            },
            {
                id: 30,
                name: "error: if guard is a function value",
            },
            {
                id: 31,
                name: "then and else branch have differnet types",
            },
            {
                id: 32,
                name: "A function is not a value",
            },
            {
                id: 33,
                name: "missing function parameter type",
            },
            {
                id: 34,
                name: "function parameter: wrong type",
            },
            {
                id: 35,
                name: "error: let expression type annotation",
            },
            {
                id: 36,
                name: "comment should be ignored",
            },
        ],
    },
    {
        name: "Parser tests",
        tests: [
            {
                id: 0,
                name: "Bool Test 1",
            },
            {
                id: 1,
                name: "Bool Test 2",
            },
            {
                id: 2,
                name: "Int Test 1",
            },
            {
                id: 3,
                name: "Int Test 2",
            },
            {
                id: 4,
                name: "Float Test 1",
            },
            {
                id: 5,
                name: "Float Test 2",
            },
        ],
    },
    {
        name: "Small Step tests",
        tests: [
            {
                id: 0,
                name: "-42",
            },
            {
                id: 1,
                name: "4.2",
            },
            {
                id: 2,
                name: "11+11",
            },
            {
                id: 3,
                name: "11 -11",
            },
            {
                id: 4,
                name: "11.+    11",
            },
            {
                id: 5,
                name: "11. -11",
            },
            {
                id: 6,
                name: "6* 6",
            },
            {
                id: 7,
                name: "-45 /9",
            },
            {
                id: 8,
                name: "6    * -6",
            },
            {
                id: 9,
                name: "45./9",
            },
            {
                id: 10,
                name: "2+2*10",
            },
            {
                id: 11,
                name: "2*2+10",
            },
            {
                id: 12,
                name: "2 * 2* 10",
            },
            {
                id: 13,
                name: "((6. + 4.) * 4. - 10.) * 2",
            },
            {
                id: 14,
                name: "let x = 0 in let x  = 22 in x",
            },
            {
                id: 15,
                name: "let x = 22 in x",
            },
            {
                id: 16,
                name: "unbound var x",
            },
            {
                id: 17,
                name: "let x  = true in x && not x",
            },
            {
                id: 18,
                name: "if guard not bool",
            },
            {
                id: 19,
                name: "if true then 22 else 0",
            },
            {
                id: 20,
                name: "true",
            },
            {
                id: 21,
                name: "1<=1",
            },
            {
                id: 22,
                name: "if 1+2 <= 3+4 then 22 else 0",
            },
            {
                id: 23,
                name: "if ... then let ... else ",
            },
            {
                id: 24,
                name: "let ... in if ",
            },
            {
                id: 25,
                name: "let ... in if ... 2",
            },
            {
                id: 26,
                name: "Comment in if",
            },
        ],
    },
];

/**
 * The output of a list of inline Alcotests.
 */
export const inlineList = `lib/interp_common.ml          0   parse 21./-21.2.
lib/interp_common.ml          1   parse 11/-11.
lib/interp_common.ml          2   parse 21.*21.2.
lib/interp_common.ml          3   parse 11*11.
lib/interp_common.ml          4   parse 21.-21.2.
lib/interp_common.ml          5   parse 11-11.
lib/interp_common.ml          6   parse not true.
lib/interp_common.ml          7   parse 11+11.
lib/interp_common.ml          8   parse -1.1.
lib/interp_common.ml          9   parse -1.
lib/interp_common.ml         10   parse 1.1.
lib/interp_common.ml         11   parse 1.
lib/interp_common.ml         12   parse not false.
lib/interp_common.ml         13   parse not true.
lib/interp_common.ml         14   parse false.
lib/interp_common.ml         15   parse true.`;

/**
 * The result object of parsing `inlineList`.
 */
export const inlineListObject = [
    {
        name: "lib/interp_common.ml",
        tests: [
            {
                id: 0,
                name: "parse 21./-21.2",
            },
            {
                id: 1,
                name: "parse 11/-11",
            },
            {
                id: 2,
                name: "parse 21.*21.2",
            },
            {
                id: 3,
                name: "parse 11*11",
            },
            {
                id: 4,
                name: "parse 21.-21.2",
            },
            {
                id: 5,
                name: "parse 11-11",
            },
            {
                id: 6,
                name: "parse not true",
            },
            {
                id: 7,
                name: "parse 11+11",
            },
            {
                id: 8,
                name: "parse -1.1",
            },
            {
                id: 9,
                name: "parse -1",
            },
            {
                id: 10,
                name: "parse 1.1",
            },
            {
                id: 11,
                name: "parse 1",
            },
            {
                id: 12,
                name: "parse not false",
            },
            {
                id: 13,
                name: "parse not true",
            },
            {
                id: 14,
                name: "parse false",
            },
            {
                id: 15,
                name: "parse true",
            },
        ],
    },
];
