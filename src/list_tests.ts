/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     list_tests.ts
 * Date:     16.Feb.2023
 *
 * ==============================================================================
 * Everything to add tests to the Test Explorer tree from the output of an
 * Alcotest list of tests.
 */
import * as c from "./constants";
import * as h from "./extension_helpers";
import * as io from "./osInteraction";
import * as p from "./parsing";
import * as vscode from "vscode";
import path = require("path");

/**
 * Add all tests of all workspaces to the Test Explorer.
 * @param env The extension's environment.
 */
export async function addTests(
    env: h.Env,
    roots: readonly vscode.WorkspaceFolder[]
) {
    env.outChannel.appendLine("Adding new tests ...");

    const promises = [];
    for (const root of roots) {
        env.outChannel.appendLine(`Processing workspace ${root.name}`);
        promises.push(addWorkspaceTests(env, root));
    }

    const toDeleteArray = await Promise.allSettled(promises);

    env.outChannel.appendLine("Finished adding new tests.");

    // eslint-disable-next-line no-magic-numbers, arrow-body-style
    return toDeleteArray.flatMap((e) => {
        return e.status === "fulfilled" ? e.value : [];
    });
}

/**
 * Add all tests of a single workspace `root` to the Test Explorer.
 * @param root The workspace to add the tests from.
 * @param env Everything needed to add these tests.
 */
async function addWorkspaceTests(env: h.Env, root: vscode.WorkspaceFolder) {
    // eslint-disable-next-line @typescript-eslint/no-extra-parens
    if (!(await h.isDuneWorking(root, env))) {
        return [];
    }

    const workspaceItem = getWorkspaceItem();
    env.controller.items.add(workspaceItem);
    const toDelete: vscode.TestItem[] = [];
    // eslint-disable-next-line @typescript-eslint/no-extra-parens
    toDelete.push(...(await addInlineTests(env, root, workspaceItem)));
    // eslint-disable-next-line @typescript-eslint/no-extra-parens
    toDelete.push(...(await addNormalTests(env, root, workspaceItem)));

    return toDelete;

    /**
     * Return the `TestItem` of the current workspace if it does exist or create
     * it.
     */
    function getWorkspaceItem() {
        const item = env.controller.items.get(root.name);
        if (item) {
            return item;
        }

        return env.controller.createTestItem(
            root.name,
            `Workspace: ${root.name}`,
            root.uri
        );
    }
}

/**
 * Add 'normal', that is, not inline tests to the Test Explorer.
 * @param env Everything needed to add these tests.
 * @param root The workspace to add the tests to and from.
 * @param workspaceItem The parent node of the workspace's test tree in the Test
 * Explorer.
 */
async function addNormalTests(
    env: h.Env,
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
    for (const glob of duneGlobs) {
        // eslint-disable-next-line @typescript-eslint/no-extra-parens, no-await-in-loop
        duneFiles.push(...(await io.findFilesRelative(root, glob)));
    }
    const runnerPaths: string[] = await parseDuneFiles(
        duneFiles,
        env.outChannel,
        root
    );
    return generateTestList(env, {
        root,
        runnerPaths,
        workspaceItem,
        suiteLabel: c.testControllerLabel,
    });
}

/**
 * Add all inline (PPX) test of the workspace `root`.
 * @param env Everything needed to add these tests.
 * @param root The workspace to add the tests to and from.
 * @param workspaceItem The parent of the test tree in the Test Explorer view.
 */
