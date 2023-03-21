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

    const env = { config, controller, outChannel, testData };

    const runProfile = controller.createRunProfile(
        c.runProfileLabel,
        vscode.TestRunProfileKind.Run,
        (r, tok) => rt.runHandler(env, r, tok)
    );
    context.subscriptions.push(runProfile);

    setupSubscriptions(env, context);

    await t.addTests(env, h.workspaceFolders());
}

/**
 * Set up subscriptions to various events.
 * @param env The extension's environment.
 * @param context The extension's context.
 */
function setupSubscriptions(env: h.Env, context: vscode.ExtensionContext) {
    // eslint-disable-next-line no-unused-vars
    env.controller.refreshHandler = async (_) => {
        t.addTests(env, h.workspaceFolders());
    };

    const configDisposable = vscode.workspace.onDidChangeConfiguration((e) =>
        configChanged(env, e)
    );
    context.subscriptions.push(configDisposable);

    const disposable = vscode.workspace.onDidChangeWorkspaceFolders(
        async (e) => {
            t.addTests(env, e.added);
            e.removed.map((r) => env.controller.items.delete(r.name));
        }
    );
    context.subscriptions.push(disposable);
}

/**
 * Called, if the configuration has changed.
 * @param env The extension's environment.
 * @param e The change event.
 */
function configChanged(env: h.Env, e: vscode.ConfigurationChangeEvent) {
    if (e.affectsConfiguration(c.cfgSection)) {
        env.outChannel.appendLine(`Config changed!`);
        vscode.window
            .showInformationMessage(
                "The configuration has changed!\nReload the window for the changes to take effect.",
                "Reload Now"
            )
            // eslint-disable-next-line no-unused-vars
            .then((_) =>
                vscode.commands.executeCommand("workbench.action.reloadWindow")
            );
    }
}
