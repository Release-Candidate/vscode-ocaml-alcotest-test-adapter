/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     constants.ts
 * Date:     15.Feb.2023
 *
 * ==============================================================================
 * All constants used somewhere in the extension.
 */

import * as vscode from "vscode";

/**
 * The `id` parameter of `createTestController`.
 * Shall be a globally unique ID.
 */
export const testControllerID = "alcotestTestController";

/**
 * The `label` parameter of `createTestController`.
 */
export const testControllerLabel = "Alcotest Tests";

/**
 * The name of the VS Code output channel - that's the `OUTPUT` tab of the
 * panel.
 */
export const outputChannelName = "Alcotest Tests";

/**
 * The label of the `TestRunProfileKind.Run` test profile.
 */
export const runProfileLabel = "Run Alcotest tests";

/**
 * The label of root of the inline test tree in the Test Explorer view.
 */
export const inlineTestsLabel = "Inline Tests (PPX)";

/**
 * Return the visible name of the workspace.
 * In the format: `Workspace: ID`.
 * @param id The id of the workspace.
 * @returns The visible name of the workspace.
 */
export function workspaceLabel(id: string) {
    return `Workspace: ${id}`;
}

/**
 * Glob to search for sources of tests.
 */
export const testSourceGlob = "**/*.ml";

/**
 * Regex string to prepend to an inline test name.
 */
export const inlineTestPrefix = "let%test\\s+";

/**
 ******************************************************************************
 *  Test runner constants.
 */

/**
 * Path of the build sandbox directory to ignore when searching for executables.
 */
export const sandboxDir = "_build/.sandbox";

/**
 * The cmd to call `dune`.
 */
export const duneCmd = "dune";

/**
 * The name of dune configuration files in the test directories.
 */
export const duneFileName = "dune";

/**
 * The argument to get dune's version.
 * Used to check if dune is callable at all.
 */
export const duneVersionArg = "--version";

/**
 * The argument for dune to run an executable.
 * Used to execute the test runners.
 */
export const duneExecArg = "exec";

/**
 * The argument to pass to dune to run all known tests.
 */
export const duneAllTestArg = "runtest";

/**
 * The argument for the test runner to run a single test or the given list of
 * tests.
 */
export const runnerTestArg = "test";

/**
 * Options to pass to the Alcotest test runner to get a list of tests without
 * colorization escape sequences.
 */
export const runnerListOpts = ["list", "--color=never"];

/**
 * Options to pass to the Alcotest test runner to get run tests without
 * colorization escape sequences, with a less verbose output and show the tests
 * errors.
 */
export const runnerTestOpts = ["--color=never", "-c", "-e"];

/**
 * Glob pattern to find the inline Alcotest runner executable.
 */
export const runnerExeGlob = "**/inline_test_runner_*.exe";

/**
 * The suffix for test runner executables.
 */
export const exeSuffix = ".exe";

/**
 ******************************************************************************
 *  Configuration constants.
 */

/**
 * The name of the configuration section of the extension.
 */
export const cfgSection = "alcotest";

/**
 * The paths to the (possible) test directories.
 */
export const cfgTestDir = "testDirectories";

/**
 * Default value for `configurationTestDir`.
 */
export const cfgDefaultTestDir = ["test", "tests"];

/**
 * Return the configuration value for `testDirectories`.
 *
 * @param config The configuration object to use.
 * @returns The configuration value for `testDirectories`.
 */
export function getCfgTestDirs(config: vscode.WorkspaceConfiguration) {
    return config.get<string[]>(cfgTestDir) || cfgDefaultTestDir;
}
