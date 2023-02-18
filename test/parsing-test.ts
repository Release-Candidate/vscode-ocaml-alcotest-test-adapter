/* eslint-disable max-lines-per-function */
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
import * as mocha from "mocha";
import * as parse from "../src/parsing";

/**
 * *****************************************************************************
 * Tests
 */
mocha.describe("Parsing Functions", () => {
    //==========================================================================
    mocha.describe("trim", () => {
        mocha.it("Empty string ''", () => {
            chai.assert.strictEqual(
                // eslint-disable-next-line no-undefined
                "".trim(),
                "",
                "Empty string does not change"
            );
        });
        mocha.it("Just whitespace", () => {
            chai.assert.strictEqual(
                // eslint-disable-next-line no-undefined
                "\n  \t \n  ".trim(),
                "",
                "'\\n  \\t \\n  ' -> ''"
            );
        });
        mocha.it("No whitespace", () => {
            chai.assert.strictEqual(
                // eslint-disable-next-line no-undefined
                "Foobačšľ+ťíéšťr".trim(),
                "Foobačšľ+ťíéšťr",
                "Without whitespace 'Foobačšľ+ťíéšťr' -> no change"
            );
        });
        mocha.it("Inner whitespace", () => {
            chai.assert.strictEqual(
                // eslint-disable-next-line no-undefined
                "Fo o\tb ač\n š ľ+\nť íé š\tťr".trim(),
                "Fo o\tb ač\n š ľ+\nť íé š\tťr",
                "Inner whitespace 'Fo o\\tb ač\\n š ľ+\\nť íé š\\tťr' -> no change"
            );
        });
        mocha.it("Outer whitespace", () => {
            chai.assert.strictEqual(
                // eslint-disable-next-line no-undefined
                "  \t \n foobar\n \t ".trim(),
                "foobar",
                "Outer whitespace should be removed '  \\t \\n foobar\\n \\t '-> 'foobar'"
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
    mocha.describe("parseTestList", () => {
        mocha.it("Empty string -> empty list", () => {
            chai.assert.deepEqual(
                // eslint-disable-next-line no-undefined
                parse.parseTestList(""),
                [],
                "Empty string -> empty list"
            );
        });
        mocha.it("No test list string -> empty list", () => {
            chai.assert.deepEqual(
                // eslint-disable-next-line no-undefined
                parse.parseTestList("bfls bdsfbl bdfbs GT  dsjkafôdsafk"),
                [],
                "'bfls bdsfbl bdfbs GT  dsjkafôdsafk' -> empty list"
            );
        });
        mocha.it("Test list string -> list of test objects", () => {
            chai.assert.deepEqual(
                // eslint-disable-next-line no-undefined
                parse.parseTestList(`lib/interp_common.ml         12   parse not false.
lib/interp_common.ml         13   parse not true.
Small Step tests                14   let x = 0 in let x  = 22 in x.
Small Step tests                15   let x = 22 in x.`),
                [
                    {
                        id: 12,
                        name: "parse not false.",
                        suite: "lib/interp_common.ml",
                    },
                    {
                        id: 13,
                        name: "parse not true.",
                        suite: "lib/interp_common.ml",
                    },
                    {
                        id: 14,
                        name: "let x = 0 in let x  = 22 in x.",
                        suite: "Small Step tests",
                    },
                    {
                        id: 15,
                        name: "let x = 22 in x.",
                        suite: "Small Step tests",
                    },
                ],
                "Test list with IDs 12 - 15"
            );
        });
    });
});
