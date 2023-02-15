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
export const runProfileLabel = "Run test";

/**
 ******************************************************************************
 *  Configuration constants.
 */

/**
 * The name of the configuration section of the extension.
 */
export const configurationSection = "alcotest";

/**
 * The paths to the (possible) test directories.
 */
export const configurationTestDir = "testDirectories";
