/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     list_tests.ts
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
import path = require("path");

/* eslint-disable max-lines */

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

/**
 * Add all tests of all workspaces to the Test Explorer.
 * @param env The extension's environment.
 */
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

/**
 * Add all tests of a single workspace `root` to the Test Explorer.
 * @param root The workspace to add the tests from.
 * @param env Everything needed to add these tests.
 */
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
    await addInlineTests(env, root, workspaceItem);
    await addNormalTests(env, root, workspaceItem);
}

/**
 * Add 'normal', that is, not inline tests to the Test Explorer.
 * @param env Everything needed to add these tests.
 * @param root The workspace to add the tests to and from.
 * @param workspaceItem The parent node of the workspace's test tree in the Test
 * Explorer.
 */
async function addNormalTests(
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: TestData;
    },
    root: vscode.WorkspaceFolder,
    workspaceItem: vscode.TestItem
) {
    const testDirs = await io.filterExistingDirs(
        root,
        c.getCfgTestDirs(env.config)
    );
    const duneGlobs = testDirs.map((d) =>
        d.concat("/**/").concat(c.duneFileName)
    );
    const duneFiles: string[] = [];
    for await (const glob of duneGlobs) {
        // eslint-disable-next-line no-extra-parens
        duneFiles.push(...(await io.findFilesRelative(root, glob)));
    }
    const runnerPaths: string[] = await parseDuneFiles(
        duneFiles,
        env.outChannel,
        root
    );
    await generateTestList(env, {
        root,
        runnerPaths,
        workspaceItem,
        suiteLabel: c.testControllerLabel,
    });
}

/**
 * Parse all given dune configuration files for relative paths to the test
 * runners.
 * @param duneFiles The list of dune configuration files to parse for test
 * runner executables.
 * @param outChannel The output channel to log to.
 * @param root The workspace and root directory to run the tests in.
 * @returns A list of test runner executables, as relative paths to the
 * workspace directory `root`.
 */
async function parseDuneFiles(
    duneFiles: string[],
    outChannel: vscode.OutputChannel,
    root: vscode.WorkspaceFolder
) {
    const runnerPaths: string[] = [];
    for await (const df of duneFiles) {
        outChannel.appendLine(`Checking dune file '${df}'`);
        const bytes = await vscode.workspace.fs.readFile(
            vscode.Uri.joinPath(root.uri, df)
        );
        const runnerRelPaths = p.parseDuneTests(bytes.toString());
        runnerPaths.push(
            ...runnerRelPaths.map((pa) =>
                io.concatRelativePaths(path.dirname(df), pa)
            )
        );
    }
    return runnerPaths;
}

/**
 * Add all inline (PPX) test of the workspace `root`.
 * @param env Everything needed to add these tests.
 * @param root The workspace to add the tests to and from.
 * @param workspaceItem The parent of the test tree in the Test Explorer view.
 */
async function addInlineTests(
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: TestData;
    },
    root: vscode.WorkspaceFolder,
    workspaceItem: vscode.TestItem
) {
    const inlineRunnerPaths = await io.findFilesRelative(root, c.runnerExeGlob);
    const justBuildPaths = inlineRunnerPaths.filter(
        (pa) => !pa.includes(c.sandboxDir)
    );
    await generateTestList(env, {
        runnerPaths: justBuildPaths,
        root,
        workspaceItem,
        suiteLabel: c.inlineTestsLabel,
    });
}

/**
 * Generate the tree of tests in the Test Explorer from the list of tests of the
 * test runners.
 * @param env The environment to generate the tree of tests.
 * @param data The data needed to generate the test tree.
 */
async function generateTestList(
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: TestData;
    },
    data: {
        runnerPaths: string[];
        root: vscode.WorkspaceFolder;
        workspaceItem: vscode.TestItem;
        suiteLabel: string;
    }
) {
    for await (const rPath of data.runnerPaths) {
        const out = await io.runRunnerListDune(data.root, rPath);
        env.outChannel.appendLine(
            `Test runner: ${rPath}\nList of tests:\n${out.stdout}\nStderr: ${
                out.stderr
            }\nError: ${out.error ? out.error : ""}`
        );
        if (out.stdout) {
            await parseTestListOutput(env, {
                root: data.root,
                suiteLabel: data.suiteLabel,
                workspaceItem: data.workspaceItem,
                listOutput: out.stdout,
                rPath,
            });
        }
    }
}

/**
 * Parse the output of the test list and add the test items to the test tree.
 * @param env The environment needed to add the tests.
 * @param data The data needed to add the test item to the tree.
 */
async function parseTestListOutput(
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: TestData;
    },
    data: {
        root: vscode.WorkspaceFolder;
        workspaceItem: vscode.TestItem;
        suiteLabel: string;
        listOutput: string;
        rPath: string;
    }
) {
    const suiteItem = env.controller.createTestItem(
        data.suiteLabel,
        data.suiteLabel
    );
    data.workspaceItem.children.add(suiteItem);
    const groups = p.parseTestList(data.listOutput);
    for await (const group of groups) {
        const sourcePath = await io.findSourceToTest(
            data.root,
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
            addTestItem(env, {
                t,
                sourcePath,
                groupItem,
                root: data.root,
                suiteLabel: data.suiteLabel,
                rPath: data.rPath,
            });
        }
    }
}

/**
 * Add a single test item to the Test Explorer tree.
 * @param env The environment needed to add the test.
 * @param data The data needed to add the test item to the tree.
 */
function addTestItem(
    env: {
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: TestData;
    },
    data: {
        t: p.TestType;
        sourcePath: vscode.Uri;
        groupItem: vscode.TestItem;
        root: vscode.WorkspaceFolder;
        suiteLabel: string;
        rPath: string;
    }
) {
    const testItem = env.controller.createTestItem(
        `${data.t.id}`,
        data.t.name,
        data.sourcePath
    );
    data.groupItem.children.add(testItem);
    env.testData.set(testItem, {
        root: data.root,
        runner: data.rPath,
        isInline: data.suiteLabel === c.inlineTestsLabel,
    });
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
