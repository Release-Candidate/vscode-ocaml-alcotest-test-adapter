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

import * as c from "./constants";

/* eslint-disable max-lines */

/**
 * Regexp to escape special regexp characters in strings.
 */
const regexpRegex = /[\\^$.*+?()[\]{}|-]/gu;

/**
 * Regexp to parse version numbers.
 * Ignores leading and trailing whitespace including newlines.
 * The version number is captured in the first group with name `version`.
 */
const versionRegex =
    /^[\s]*[vV]?(?:ersion)?\s*(?<version>[\p{N}][\p{N}\p{P}~]*)[\s]*$/mu;

/**
 * Regex to parse dune test definitions to get the name of the tests
 * executables, stored in group `path`.
 * Parsing `(test[s] (name[s] ...))` stanzas.
 */
const duneTestRegex1 =
    /\(test[s]?\s+\(name[s]?(?<path>(?:\s+[^()\s]+)+)\s*\).*?\s*\)/gmsu;

/**
 * Regex to parse dune test definitions to get the name of the tests
 * executables.
 * Parsing `(test[s] (name[s] ...))` stanzas.
 */
const duneTestRegex2 =
    /\(alias\s+(?:\(name\s+)?runtest\s*\).*?\(action\s+\(run\s+(?:%\{exe:)?(?<path>[^()\s}]+)/gmsu;

/**
 * Regexp to parse Alcotest test lists.
 * The test group's name is saved in the first match group, `group`, the ID is captured
 * in the second group with name `id` and the test's name is the third group
 * called `name`.
 * Ignores added (or not added) points at the end of the name.
 */
const testListRegex = /^(?<group>\S+.*?)\s+(?<id>\d+)\s+(?<name>.*?)\.+$/gmu;

/**
 * Regexp to parse Alcotest test results for errors.
 * The test group's name is saved in the first match group, `group`, the ID is captured
 * in the second group with name `id` and the test's name is the third group
 * called `name`.
 * The expected value is returned in the fourth match group, called `exp`, the
 * actual value is returned in the fifth group, `rec`.
 */
const testErrorRegex =
    /^│\s+\[FAIL\]\s+(?<group>\S+[^\n]*?)\s+(?<id>\d+)\s+(?<name>[^\n]+?)\.+\s+│\s+[└─┘]+\s+A.*?^\s+Expected:\s+`(?<exp>.*?)'\s*\n+\s+\s+Received:\s+`(?<rec>.*?)'\s*\n\n/gmsu;

/**
 * Regexp to parse Alcotest test results for errors.
 * The test group's name is saved in the first match group, `group`, the ID is captured
 * in the second group with name `id` and the test's name is the third group
 * called `name`.
 * The exception call stack is returned in the fourth match group, called
 * `excp`.
 */
const testExceptionRegex =
    /^│\s+\[FAIL\]\s+(?<group>\S+[^\n]*?)\s+(?<id>\d+)\s+(?<name>[^\n]+?)\.+\s+│\s+[└─┘]+\s+^(?=\[exception\]\s+(?<excp>.*?)\n\n)/gmsu;

/**
 * Escape special regexp characters in `s`.
 * @param s The string in which to escape special characters
 * @returns The string `s` with all special characters escaped.
 */
export function escapeRegex(s: string) {
    return s.replace(regexpRegex, "\\$&");
}

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
 * Return the first position of `s` in `text`, as line number and column number.
 *
 * @param s The string to search for.
 * @param text The text to search the string in.
 * @returns The first position of `s` in `text`, as line number and column number.
 */
export function getLineAndCol(s: string, text: string) {
    const lines = text.split("\n");
    let lineNum = 0;
    for (const line of lines) {
        const index = line.search(s);
        if (index >= 0) {
            return { line: lineNum, col: index };
        }
        // eslint-disable-next-line no-magic-numbers
        lineNum += 1;
    }

    return { line: 0, col: 0 };
}

/**
 * Parse the given dune stanzas for paths to test executables.
 * @param s The content of a dune file to parse for test executable names.
 * @returns A list of found test executable paths relative to the dune file
 * location.
 */
export function parseDuneTests(s: string) {
    if (!s.length) {
        return [];
    }

    const paths: string[] = [];
    const matches1 = s.matchAll(duneTestRegex1);
    for (const match of matches1) {
        paths.push(...matchToRelPath(match));
    }
    const matches2 = s.matchAll(duneTestRegex2);
    for (const match of matches2) {
        paths.push(...matchToRelPath(match));
    }

    return paths;
}

/**
 * Add the relative path of the matched executable to the list of paths.
 * Add an executable suffix if not already there and an `./` prefix if the path
 * isn't already a relative one.
 * Require: the regex match shall contain the match group `path`.
 * @param match The match object to process.
 */
function matchToRelPath(match: RegExpMatchArray) {
    const exes = match.groups ? match.groups.path.trim().split(/\s+/u) : [];
    const relPaths = exes.map((p) => {
        const pa = p.trim();
        const pab = pa.endsWith(c.exeSuffix) ? pa : pa.concat(c.exeSuffix);
        return pab.startsWith(".") ? pab : "./".concat(pab);
    });

    return relPaths;
}

/**
 * Parse the given list of Alcotest test cases and return them.
 *
 * Return a list of objects `{ name: group, tests: [{ id, name }] }`, where
 * `group` is the name of the test group the test is in, `id` is the id of the
 * test and `name` is it's name.
 * @returns A list of objects `{ name: group, tests: [{ id, name }] }`.
 */
export function parseTestList(s: string) {
    return groupTestHelper(
        parseTestHelper(testListRegex, s, listMatchToObject)
    );
}

/**
 * Parse the given list of Alcotest test results and return the tests with
 * errors.
 *
 * Return a list of objects `{ name: group, tests: [{ id, name, expected, actual }] }`,
 * where `group` is the name of the test group the test is in, `id` is the id of
 * the test and `name` is it's name, `actual` is the actual test result and
 * `expected` is the expected test result..
 * @param s The string to parse.
 * @returns A list of objects `{ name: group, tests: [{ id, name, expected, actual }] }`.
 */
export function parseTestErrors(s: string) {
    return groupTestHelper(
        parseTestHelper<TestTypeIn>(
            testErrorRegex,
            s,
            errorMatchToObject
        ).concat(parseTestHelper(testExceptionRegex, s, exceptionMatchToObject))
    );
}

/**
 * Parse the given string `s`  using regexp `r` and return the results as a
 * list sorted by `group`.
 * Return a list of test objects `{ group, ... }` sorted
 * by group name.
 * @param r The regexp to use to parse ethe string `s`.
 * @param s The string to parse.
 * @param matchToObject: Function to convert the match object to a test oject.
 * @returns A list of test objects `{ group, ... }`
 * sorted by `group`.
 */
function parseTestHelper<T extends { group: string }>(
    r: RegExp,
    s: string,
    // eslint-disable-next-line no-unused-vars
    matchToObject: (m: RegExpMatchArray) => T
) {
    if (!s.length) {
        return [];
    }

    const matches = s.matchAll(r);

    const parsedTests = [];
    for (const match of matches) {
        parsedTests.push(matchToObject(match));
    }

    if (parsedTests.length) {
        parsedTests.sort(({ group: groupId1 }, { group: groupId2 }) =>
            groupId1.localeCompare(groupId2)
        );
    }

    return parsedTests;
}

/**
 * Return an object constructed by the match groups of `match`.
 * @param match The match object containing match groups `group`, `id`, `name`
 * `exp` and `rec`.
 * @returns The object filled with the match groups of `match`.
 */
function errorMatchToObject(match: RegExpMatchArray) {
    return {
        group: match.groups?.group ? match.groups.group : "",
        id: match.groups?.id ? parseInt(match.groups.id, 10) : 0,
        name: match.groups?.name ? match.groups.name : "",
        expected: match.groups?.exp ? match.groups.exp : "",
        actual: match.groups?.rec ? match.groups.rec : "",
    };
}

/**
 * Return an object constructed by the match groups of `match`.
 * @param match The match object containing match groups `group`, `id`, `name`
 * and `excp`.
 * @returns The object filled with the match groups of `match`.
 */
function exceptionMatchToObject(match: RegExpMatchArray) {
    return {
        group: match.groups?.group ? match.groups.group : "",
        id: match.groups?.id ? parseInt(match.groups.id, 10) : 0,
        name: match.groups?.name ? match.groups.name : "",
        actual: match.groups?.excp ? match.groups.excp : "",
    };
}

/**
 * Return an object constructed by the match groups of `match`.
 * @param match The match object containing match groups `group`, `id` and
 * `name`.
 * @returns The object filled with the match groups of `match`.
 */
function listMatchToObject(match: RegExpMatchArray) {
    return {
        group: match.groups?.group ? match.groups.group : "",
        id: match.groups?.id ? parseInt(match.groups.id, 10) : 0,
        name: match.groups?.name ? match.groups.name : "",
    };
}

/**
 * The object of a test, which is not grouped by group.
 */
type TestTypeIn = {
    group: string;
    id: number;
    name: string;
    expected?: string;
    actual?: string;
};

/**
 * A single tests object.
 *
 * If the test is the result of parsing a list of tests, only `id` and `name`
 * are filled, `expected` and `actual` do not exist.
 *
 * If the test is the result of parsing a test error, `expected` and `actual`
 * hold the actual and expected value of that failed test.
 */
export type TestType = {
    id: number;
    name: string;
    expected?: string;
    actual?: string;
};

/**
 * Group the list of tests by field `group` and return a list of groups
 * containing lists of tests.
 * Require: `tests` is sorted by group name.
 * @param tests The list of tests to precess.
 * @returns A list of groups containing tests.
 */
function groupTestHelper(tests: TestTypeIn[]) {
    if (!tests.length) {
        return [];
    }

    let currGroup = {
        name: tests[0].group,
        tests: [] as TestType[],
    };
    const groups = [currGroup];

    for (const test of tests) {
        if (test.group !== currGroup.name) {
            currGroup = { name: test.group, tests: [] };
            groups.push(currGroup);
        }
        currGroup.tests.push(convertTestObject(test));
    }
    return groups;
}

/**
 * Convert a `TestTypeIn` object in a `TestType` object.
 * @param test The `TestTypeIn` object to convert.
 * @returns `test` as `TestType` object.
 */
function convertTestObject(test: TestTypeIn) {
    let t = {} as TestType;
    t.id = test.id;
    t.name = test.name;
    if (test.expected) {
        t.expected = test.expected;
    }
    if (test.actual) {
        t.actual = test.actual;
    }
    return t;
}
