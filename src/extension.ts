// SPDX-License-Identifier: MIT
// Copyright (C) 2023 Roland Csaszar
//
// Project:  vscode-ocaml-alcotest-test-adapter
// File:     extension.ts
// Date:     14.Feb.2023
//
// ==============================================================================
import * as vscode from "vscode";

/**
 * Called when the extension is being activated.
 * That is, the registered `Activation Event` has happened. The
 * `Activation Events` are configured in `package.json`, in the
 * `activationEvents` field.
 *
 * @param _context The `vscode.ExtensionContext` to use.
 */
// eslint-disable-next-line no-unused-vars
export function activate(_context: vscode.ExtensionContext) {
    // eslint-disable-next-line no-unused-vars
    const controller = vscode.tests.createTestController(
        "alcotestTestController",
        "Alcotest Tests"
    );
    // eslint-disable-next-line no-console
    console.log("Extension OCaml Alcotest Test Adapter activated.");
}

/**
 * Called on deactivation, cleanup code.
 */
export function deactivate() {
    // eslint-disable-next-line no-console
    console.log("Extension OCaml Alcotest Test Adapter deactivated.");
}
