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
import * as p from "./parsing";
import * as vscode from "vscode";

export type TestData = WeakMap<
    vscode.TestItem,
    {
        runner: vscode.Uri;
        root: vscode.WorkspaceFolder;
    }
>;

export async function addTests(env: {
    config: vscode.WorkspaceConfiguration;
    controller: vscode.TestController;
    outChannel: vscode.OutputChannel;
    testData: TestData;
}) {
    env.outChannel.appendLine("Adding tests ...");
    const roots = h.workspaceFolders();

    const promises = [];
    for (const root of roots) {
        env.outChannel.appendLine(`Processing workspace ${root.name}`);
        promises.push(addWorkspaceTests(root, env));
    }

    await Promise.allSettled(promises);

    env.outChannel.appendLine("Finished adding tests.");
}

async function addWorkspaceTests(
    root: vscode.WorkspaceFolder,
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: TestData;
    }
) {
    // eslint-disable-next-line no-extra-parens
    if (!(await h.isDuneWorking(root, env))) {
        return;
    }
    const workspaceItem = env.controller.createTestItem(
        root.name,
        `Workspace: ${root.name}`,
        root.uri
    );
    env.controller.items.add(workspaceItem);
    await addInlineTests(root, env, workspaceItem);
}

async function addInlineTests(
    root: vscode.WorkspaceFolder,
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: TestData;
    },
    workspaceItem: vscode.TestItem
) {
    const inlineRunnerPaths = await io.findFilesRelative(root, c.runnerExeGlob);
    const justBuildPaths = inlineRunnerPaths.filter(
        (pa) => !pa.path.includes(c.sandboxDir)
    );
    await generateTestList(justBuildPaths, root, env, workspaceItem, true);
    await generateTestList(
        [vscode.Uri.joinPath(root.uri, "_build/default/test/test.exe")],
        root,
        env,
        workspaceItem,
        false
    );
}

// eslint-disable-next-line max-params, max-statements
async function generateTestList(
    justBuildPaths: vscode.Uri[],
    root: vscode.WorkspaceFolder,
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: TestData;
    },
    workspaceItem: vscode.TestItem,
    isInline: boolean
) {
    for await (const path of justBuildPaths) {
        const out = await io.runRunnerListDune(root, path);
        env.outChannel.appendLine(
            `Test runner: ${path.path}\nList of tests:\n${
                out.stdout
            }\nStderr: ${out.stderr}\nError: ${out.error ? out.error : ""}`
        );
        if (out.stdout) {
            const suiteItem = env.controller.createTestItem(
                isInline ? c.inlineTestsLabel : "Tests",
                isInline ? c.inlineTestsLabel : "Tests"
            );
            workspaceItem.children.add(suiteItem);
            const groups = p.parseTestList(out.stdout);
            for await (const group of groups) {
                const sourcePath = await io.findFilesRelative(root, group.name);
                const groupItem = env.controller.createTestItem(
                    group.name,
                    group.name,
                    sourcePath[0]
                );
                suiteItem.children.add(groupItem);
                for (const t of group.tests) {
                    const testItem = env.controller.createTestItem(
                        `${t.id}`,
                        t.name,
                        sourcePath[0]
                    );
                    groupItem.children.add(testItem);
                    env.testData.set(testItem, { root, runner: path });
                }
            }
        }
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
            t.children.forEach((el) => testNChilds.push(...testAndChilds(el)));
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
