/* eslint-disable max-lines-per-function */
/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     osInteraction-test.ts
 * Date:     17.Feb.2023
 *
 * ==============================================================================
 * Tests for the `odInteraction` module.
 */

import * as chai from "chai";
import * as h from "../src/extension_helpers";
import * as io from "../src/osInteraction";
import * as mocha from "mocha";
import * as vscode from "vscode";

/**
 * *****************************************************************************
 * Helper functions and constants.
 */

const roots = h.workspaceFolders();
// The first workspace, that is the extension's workspace.
const [root] = roots;

/**
 * *****************************************************************************
 * Tests
 */
mocha.describe("I/O Functions", () => {
    //==========================================================================
    mocha.describe("filterExistingDirs", () => {
        mocha.it("No directory exists", async () => {
            chai.assert.deepEqual(
                await io.filterExistingDirs(root, [
                    "IdoNotExist",
                    "IDontEither",
                    "NeitherMe",
                ]),
                [],
                "No existing directory!"
            );
        });
        mocha.it("Empty directory list", async () => {
            chai.assert.deepEqual(
                await io.filterExistingDirs(root, []),
                [],
                "Empty list passed"
            );
        });
        mocha.it("Some directories exist", async () => {
            chai.assert.deepEqual(
                await io.filterExistingDirs(root, [
                    "IdoNotExist",
                    "test",
                    "IDontEither",
                    "src",
                    "NeitherMe",
                    "images",
                    "node_modules",
                ]),
                ["test", "src", "images", "node_modules"],
                "Should be test, src, images, node_modules"
            );
        });
    });
    //==========================================================================
    mocha.describe("existsIsFile", () => {
        mocha.it("No file exists", async () => {
            chai.assert.isFalse(
                await io.existsIsFile(
                    vscode.Uri.joinPath(root.uri, "IdoNotExist")
                ),
                "File should not exist in workspace"
            );
        });
        mocha.it("Is directory, not file", async () => {
            chai.assert.isFalse(
                await io.existsIsFile(vscode.Uri.joinPath(root.uri, "src")),
                "Directory is not a file"
            );
        });
        mocha.it("Is existing file", async () => {
            chai.assert.isTrue(
                await io.existsIsFile(
                    vscode.Uri.joinPath(root.uri, "src/constants.ts")
                ),
                "File src/constants.ts should exist"
            );
        });
    });
    //==========================================================================
    mocha.describe("findFilesRelative", () => {
        mocha.it("No file exists", async () => {
            chai.assert.deepEqual(
                await io.findFilesRelative(root, "IdoNotExistInThisDirectory"),
                [],
                "None of the files exist"
            );
        });
        mocha.it("Exactly one file exists", async () => {
            const [result] = await io.findFilesRelative(root, "**/parsing.ts");
            const should = "src/parsing.ts";
            chai.assert.strictEqual(result, should, "parsing.ts exists");
        });
        mocha.it("Many .md files exist", async () => {
            const result = await io.findFilesRelative(root, "*.md");
            const should = ["CONTRIBUTING.md", "README.md", "CHANGELOG.md"];
            chai.assert.deepEqual(
                result.sort(),
                should.sort(),
                "CONTRIBUTING.md, CHANGELOG.md and README.md exist"
            );
        });
    });
    //==========================================================================
    mocha.describe("runCommand", () => {
        mocha.it("Cmd does not exist", async () => {
            const out = await io.runCommand(root, "does-not-exist", []);
            chai.assert.strictEqual(
                out.error,
                "spawn does-not-exist ENOENT",
                "Not existing command name."
            );
            chai.assert.isUndefined(out.stdout, "No stdout, command not found");
            chai.assert.isUndefined(out.stderr, "No stderr, command not found");
        });
        mocha.it("Run ls on non existing file", async () => {
            const out = await io.runCommand(root, "ls", [
                "-l",
                "does_not_exist_I_hope",
            ]);
            chai.assert.strictEqual(
                out.stderr,
                "ls: does_not_exist_I_hope: No such file or directory\n",
                "ls on non existing file."
            );
            chai.assert.strictEqual(out.stdout, "", "No output at stdout!");
            chai.assert.isUndefined(out.error, "No error calling ls!");
        });
        mocha.it("Run ls on existing file LICENSE", async () => {
            const out = await io.runCommand(root, "ls", ["LICENSE"]);
            chai.assert.strictEqual(out.stdout, "LICENSE\n", "ls of LICENSE");
            chai.assert.strictEqual(out.stderr, "", "No output at stderr!");
            chai.assert.isUndefined(out.error, "No error calling ls!");
        });
    });
});
