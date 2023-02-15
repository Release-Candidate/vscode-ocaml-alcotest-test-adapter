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

import * as vscode from "vscode";
import {
    configurationSection,
    configurationTestDir,
    outputChannelName,
    runProfileLabel,
    testControllerID,
    testControllerLabel,
} from "./constants";

/**
 * Called when the extension is being activated.
 * That is, the registered `Activation Event` has happened. The
 * `Activation Events` are configured in `package.json`, in the
 * `activationEvents` field.
 *
 * @param _context The `vscode.ExtensionContext` to use.
 */
// eslint-disable-next-line no-unused-vars
export function activate(context: vscode.ExtensionContext) {
    const outChannel = vscode.window.createOutputChannel(outputChannelName);
    outChannel.appendLine("OCaml Alcotest Test Adapter starting.");
    const config = vscode.workspace.getConfiguration(configurationSection);

    const controller = vscode.tests.createTestController(
        testControllerID,
        testControllerLabel
    );
    context.subscriptions.push(controller);

    controller.createRunProfile(
        runProfileLabel,
        vscode.TestRunProfileKind.Run,
        (r, t) => runHandler({ controller, outChannel, config }, r, t),
        true
    );
    const testDirs = config.get<string[]>(configurationTestDir) || [
        "test",
        "tests",
    ];
    outChannel.appendLine("Test dirs: " + testDirs);
}

/**
 * Run or cancel running tests.
 * This is called whenever the user wants to run or cancel tests.
 * @param env All needed objects are contained in this environment.
 * @param request The actual run request.
 * @param token The `CancellationToken`. Whether the user want's to cancel the
 * test runs.
 */
function runHandler(
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
    },
    request: vscode.TestRunRequest,
    token: vscode.CancellationToken
) {
    env.outChannel.appendLine("Hi");
    const run = env.controller.createTestRun(request);

    const queue = testQueue(request, env.controller);

    if (!token.isCancellationRequested) {
        const test = queue.pop();
        env.outChannel.appendLine("Running test " + test?.label);
    }
    env.outChannel.appendLine(
        "Test dirs: " + env.config.get(configurationTestDir)
    );

    run.end();
}

/**
 * Return a queue of tests to run.
 *
 * Either all tests of the `controller` are run or only the ones specified in
 * `request`.
 * @param request The request which may hold a list of tests (`TestItem`s) to
 * run.
 * @param controller Holding all existing `TestItem`s.
 * @returns The Queue of tests to run.
 */
function testQueue(
    request: vscode.TestRunRequest,
    controller: vscode.TestController
) {
    const queue: vscode.TestItem[] = [];

    /**
     * Return a list of a test and its children, if it has any.
     * @param t The test to check for children.
     * @returns A list of a test and its children.
     */
    function allChildren(t: vscode.TestItem) {
        const testList: vscode.TestItem[] = [];
        // eslint-disable-next-line no-magic-numbers
        if (t.children?.size > 0) {
            t.children.forEach((c) => testList.push(c));
            // TODO: fill empty suites, t.children.size === 0
        } else {
            testList.push(t);
        }
        return testList;
    }

    if (request.include) {
        request.include.forEach((t) => queue.push(...allChildren(t)));
    } else {
        controller.items.forEach((t) => queue.push(...allChildren(t)));
    }

    return queue.filter((t) => !request.exclude?.includes(t));
}
