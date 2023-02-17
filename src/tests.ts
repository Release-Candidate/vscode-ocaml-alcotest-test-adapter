/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     tests.ts
 * Date:     16.Feb.2023
 *
 * ==============================================================================
 * Everything to add or run tests.
 */
import * as c from "./constants";
import * as h from "./extension_helpers";
import * as io from "./osInteraction";
import * as vscode from "vscode";

export async function addTests(env: {
    config: vscode.WorkspaceConfiguration;
    controller: vscode.TestController;
    outChannel: vscode.OutputChannel;
}) {
    const testDirs = c.getCfgTestDirs(env.config);
    const dirs = await io.filterExistingDirs(
        h.workspaceFolders().at(0) as vscode.WorkspaceFolder,
        testDirs
    );
    env.outChannel.appendLine(`Searching in directories: ${dirs}`);
    const roots = h.workspaceFolders();
    if (roots.at(0)) {
        const uris = await io.findFilesRelative(
            roots.at(0) as vscode.WorkspaceFolder,
            `${testDirs.at(0)}/*.ml`
        );
        env.outChannel.appendLine(`Found dune files: ${uris}`);
    }
}

/**
 * Return a list of tests to run.
 *
 * Either all tests of the `controller` are run or only the ones specified in
 * `request`.
 * @param request The request which may hold a list of tests (`TestItem`s) to
 * run.
 * @param controller Holding all existing `TestItem`s.
 * @returns The list of tests to run.
 */
export function testList(
    request: vscode.TestRunRequest,
    controller: vscode.TestController
) {
    const tests: vscode.TestItem[] = [];

    /**
     * Return a list of a test and its children, if it has any.
     * @param t The test to check for children.
     * @returns A list of a test and its children.
     */
    function testAndChilds(t: vscode.TestItem) {
        const testNChilds: vscode.TestItem[] = [];
        if (t.children?.size > 0) {
            t.children.forEach((el) => testNChilds.push(el));
            // TODO: fill empty suites, t.children.size === 0
        } else {
            testNChilds.push(t);
        }
        return testNChilds;
    }

    if (request.include) {
        request.include.forEach((t) => tests.push(...testAndChilds(t)));
    } else {
        controller.items.forEach((t) => tests.push(...testAndChilds(t)));
    }

    return tests.filter((t) => !request.exclude?.includes(t));
}
