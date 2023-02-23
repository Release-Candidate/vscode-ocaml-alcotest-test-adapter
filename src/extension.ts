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
 *
 * @param _context The `vscode.ExtensionContext` to use.
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

    const env: h.Env = { config, controller, outChannel, testData };

    const runProfile = controller.createRunProfile(
        c.runProfileLabel,
        vscode.TestRunProfileKind.Run,
        (r, tok) => runHandler(env, r, tok)
    );
    context.subscriptions.push(runProfile);

    const disposable = vscode.workspace.onDidChangeWorkspaceFolders(
        async (e) => {
            t.addTests(env, e.added);
            e.removed.map((r) => controller.items.delete(r.name));
        }
    );
    context.subscriptions.push(disposable);

    await t.addTests(env, h.workspaceFolders());
}

/**
 * Run or cancel running tests.
 * This is called whenever the user wants to run or cancel tests.
 * @param env All needed objects are contained in this environment.
 * @param request The actual run request.
 * @param token The `CancellationToken`. Whether the user want's to cancel the
 * test runs.
 */
async function runHandler(
    env: h.Env,
    request: vscode.TestRunRequest,
    token: vscode.CancellationToken
) {
    await rt.checkForNewTests(env, request);

    const run = env.controller.createTestRun(request);
    const tests = t.testList(request, env.controller);

    for await (const test of tests) {
        if (!token.isCancellationRequested) {
            const passEnv = {
                config: env.config,
                controller: env.controller,
                outChannel: env.outChannel,
                run,
                testData: env.testData,
            };
            passEnv.run = run;

            run.started(test);
            await rt.runSingleTest(passEnv, test);
        }
    }

    run.end();
}
