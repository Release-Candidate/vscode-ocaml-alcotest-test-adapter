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
 * Regexp to parse version numbers.
 * Ignores leading and trailing whitespace including newlines.
 * The version number is captured in the first group with name `version`.
 */
const versionRegex =
    /^[\s]*[vV]?(?:ersion)?\s*(?<version>[\p{N}][\p{N}\p{P}~]*)[\s]*$/mu;

/**
 * Regexp to parse Alcotest test lists.
 * The suite name is saved in the first match group, `suite`, the ID is captured
 * in the second group with name `id` and the test's name is the third group
 * called `name`.
 */
const testListRegex = /^(?<suite>\S+.*?)\s+(?<id>\d+)\s+(?<name>.*)$/gmu;

/**
 * Return `true` if the given string is a valid version string, `false` else.
 * If `s` is `undefined` or the empty string `""` or just whitespace, `false` is
 * returned.
 * Leading and trailing whitespace (including newlines) is ignored.
 * @param s The string to validate as a version.
 * @returns `true`, if `s` is a valid version, `false` else.
 */
export function isValidVersion(s: string | undefined) {
    if (!s?.length) {
        return false;
    }

    const m = s.match(versionRegex);
    // eslint-disable-next-line no-magic-numbers
    if (m) {
        return true;
    }

    return false;
}

/**
 * Parse the given list of Alcotest test cases and return them.
 *
 * Return a list of objects `{ suite, id, name }`, where `suite` is the name of
 * the test suite, `id` is the id of the test and `name` is it's name.
 * @param s The string to parse.
 * @returns A list of objects `{ suite, id, name }`.
 */
export function parseTestList(s: string) {
    if (!s.length) {
        return [];
    }

    const matches = s.matchAll(testListRegex);

    const parsedTests = [];
    for (const match of matches) {
        parsedTests.push({
            suite: match.groups?.suite ? match.groups.suite : "",
            id: match.groups?.id ? parseInt(match.groups.id, 10) : 0,
            name: match.groups?.name ? match.groups.name : "",
        });
    }

    return parsedTests;
}
