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
                parse.trim(""),
                "",
                "Empty string does not change"
            );
        });
        mocha.it("No whitespace", () => {
            chai.assert.strictEqual(
                // eslint-disable-next-line no-undefined
                parse.trim("Foobačšľ+ťíéšťr"),
                "Foobačšľ+ťíéšťr",
                "Without whitespace 'Foobačšľ+ťíéšťr' -> no change"
            );
        });
        mocha.it("Inner whitespace", () => {
            chai.assert.strictEqual(
                // eslint-disable-next-line no-undefined
                parse.trim("Fo o\tb ač\n š ľ+\nť íé š\tťr"),
                "Fo o\tb ač\n š ľ+\nť íé š\tťr",
                "Inner whitespace 'Fo o\\tb ač\\n š ľ+\\nť íé š\\tťr' -> no change"
            );
        });
        mocha.it("Outer whitespace", () => {
            chai.assert.strictEqual(
                // eslint-disable-next-line no-undefined
                parse.trim("  \t \n foobar\n \t "),
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
        mocha.it("Ignores whitespace", () => {
            chai.assert.strictEqual(
                parse.isValidVersion(" 3.6.2\t\n"),
                true,
                "' 3.6.2\\t\\n' should be valid"
            );
        });
    });
});
