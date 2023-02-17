/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     runner.ts
 * Date:     17.Feb.2023
 *
 * ==============================================================================
 * The VS Code test runner, to run tests needing the `vscode` module.
 */

import { runTests } from "@vscode/test-electron";
import path = require("path");

async function main() {
    try {
        // eslint-disable-next-line lines-around-comment
        /*
         * The folder containing the Extension Manifest package.json
         * Passed to `--extensionDevelopmentPath` and used as folder argument,
         * to load the current workspace as workspace.
         */
        const extensionDevelopmentPath = path.resolve(__dirname, "../../");

        /*
         * The path to the extension test script
         * Passed to --extensionTestsPath
         */
        const extensionTestsPath = path.resolve(__dirname, "./main");

        // Download VS Code, unzip it and run the integration test
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            version: "1.59.0",
            launchArgs: [extensionDevelopmentPath],
        });
    } catch (err) {
        console.error("Failed to run tests");
        // eslint-disable-next-line no-magic-numbers
        process.exit(1);
    }
}

main();
