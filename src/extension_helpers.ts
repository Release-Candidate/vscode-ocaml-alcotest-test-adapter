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

import * as io from "./osInteraction";
import * as vscode from "vscode";
import { getLineAndCol } from "./parsing";

/**
 * Return the list of currently opened workspace folders, and an empty list `[]`
 *  if no workspace (that includes a folder) has been opened.
 * @returns The list ('or' an empty list `[]`) of currently opened workspace
 * folders.
 */
export function workspaceFolders() {
    return vscode.workspace.workspaceFolders || [];
}

/**
 * Return the first location of `s` in `text`, as `Position`.
 *
 * @param s The string to search for.
 * @param text The text to search the string in.
 * @returns The first position of `s` in `text`.
 */
export function getPosition(s: string, text: string) {
    const loc = getLineAndCol(s, text);
    return new vscode.Position(loc.line, loc.col);
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
