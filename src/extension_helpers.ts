/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     extension_helpers.ts
 * Date:     16.Feb.2023
 *
 * ==============================================================================
 * Helper functions to deal with the extension API.
 */

import * as c from "./constants";
import * as io from "./osInteraction";
import * as p from "./parsing";
import * as vscode from "vscode";

/**
 * Object holding additional data about a `TestItem`.
 * The advantage of a `WeakMap` is the automatic garbage collection of garbage
 * collected key objects. No need to explicitly delete objects.
 */
export type TestData = WeakMap<
    vscode.TestItem,
    {
        runner: string;
        root: vscode.WorkspaceFolder;
        group: string;
        isInline: boolean;
    }
>;

/**
 * Object containing the extension's environment.
 */
export type Env = {
    config: vscode.WorkspaceConfiguration;
    controller: vscode.TestController;
    outChannel: vscode.OutputChannel;
    testData: TestData;
    run?: vscode.TestRun;
};

/**
 * Return the list of currently opened workspace folders, and an empty list `[]`
 *  if no workspace (that includes a folder) has been opened.
 * @returns The list ('or' an empty list `[]`) of currently opened workspace
 * folders.
 */
export function workspaceFolders() {
    return vscode.workspace.workspaceFolders || [];
}

export function testItemsToWorkspaces(items: vscode.TestItem[]) {
    const wFolders = workspaceFolders();
    const workspaces = items
        .map(onlyWorkspaces)
        .sort((i, j) => i.id.localeCompare(j.id))
        // eslint-disable-next-line no-magic-numbers
        .filter((v, idx, arr) => v.id !== arr.at(idx + 1)?.id)
        .map(
            (v) =>
                wFolders.find(
                    (w) => `${w.name}` === v.id
                ) as vscode.WorkspaceFolder
        );

    return workspaces;

    /**
     * Return the workspaces containing the tests.
     * @param i The `TestItem` to process.
     * @returns The workspaces containing the tests.
     */
    function onlyWorkspaces(i: vscode.TestItem) {
        if (i.parent?.parent?.parent) {
            return i.parent.parent.parent;
        } else if (i.parent?.parent) {
            return i.parent.parent;
        } else if (i.parent) {
            return i.parent;
        }
        return i;
    }
}

/**
 * Return the first location of `s` in `text`, as `Position`.
 *
 * @param s The string to search for.
 * @param text The text to search the string in.
 * @returns The first position of `s` in `text`.
 */
export function getPosition(s: string, text: string) {
    const loc = p.getLineAndCol(s, text);
    return new vscode.Position(loc.line, loc.col);
}

/**
 * Return the start and end line and column of the test in a source file.
 * @param data The data needed to get the source location.
 * @returns A `Location` containing a `Range` of the error or `undefined`.
 */
export async function setSourceLocation(
    test: vscode.TestItem,
    testData: TestData
) {
    if (test.uri) {
        const textData = await vscode.workspace.fs.readFile(test.uri);
        const ret = testData.get(test);
        const regexPref = ret?.isInline ? c.inlineTestPrefix + '"' : '"';
        const startLoc = getPosition(
            regexPref + p.escapeRegex(test.label),
            textData.toString()
        );
        const searchString = regexPref + test.label;
        const endLoc = new vscode.Position(
            startLoc.line,
            startLoc.character + searchString.length
        );
        const errorRange = new vscode.Range(startLoc, endLoc);
        return new vscode.Location(test.uri, errorRange);
    }
    // eslint-disable-next-line no-undefined
    return undefined;
}

/**
 * Return `true`, if the dune command is working in directory `root`, `false`
 * else.
 * Diagnostic output is appended to `env.outChannel`.
 * @param root The directory to use as working directory for dune.
 * @param env The needed extension's environment, an `OutputChannel`.
 * @returns `true`, if the dune command is working in directory `root`, `false`
 * else.
 */
export async function isDuneWorking(
    root: vscode.WorkspaceFolder,
    env: { outChannel: vscode.OutputChannel }
) {
    const {
        stdout: duneStdout,
        stderr: duneStderr,
        error: duneError,
    } = await io.checkDune(root);
    if (duneError) {
        env.outChannel.appendLine(duneError);
        return false;
    } else if (duneStderr?.length) {
        env.outChannel.appendLine(duneStderr);
        return true;
    } else if (duneStdout?.length) {
        env.outChannel.appendLine(duneStdout);
        return true;
    }
    return false;
}
