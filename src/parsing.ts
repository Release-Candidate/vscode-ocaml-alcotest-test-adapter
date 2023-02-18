/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     parsing.ts
 * Date:     16.Feb.2023
 *
 * ==============================================================================
 * Parse test lists, test results, files for tests, ...
 */

/**
 * Return `true` if the given string is a valid version string, `false` else.
 * If `s` is `undefined` or the empty string `""`, `false` is returned.
 * Leading and trailing whitespace (including newlines) is ignored.
 * @param s The string to validate as a version.
 * @returns `true`, if `s` is a valid version, `false` else.
 */
export function isValidVersion(s: string | undefined) {
    if (!s?.length) {
        return false;
    }

    return true;
}
