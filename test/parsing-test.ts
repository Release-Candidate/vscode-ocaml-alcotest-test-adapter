/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     parsing-test.ts
 * Date:     18.Feb.2023
 *
 * ==============================================================================
 * Tests for the parsing module.
 */

import * as chai from "chai";
import * as duneTests from "./fixtures/dune_tests";
import * as mocha from "mocha";
import * as parse from "../src/parsing";
import * as testErrors from "./fixtures/test_errors";
import * as testLists from "./fixtures/test_lists";
import * as testSources from "./fixtures/test_sources";
import * as vscode from "vscode";

/* eslint-disable max-lines-per-function */

/**
 * *****************************************************************************
 * Tests
 */
mocha.describe("Parsing Functions", () => {
    //==========================================================================
    mocha.describe("trim", () => {
        mocha.it("Empty string ''", () => {
            chai.assert.strictEqual(
                "".trim(),
                "",
                "Empty string does not change"
            );
        });
        mocha.it("Just whitespace", () => {
            chai.assert.strictEqual(
                "\n  \t \n  ".trim(),
                "",
                "'\\n  \\t \\n  ' -> ''"
            );
        });
        mocha.it("No whitespace", () => {
            chai.assert.strictEqual(
                "Foobačšľ+ťíéšťr".trim(),
                "Foobačšľ+ťíéšťr",
                "Without whitespace 'Foobačšľ+ťíéšťr' -> no change"
            );
        });
        mocha.it("Inner whitespace", () => {
            chai.assert.strictEqual(
                "Fo o\tb ač\n š ľ+\nť íé š\tťr".trim(),
                "Fo o\tb ač\n š ľ+\nť íé š\tťr",
                "Inner whitespace 'Fo o\\tb ač\\n š ľ+\\nť íé š\\tťr' -> no change"
            );
        });
        mocha.it("Outer whitespace", () => {
            chai.assert.strictEqual(
                "  \t \n foobar\n \t ".trim(),
                "foobar",
                "Outer whitespace should be removed '  \\t \\n foobar\\n \\t '-> 'foobar'"
            );
        });
    });
    //==========================================================================
    mocha.describe("escapeRegex", () => {
        mocha.it("Empty string is empty string", () => {
            chai.assert.strictEqual(parse.escapeRegex(""), "", "'' -> ''");
        });
        mocha.it("Normal string does not change", () => {
            chai.assert.strictEqual(
                parse.escapeRegex("Normal string does not change"),
                "Normal string does not change",
                "'Normal string does not change' -> 'Normal string does not change'"
            );
        });
        mocha.it("Every special character is escaped", () => {
            chai.assert.strictEqual(
                parse.escapeRegex(" \\ ^ $ . * + ? ( ) [ ] { } | - "),
                " \\\\ \\^ \\$ \\. \\* \\+ \\? \\( \\) \\[ \\] \\{ \\} \\| - ",
                "' \\ ^ $ . * + ? ( ) [ ] { } | -' -> ' \\\\ \\^ \\$ \\. \\* \\+ \\? \\( \\) \\[ \\] \\{ \\} \\| - '"
            );
        });
    });
    //==========================================================================
    mocha.describe("isValidVersion", () => {
        mocha.it("undefined is invalid", () => {
            chai.assert.strictEqual(
                // eslint-disable-next-line no-undefined
                parse.isValidVersion(undefined),
                false,
                "Not valid: `undefined`"
            );
        });
        mocha.it("Empty string is invalid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion(""),
                false,
                "Not valid: ''"
            );
        });
        mocha.it("Just whitespace is invalid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion("  \t\n "),
                false,
                "Not valid: '  \\t\\n '"
            );
        });
        mocha.it("3.6.2 is valid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion("3.6.2"),
                true,
                "3.6.2 should be valid"
            );
        });
        mocha.it("v3.6.2 is valid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion("v3.6.2"),
                true,
                "v3.6.2 should be valid"
            );
        });
        mocha.it("Version 3.6.2~9-156_78 is valid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion("Version 3.6.2~9-156_78"),
                true,
                "Version 3.6.2~9-156_78 should be valid"
            );
        });
        mocha.it("2023/02/18.438413 is valid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion("Version 2023/02/18.438413"),
                true,
                "Version 2023/02/18.438413 should be valid"
            );
        });
        mocha.it("VerSion 3.6.2~9 is invalid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion("VerSion 3.6.2~9"),
                false,
                "VerSion 3.6.2~9 should be invalid"
            );
        });
        mocha.it("Ignores whitespace", () => {
            chai.assert.strictEqual(
                parse.isValidVersion(" 3.6.2\t\n"),
                true,
                "' 3.6.2\\t\\n' should be valid"
            );
        });
    });
    //==========================================================================
    mocha.describe("getLineAndCol", () => {
        mocha.it("Empty string -> 0:0", () => {
            chai.assert.deepEqual(
                parse.getLineAndCol(/^$/gmsu, "fsgdfsgg"),
                { line: 0, col: 0, endLine: 0, endCol: 0 },
                "Empty string -> 0:0"
            );
        });
        mocha.it("Not found -> 0:0", () => {
            chai.assert.deepEqual(
                parse.getLineAndCol(/A/u, "fsgdfsgg"),
                { line: 0, col: 0, endLine: 0, endCol: 0 },
                "Empty string -> 0:0"
            );
        });
        mocha.it("At position 0:4", () => {
            chai.assert.deepEqual(
                parse.getLineAndCol(/o/u, "Hello World!"),
                { line: 0, col: 4, endLine: 0, endCol: 5 },
                "Hell_o_ World!"
            );
        });
        mocha.it("At position 2:14", () => {
            chai.assert.deepEqual(
                parse.getLineAndCol(
                    /to search/u,
                    "jkl\nhkkh\n01234567890123to search"
                ),
                { line: 2, col: 14, endLine: 2, endCol: 23 },
                "'to search' in 'jkl\\nhkkh\\n01234567890123to search'"
            );
        });
    });
    //==========================================================================
    mocha.describe("getSourceRange", () => {
        mocha.it("Empty string -> 0:0 - 0:1", () => {
            chai.assert.deepEqual(
                parse.getSourceRange("", "fsgdfsgg", false),
                new vscode.Range(
                    new vscode.Position(0, 0),
                    new vscode.Position(0, 0)
                ),
                "Empty string -> Empty Range"
            );
        });
        mocha.it("'parse 11*11' in testSource1", () => {
            chai.assert.deepEqual(
                parse.getSourceRange(
                    "parse 11*11",
                    testSources.testSource1,
                    false
                ),
                testSources.testSource1Range,
                "'parse 11*11' testSource1Range"
            );
        });
        mocha.it("'parse 11/-11' in testSource1", () => {
            chai.assert.deepEqual(
                parse.getSourceRange(
                    "parse 11/-11",
                    testSources.testSource1,
                    false
                ),
                testSources.testSource1Range2,
                "'parse 11/-11' -> testSource1Range2"
            );
        });
        mocha.it("'parse 21./-21.2' in testSource1", () => {
            chai.assert.deepEqual(
                parse.getSourceRange(
                    "parse 21./-21.2",
                    testSources.testSource1,
                    false
                ),
                testSources.testSource1Range3,
                "'parse 21./-21.2' -> testSource1Range3"
            );
        });
        mocha.it("Inline 'parse 11*11' in testSource1", () => {
            chai.assert.deepEqual(
                parse.getSourceRange(
                    "parse 11*11",
                    testSources.testSource1,
                    true
                ),
                testSources.testSource1RangeInl,
                "Inline 'parse 11*11' -> testSource1Range"
            );
        });
        mocha.it("Inline 'parse 11/-11' in testSource1", () => {
            chai.assert.deepEqual(
                parse.getSourceRange(
                    "parse 11/-11",
                    testSources.testSource1,
                    true
                ),
                testSources.testSource1Range2Inl,
                "Inline 'parse 11/-11' -> testSource1Range2"
            );
        });
        mocha.it("Inline 'parse 21./-21.2' in testSource1", () => {
            chai.assert.deepEqual(
                parse.getSourceRange(
                    "parse 21./-21.2",
                    testSources.testSource1,
                    true
                ),
                testSources.testSource1Range3Inl,
                "Inline 'parse 21./-21.2' -> testSource1Range3"
            );
        });
    });
    //==========================================================================
    mocha.describe("parseDuneTests", () => {
        mocha.it("Empty string -> empty list", () => {
            chai.assert.deepEqual(
                parse.parseDuneTests(""),
                [],
                "Empty string -> empty list"
            );
        });
        mocha.it("Not a dune file -> empty list", () => {
            chai.assert.deepEqual(
                // eslint-disable-next-line no-undefined
                parse.parseDuneTests(
                    "shdfljkg hfdhdf (tests notest notest2) sgjlsdg hjsdfgl"
                ),
                [],
                "Not a dune file -> empty list"
            );
        });
        mocha.it("dune test -> one test", () => {
            chai.assert.deepEqual(
                parse.parseDuneTests(duneTests.duneFile1),
                duneTests.duneFile1Exe,
                "dune test -> one test"
            );
        });
        mocha.it("dune tests -> 4 tests", () => {
            chai.assert.deepEqual(
                parse.parseDuneTests(duneTests.duneFile2),
                duneTests.duneFile2Exe,
                "duneFile2 -> duneFile2Exe"
            );
        });
        mocha.it("run %{exe:main.exe} -> main.exe", () => {
            chai.assert.deepEqual(
                parse.parseDuneTests(duneTests.duneFile3),
                duneTests.duneFile3Exe,
                "duneFile3 -> duneFile3Exe"
            );
        });
        mocha.it("run ./...exe -> 2 tests", () => {
            chai.assert.deepEqual(
                parse.parseDuneTests(duneTests.duneFile4),
                duneTests.duneFile4Exe,
                "duneFile4 -> duneFile4Exe"
            );
        });
    });
    //==========================================================================
    mocha.describe("parseTestList", () => {
        mocha.it("Empty string -> empty list", () => {
            chai.assert.deepEqual(
                parse.parseTestList(""),
                [],
                "Empty string -> empty list"
            );
        });
        mocha.it("No test list string -> empty list", () => {
            chai.assert.deepEqual(
                parse.parseTestList("bfls bdsfbl bdfbs GT  dsjkafôdsafk"),
                [],
                "'bfls bdsfbl bdfbs GT  dsjkafôdsafk' -> empty list"
            );
        });
        mocha.it("Test list string -> list of test objects", () => {
            chai.assert.deepEqual(
                parse.parseTestList(testLists.normalList),
                testLists.normalListObject,
                "Test list 'normalList'"
            );
        });
        mocha.it(
            "String of list of inline tests -> list of test objects",
            () => {
                chai.assert.deepEqual(
                    parse.parseTestList(testLists.inlineList),
                    testLists.inlineListObject,
                    "Test list 'inlineList'"
                );
            }
        );
    });
    //==========================================================================
    mocha.describe("parseTestErrors", () => {
        mocha.it("Empty string -> empty list", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(""),
                [],
                "Empty string -> empty list"
            );
        });
        mocha.it("No test list string -> empty list", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors("bfls bdsfbl bdfbs GT  dsjkafôdsafk"),
                [],
                "'bfls bdsfbl bdfbs GT  dsjkafôdsafk' -> empty list"
            );
        });
        mocha.it("Test error string -> list of test objects", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testErrors.oneError),
                testErrors.oneErrorObject,
                "Test error 'oneError'"
            );
        });
        mocha.it("Test exception string -> list of test objects", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testErrors.exceptionError),
                testErrors.exceptionErrorObject,
                "Test error 'exceptionError'"
            );
        });
        mocha.it("Test two errors string -> list of test objects", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testErrors.twoErrors),
                testErrors.twoErrorsObject,
                "Test error 'twoErrors'"
            );
        });
        mocha.it("Test three errors string 1 -> list of test objects", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testErrors.threeErrors1),
                testErrors.threeErrorsObject,
                "Test error 'threeErrors1'"
            );
        });
        mocha.it("Test three errors string 2 -> list of test objects", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testErrors.threeErrors2),
                testErrors.threeErrorsObject,
                "Test error 'threeErrors2'"
            );
        });
        mocha.it("Inline test error string -> list of test objects", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testErrors.oneErrorInline),
                testErrors.oneErrorInlineObject,
                "Test error 'oneErrorInline'"
            );
        });
    });
});
