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

import * as vscode from "vscode";

/**
 * Return the list of currently opened workspace folders, and an empty list `[]`
 *  if no workspace (that includes a folder) has been opened.
 * @returns The list ('or' an empty list `[]`) of currently opened workspace
 * folders.
 */

export function workspaceFolders() {
    return vscode.workspace.workspaceFolders || [];
}
