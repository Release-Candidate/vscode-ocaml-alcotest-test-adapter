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
 * The test group's name is saved in the first match group, `group`, the ID is captured
 * in the second group with name `id` and the test's name is the third group
 * called `name`.
 */
const testListRegex = /^(?<group>\S+.*?)\s+(?<id>\d+)\s+(?<name>.*)\.$/gmu;

/**
 * Regexp to parse Alcotest test results for errors.
 * The test group's name is saved in the first match group, `group`, the ID is captured
 * in the second group with name `id` and the test's name is the third group
 * called `name`.
 */
const testErrorRegex =
    /^│\s+\[FAIL\]\s+(?<group>\S+.*?)\s+(?<id>\d+)\s+(?<name>.*)\.\s+│$/gmu;

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
 * Return a list of objects `{ group, id, name }`, where `group` is the name of
 * the test group the test is in, `id` is the id of the test and `name` is it's
 * name.
 * @returns A list of objects `{ suite, id, name }`.
 */
export function parseTestList(s: string) {
    return groupTestHelper(parseTestHelper(testListRegex, s));
}

/**
 * Parse the given list of Alcotest test results and return the tests with
 * errors.
 *
 * Return a list of objects `{ group, id, name }`, where `group` is the name of
 * the test group the test is in, `id` is the id of the test and `name` is it's
 * name.
 * @param s The string to parse.
 * @returns A list of objects `{ suite, id, name }`.
 */
export function parseTestErrors(s: string) {
    return groupTestHelper(parseTestHelper(testErrorRegex, s));
}

/**
 * Parse the given string `s`  using regexp `r` and return the results as a
 * list.
 * The regexp `r` shall define matching groups with names `group`, `id` and
 * `name`.
 * Return a list of test objects `{ group, id, name }` sorted by group name.
 * @param r The regexp to use to parse ethe string `s`. Shall define matching
 * groups with names `group`, `id` and `name`.
 * @param s The string to parse.
 * @returns A list of test objects `{ group, id, name }` sorted by `group`.
 */
function parseTestHelper(r: RegExp, s: string) {
    if (!s.length) {
        return [];
    }

    const matches = s.matchAll(r);

    const parsedTests = [];
    for (const match of matches) {
        parsedTests.push({
            group: match.groups?.group ? match.groups.group : "",
            id: match.groups?.id ? parseInt(match.groups.id, 10) : 0,
            name: match.groups?.name ? match.groups.name : "",
        });
    }

    if (parsedTests.length) {
        parsedTests.sort(({ group: groupId1 }, { group: groupId2 }) =>
            groupId1.localeCompare(groupId2)
        );
    }

    return parsedTests;
}

/**
 * Group the list of tests by field `group` and return a list of groups
 * containing lists of tests.
 * Require: `tests` is sorted by group name.
 * @param tests The list of tests to precess.
 * @returns A list of groups containing tests.
 */
function groupTestHelper(
    tests: {
        group: string;
        id: number;
        name: string;
    }[]
) {
    if (!tests.length) {
        return [];
    }

    let currGroup = {
        name: tests[0].group,
        tests: [] as { id: number; name: string }[],
    };
    const groups = [currGroup];

    for (const test of tests) {
        if (test.group === currGroup.name) {
            currGroup.tests.push({ id: test.id, name: test.name });
        } else {
            currGroup = { name: test.group, tests: [] };
            groups.push(currGroup);
        }
    }
    return groups;
}
