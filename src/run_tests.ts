/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     run_tests.ts
 * Date:     23.Feb.2023
 *
 * ==============================================================================
 * Run the tests that are being requested by the user.
 */

import * as c from "./constants";
import * as h from "./extension_helpers";
import * as io from "./osInteraction";
import * as p from "./parsing";
import * as t from "./list_tests";
import * as vscode from "vscode";

/**
 * Run or cancel running tests.
 * This is called whenever the user wants to run or cancel tests.
 * @param env All needed objects are contained in this environment.
 * @param request The actual run request.
 * @param token The `CancellationToken`. Whether the user wants to cancel the
 * test runs.
 */
// eslint-disable-next-line max-statements
export async function runHandler(
    env: h.Env,
    request: vscode.TestRunRequest,
    token: vscode.CancellationToken
) {
    const run = env.controller.createTestRun(request);
    setTestsStarted(env, request, run);
    const toDelete = await checkForNewTests(env, token, request);
    const tests = t.testList(request, env.controller, toDelete);

    for (const test of tests) {
        // eslint-disable-next-line no-negated-condition
        if (!token.isCancellationRequested) {
            const passEnv = {
                config: env.config,
                controller: env.controller,
                outChannel: env.outChannel,
                run,
                testData: env.testData,
            };
            passEnv.run = run;
            // eslint-disable-next-line no-await-in-loop
            await runSingleTest(passEnv, token, test);
        } else {
            run.skipped(test);
        }
    }
    if (token.isCancellationRequested) {
        env.outChannel.appendLine(`Cancelling tests.`);
    }

    run.end();
}

/**
 * Set all tests in `request` to 'started'.
 * @param env The extension's environment.
 * @param request The list of tests to run.
 * @param run The test run.
 */
function setTestsStarted(
    env: h.Env,
    request: vscode.TestRunRequest,
    run: vscode.TestRun
) {
    const tests1 = t.testList(request, env.controller, []);
    tests1.forEach((ti) => run.started(ti));
}

/**
 * Check for new tests by running the text runners needed for the given tests.
 * Also removes deleted tests from the Test Explorer tree - if their parent is
 * included in the list of tests to run.
 * @param env The extension's environment.
 * @param token The `CancellationToken`. Whether the user wants to cancel the
 * test runs.
 * @param request The run request containing the list of tests to run.
 */
async function checkForNewTests(
    env: h.Env,
    token: vscode.CancellationToken,
    request: vscode.TestRunRequest
) {
    const workspaces: vscode.WorkspaceFolder[] = [];
    if (request.include) {
        workspaces.push(...h.testItemsToWorkspaces(request.include));
    } else {
        workspaces.push(...h.workspaceFolders());
    }
    return t.addTests(env, workspaces, token);
}

/**
 * Run a single test and set the test's state.
 * @param env The environment needed to run a test.
 * @param token Whether to cancel the test run or not.
 * @param test The test to run.
 */
async function runSingleTest(
    env: h.Env,
    token: vscode.CancellationToken,
    test: vscode.TestItem
) {
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
        const out = await io.runRunnerTestsDune(token, root, {
            duneCmd: c.getCfgDunePath(env.config),
            runner,
            tests: [`${test.parent?.label}`, `${test.id}`],
        });

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
    const loc = await h.setSourceLocation(test, env.testData);
    mess.location = loc;
    env.run?.errored(test, mess);
}

/**
 * Return a `TestMessage` object filled with the information of the failed
 * test.
 * @param data The needed data.
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
    const loc = await h.setSourceLocation(data.test, data.testData);
    if (loc) {
        message.location = loc;
    }
    message.actualOutput = data.errElem.actual;
    message.expectedOutput = data.errElem.expected;
    return message;
}
