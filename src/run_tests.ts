/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     run_tests.ts
 * Date:     23.Feb.2023
 *
 * ==============================================================================
 */

import * as c from "./constants";
import * as h from "./extension_helpers";
import * as io from "./osInteraction";
import * as p from "./parsing";
import * as t from "./list_tests";
import * as vscode from "vscode";

/**
 * Check for new tests by running the text runners needed for the given tests.
 * Also removes deleted tests from the Test Explorer tree - if their parent is
 * included in the list of tests to run.
 * @param env The extension's environment.
 * @param request The run request containing the list of tests to run.
 */
export async function checkForNewTests(
    env: h.Env,
    request: vscode.TestRunRequest
) {
    const workspaces: vscode.WorkspaceFolder[] = [];
    if (request.include) {
        workspaces.push(...h.testItemsToWorkspaces(request.include));
    } else {
        workspaces.push(...h.workspaceFolders());
    }
    await t.addTests(env, workspaces);
}

/**
 * Run a single test and set the test's state.
 * @param env The environment needed to run a test.
 * @param test The test to run.
 */
export async function runSingleTest(env: h.Env, test: vscode.TestItem) {
    const ret = env.testData.get(test);
    env.outChannel.appendLine(
        `Running test "${test.parent ? test.parent.label : ""}   ${
            test.id
        }    ${test?.label}"`
    );
    if (ret) {
        const { root, runner } = ret;
        const startTime = Date.now();
        test.busy = true;
        const out = await io.runRunnerTestsDune(root, runner, [
            `${test.parent?.label}`,
            `${test.id}`,
        ]);

        await parseTestResult(env, { out, startTime, test });
        // eslint-disable-next-line require-atomic-updates
        test.busy = false;
        env.run?.appendOutput(`${out.stdout?.replace(/\n/gu, "\r\n")}`);
    }
}

/**
 * Parse a test and set the test state.
 * Including failure location in the source code.
 * @param env The environment needed for the parsing.
 * @param data The data to parse and construct the test result.
 */

async function parseTestResult(
    env: h.Env,
    data: {
        out: io.Output;
        startTime: number;
        test: vscode.TestItem;
    }
) {
    env.outChannel.appendLine(
        `Test output:\n${data.out.stdout}${data.out.stderr}${
            data.out.error ? data.out.error : ""
        }`
    );
    if (data.out.error || data.out.stderr?.length) {
        const msg = data.out.stderr?.length
            ? data.out.stderr
            : (data.out.error as string);
        await setRunnerError(env, msg, data.test);
        return;
    }

    const [errList] = p.parseTestErrors(data.out.stdout as string);
    const errElem = errList?.tests.find((e) => `${e.id}` === data.test.id);
    if (errElem) {
        await setTestError(env, data, errElem);
    } else {
        env.run?.passed(data.test, Date.now() - data.startTime);
    }
}

/**
 * Set the state of the test to 'failed'.
 * @param env The environment of the extension.
 * @param data The needed data.
 * @param errElem The test that produced the error.
 */

async function setTestError(
    env: h.Env,
    data: { out: io.Output; startTime: number; test: vscode.TestItem },
    errElem: p.TestType
) {
    data.test.label = errElem.name;
    let message = await constructMessage({
        txt: data.out.stdout ? data.out.stdout : "",
        test: data.test,
        testData: env.testData,
        errElem,
    });
    env.run?.failed(data.test, message, Date.now() - data.startTime);
}

/**
 * The test produced an error, that means e.g. that the test could not be
 * compiled.
 * @param env The extension's environment.
 * @param msg The error message.
 * @param test The test that produced the error.
 */

async function setRunnerError(env: h.Env, msg: string, test: vscode.TestItem) {
    const mess = new vscode.TestMessage(msg);
    const loc = await setSourceLocation(test, env.testData);
    mess.location = loc;
    env.run?.errored(test, mess);
}

/**
 * Return a `TestMessage` object filled with the information of the failed
 * test.
 * @param data The needed data.
 * @param errElem The test object of the test that failed.
 * @returns A `TestMessage` object filled with the information of the failed
 * test.
 */

async function constructMessage(data: {
    txt: string;
    test: vscode.TestItem;
    testData: h.TestData;
    errElem: p.TestType;
}) {
    let message = new vscode.TestMessage(data.txt);
    const loc = await setSourceLocation(data.test, data.testData);
    if (loc) {
        message.location = loc;
    }
    message.actualOutput = data.errElem.actual;
    message.expectedOutput = data.errElem.expected;
    return message;
}

/**
 * Return the line and column of the test error.
 * @param data The data needed to get the source location.
 * @returns A `Location` of the error or `undefined`.
 */

async function setSourceLocation(test: vscode.TestItem, testData: h.TestData) {
    if (test.uri) {
        const textData = await vscode.workspace.fs.readFile(test.uri);
        const ret = testData.get(test);
        const regexPref = ret?.isInline ? c.inlineTestPrefix + '"' : '"';
        const loc = h.getPosition(
            regexPref + p.escapeRegex(test.label),
            textData.toString()
        );
        return new vscode.Location(test.uri, loc);
    }
    // eslint-disable-next-line no-undefined
    return undefined;
}
