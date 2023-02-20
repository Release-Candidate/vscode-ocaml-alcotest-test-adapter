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

/**
 * Object holding additional data about a `TestItem`.
 */
export type TestData = WeakMap<
    vscode.TestItem,
    {
        runner: string;
        root: vscode.WorkspaceFolder;
        isInline: boolean;
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
    await generateTestList(
        ["test/test.exe"],
        root,
        env,
        workspaceItem,
        c.testControllerLabel
    );
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
        (pa) => !pa.includes(c.sandboxDir)
    );
    await generateTestList(
        justBuildPaths,
        root,
        env,
        workspaceItem,
        c.inlineTestsLabel
    );
}

// eslint-disable-next-line max-params, max-statements, max-lines-per-function
async function generateTestList(
    runnerPaths: string[],
    root: vscode.WorkspaceFolder,
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: TestData;
    },
    workspaceItem: vscode.TestItem,
    suiteLabel: string
) {
    for await (const path of runnerPaths) {
        const out = await io.runRunnerListDune(root, path);
        env.outChannel.appendLine(
            `Test runner: ${path}\nList of tests:\n${out.stdout}\nStderr: ${
                out.stderr
            }\nError: ${out.error ? out.error : ""}`
        );
        if (out.stdout) {
            const suiteItem = env.controller.createTestItem(
                suiteLabel,
                suiteLabel
            );
            workspaceItem.children.add(suiteItem);
            const groups = p.parseTestList(out.stdout);
            for await (const group of groups) {
                const sourcePath = await io.findSourceToTest(
                    root,
                    c.getCfgTestDirs(env.config),
                    group.name
                );
                const groupItem = env.controller.createTestItem(
                    group.name,
                    group.name,
                    sourcePath
                );
                suiteItem.children.add(groupItem);
                for (const t of group.tests) {
                    const testItem = env.controller.createTestItem(
                        `${t.id}`,
                        t.name,
                        sourcePath
                    );
                    groupItem.children.add(testItem);
                    env.testData.set(testItem, {
                        root,
                        runner: path,
                        isInline: suiteLabel === c.inlineTestsLabel,
                    });
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