async function addInlineTests(
    env: h.Env,
    root: vscode.WorkspaceFolder,
    workspaceItem: vscode.TestItem
) {
    const inlineRunnerPaths = await io.findFilesRelative(root, c.runnerExeGlob);
    const justBuildPaths = inlineRunnerPaths.filter(
        (pa) => !pa.includes(c.sandboxDir)
    );
    return generateTestList(env, {
        runnerPaths: justBuildPaths,
        root,
        workspaceItem,
        suiteLabel: c.inlineTestsLabel,
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
    for (const df of duneFiles) {
        outChannel.appendLine(`Checking dune file '${df}'`);
        // eslint-disable-next-line no-await-in-loop
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
 * Generate the tree of tests in the Test Explorer from the list of tests of the
 * test runners.
 * @param env The environment to generate the tree of tests.
 * @param data The data needed to generate the test tree.
 */
async function generateTestList(
    env: h.Env,
    data: {
        runnerPaths: string[];
        root: vscode.WorkspaceFolder;
        workspaceItem: vscode.TestItem;
        suiteLabel: string;
    }
) {
    const toDelete: vscode.TestItem[] = [];
    for (const rPath of data.runnerPaths) {
        // eslint-disable-next-line no-await-in-loop
        const out = await io.runRunnerListDune(data.root, rPath);
        env.outChannel.appendLine(
            `Test runner: ${rPath}\nList of tests:\n${out.stdout}\nStderr: ${
                out.stderr
            }\nError: ${out.error ? out.error : ""}`
        );

        if (out.stdout) {
            toDelete.push(
                // eslint-disable-next-line @typescript-eslint/no-extra-parens, no-await-in-loop
                ...(await parseTestListOutput(env, {
                    root: data.root,
                    suiteLabel: data.suiteLabel,
                    workspaceItem: data.workspaceItem,
                    listOutput: out.stdout,
                    rPath,
                }))
            );
        }
    }
    return toDelete;
}

/**
 * Parse the output of the test list and add the test items to the test tree.
 * @param env The environment needed to add the tests.
 * @param data The data needed to add the test item to the tree.
 */
async function parseTestListOutput(
    env: h.Env,
    data: {
        root: vscode.WorkspaceFolder;
        workspaceItem: vscode.TestItem;
        suiteLabel: string;
        listOutput: string;
        rPath: string;
    }
) {
    const suiteItem = getTestItem({
        controller: env.controller,
        parent: data.workspaceItem,
        id: data.suiteLabel,
        label: data.suiteLabel,
    });
    const toDelete: vscode.TestItem[] = [];
    const groups = p.parseTestList(data.listOutput);
    for (const group of groups) {
        // eslint-disable-next-line no-await-in-loop
        const sourcePath = await io.findSourceOfTest(
            data.root,
            c.getCfgTestDirs(env.config),
            group.name
        );
        const groupItem = getTestItem({
            controller: env.controller,
            parent: suiteItem,
            id: group.name,
            label: group.name,
            uri: sourcePath,
        });
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

        toDelete.push(...deleteNonExisting(group, groupItem, env));
    }

    return toDelete;
}

/**
 * Removes all deleted tests from the test tree.
 * @param env The Extension's environment.
 * @param group The test group to check for deleted items.
 * @param groupItem The `TestItem` of `group`.
 */
function deleteNonExisting(
    group: { name: string; tests: p.TestType[] },
    groupItem: vscode.TestItem,
    env: h.Env
) {
    const toDelete: vscode.TestItem[] = [];
    const maxID = group.tests.reduce((acc, e) => (e.id > acc ? e.id : acc), 0);

    groupItem.children.forEach((e) => {
        if (parseInt(e.id, 10) > maxID) {
            toDelete.push(e);
            env.outChannel.appendLine(
                `Group: ${group.name} Deleting test ${e.label} ${e.id}`
            );
            groupItem.children.delete(`${e.id}`);
        }
    });

    return toDelete;
}

/**
 * Add or update a single test item to the Test Explorer tree.
 * @param env The environment needed to add the test.
 * @param data The data needed to add the test item to the tree.
 */
async function addTestItem(
    env: h.Env,
    data: {
        t: p.TestType;
        sourcePath: vscode.Uri;
        groupItem: vscode.TestItem;
        root: vscode.WorkspaceFolder;
        suiteLabel: string;
        rPath: string;
    }
) {
    const testItem = getTestItem({
        controller: env.controller,
        parent: data.groupItem,
        id: `${data.t.id}`,
        label: data.t.name,
        uri: data.sourcePath,
    });

    if (!env.testData.get(testItem)) {
        env.testData.set(testItem, {
            root: data.root,
            runner: data.rPath,
            group: data.groupItem.id,
            isInline: data.suiteLabel === c.inlineTestsLabel,
        });
    }
    const loc = await h.setSourceLocation(testItem, env.testData);
    if (loc) {
        testItem.range = loc.range;
    }
}

/**
 * Return the `TestItem` with id `data.id`.
 * If it does already exist, just update its name. If it does not yet exist,
 * create a new `TestItem` and return that.
 * @param data The needed data.
 * @returns
 */
function getTestItem(data: {
    controller: vscode.TestController;
    parent: vscode.TestItem;
    id: string;
    label: string;
    uri?: vscode.Uri;
}) {
    let item = data.parent.children.get(data.id);
    if (item) {
        item.label = data.label;
        return item;
    }

    if (data.uri) {
        item = data.controller.createTestItem(data.id, data.label, data.uri);
    } else {
        item = data.controller.createTestItem(data.id, data.label);
    }
    data.parent.children.add(item);

    return item;
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
    controller: vscode.TestController,
    toDelete: vscode.TestItem[]
) {
    const tests: vscode.TestItem[] = [];

    if (request.include) {
        request.include.forEach((t) => tests.push(...testAndChilds(t)));
    } else {
        controller.items.forEach((t) => tests.push(...testAndChilds(t)));
    }

    return tests.filter((t) => !request.exclude?.includes(t));

    /**
     * Return a list of a test and its children, if it has any.
     * @param t The test to check for children.
     * @returns A list of a test and its children.
     */
    function testAndChilds(t: vscode.TestItem) {
        const testNChilds: vscode.TestItem[] = [];
        if (t.children?.size > 0) {
            t.children.forEach((el) => testNChilds.push(...testAndChilds(el)));
        } else if (!toDelete.find((e) => e === t)) {
            testNChilds.push(t);
        }

        return testNChilds;
    }
}
