/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     extension.ts
 * Date:     14.Feb.2023
 *
 * ==============================================================================
 * The main extension file.
 * Implement VS Code's `Testing API`, see
 * https://code.visualstudio.com/api/extension-guides/testing.
 */

import * as c from "./constants";
import * as h from "./extension_helpers";
import * as rt from "./run_tests";
import * as t from "./list_tests";
import * as vscode from "vscode";

/**
 * Called when the extension is being activated.
 * That is, the registered `Activation Event` has happened. The
 * `Activation Events` are configured in `package.json`, in the
 * `activationEvents` field.
 * @param context The `vscode.ExtensionContext` to use.
 */
export async function activate(context: vscode.ExtensionContext) {
    const outChannel = vscode.window.createOutputChannel(c.outputChannelName);
    outChannel.appendLine("OCaml Alcotest Test Adapter starting.");

    /*
     * If no workspace exists (that includes an opened folder), we can't do
     * anything sensible anyway.
     */
    if (!vscode.workspace.workspaceFolders) {
        outChannel.appendLine("Not in a workspace/no folder opened. Exiting.");
        return;
    }
    await setupExtension(context, outChannel);
}

/**
 * Setup the extension and add the tests to the Text Explorer view.
 * @param context The extension's context.
 * @param outChannel The channel to log to.
 */
async function setupExtension(
    context: vscode.ExtensionContext,
    outChannel: vscode.OutputChannel
) {
    const testData: h.TestData = new WeakMap();

    const config = vscode.workspace.getConfiguration(c.cfgSection);

    const controller = vscode.tests.createTestController(
        c.testControllerID,
        c.testControllerLabel
    );
    context.subscriptions.push(controller);

    const runProfile = controller.createRunProfile(
        c.runProfileLabel,
        vscode.TestRunProfileKind.Run,
        (r, tok) =>
            rt.runHandler({ config, controller, outChannel, testData }, r, tok)
    );
    context.subscriptions.push(runProfile);

    // eslint-disable-next-line no-unused-vars
    controller.refreshHandler = async (_) => {
        t.addTests(
            { config, controller, outChannel, testData },
            h.workspaceFolders()
        );
    };

    const disposable = vscode.workspace.onDidChangeWorkspaceFolders(
        async (e) => {
            t.addTests({ config, controller, outChannel, testData }, e.added);
            e.removed.map((r) => controller.items.delete(r.name));
        }
    );
    context.subscriptions.push(disposable);

    await t.addTests(
        { config, controller, outChannel, testData },
        h.workspaceFolders()
    );
}
