/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     extension.ts
 * Date:     14.Feb.2023
 *
 * ==============================================================================
 * The main extension file.
 * Implement VS Code's `Testing API`, see
 * https://code.visualstudio.com/api/extension-guides/testing.
 */

import * as c from "./constants";
import * as helpers from "./extension_helpers";
import * as io from "./osInteraction";
import * as p from "./parsing";
import * as t from "./list_tests";
import * as vscode from "vscode";

/* eslint-disable no-extra-parens */

// TODO: workspace.onDidChangeWorkspaceFolders

/**
 * Called when the extension is being activated.
 * That is, the registered `Activation Event` has happened. The
 * `Activation Events` are configured in `package.json`, in the
 * `activationEvents` field.
 *
 * @param _context The `vscode.ExtensionContext` to use.
 */
export async function activate(context: vscode.ExtensionContext) {
    const outChannel = vscode.window.createOutputChannel(c.outputChannelName);
    outChannel.appendLine("OCaml Alcotest Test Adapter starting.");

    /*
     * If no workspace exists (that includes an opened folder), we can't do
     * anything sensible anyway.
     */
    if (!vscode.workspace.workspaceFolders) {
        outChannel.appendLine("Not in a workspace/no folder opened. Exiting.");
        return;
    }
    await setupExtension(context, outChannel);
}

/**
 * Setup the extension and add the tests to the Text Explorer view.
 * @param context The extension's context.
 * @param outChannel The channel to log to.
 */
async function setupExtension(
    context: vscode.ExtensionContext,
    outChannel: vscode.OutputChannel
) {
    const testData: t.TestData = new WeakMap();

    const config = vscode.workspace.getConfiguration(c.cfgSection);

    const controller = vscode.tests.createTestController(
        c.testControllerID,
        c.testControllerLabel
    );
    context.subscriptions.push(controller);

    const runProfile = controller.createRunProfile(
        c.runProfileLabel,
        vscode.TestRunProfileKind.Run,
        (r, tok) =>
            runHandler({ config, controller, outChannel, testData }, r, tok)
    );
    context.subscriptions.push(runProfile);

    await t.addTests({ config, controller, outChannel, testData });
}

/**
 * Run or cancel running tests.
 * This is called whenever the user wants to run or cancel tests.
 * @param env All needed objects are contained in this environment.
 * @param request The actual run request.
 * @param token The `CancellationToken`. Whether the user want's to cancel the
 * test runs.
 */
async function runHandler(
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: t.TestData;
    },
    request: vscode.TestRunRequest,
    token: vscode.CancellationToken
) {
    const run = env.controller.createTestRun(request);
    const tests = t.testList(request, env.controller);

    for await (const test of tests) {
        if (!token.isCancellationRequested) {
            const passEnv = {
                config: env.config,
                controller: env.controller,
                outChannel: env.outChannel,
                run,
                testData: env.testData,
            };
            passEnv.run = run;

            run.started(test);
            await runSingleTest(passEnv, test);
        }
    }

    run.end();
}

/**
 * Run a single test and set the test's state.
 * @param env The environment needed to run a test.
 * @param test The test to run.
 */
async function runSingleTest(
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: t.TestData;
        run: vscode.TestRun;
    },
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
        const out = await io.runRunnerTestsDune(root, runner, [
            `${test.parent?.label}`,
            `${test.id}`,
        ]);

        await parseTestResult(env, { out, startTime, test });
        // eslint-disable-next-line require-atomic-updates
        test.busy = false;
        env.run.appendOutput(`${out.stdout?.replace(/\n/gu, "\r\n")}`);
    }
}

/**
 * Parse a test and set the test state.
 * Including failure location in the source code.
 * @param env The environment needed for the parsing.
 * @param data The data to parse and construct the test result.
 */
async function parseTestResult(
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: t.TestData;
        run: vscode.TestRun;
    },
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
        env.run.passed(data.test, Date.now() - data.startTime);
    }
}

/**
 * Set the state of the test to 'failed'.
 * @param env The environment of the extension.
 * @param data The needed data.
 * @param errElem The test that produced the error.
 */
async function setTestError(
    env: {
        config: vscode.WorkspaceConfiguration;
        controller: vscode.TestController;
        outChannel: vscode.OutputChannel;
        testData: t.TestData;
        run: vscode.TestRun;
    },
    data: { out: io.Output; startTime: number; test: vscode.TestItem },
    errElem: p.TestType
) {
    data.test.label = errElem.name;
    let message = await constructMessage(
        {
            txt: data.out.stdout ? data.out.stdout : "",
            test: data.test,
            testData: env.testData,
        },
        errElem
    );
    env.run.failed(data.test, message, Date.now() - data.startTime);
}

/**
 * The test produced an error, that means e.g. that the test could not be
 * compiled.
 * @param env The extension's environment.
 * @param msg The error message.
 * @param test The test that produced the error.
 */
async function setRunnerError(
    env: {
        testData: t.TestData;
        run: vscode.TestRun;
    },
    msg: string,
    test: vscode.TestItem
) {
    const mess = new vscode.TestMessage(msg);
    const loc = await setSourceLocation(test, env.testData);
    mess.location = loc;
    env.run.errored(test, mess);
}

/**
 * Return a `TestMessage` object filled with the information of the failed
 * test.
 * @param data The needed data.
 * @param errElem The test object of the test that failed.
 * @returns A `TestMessage` object filled with the information of the failed
 * test.
 */
async function constructMessage(
    data: {
        txt: string;
        test: vscode.TestItem;
        testData: t.TestData;
    },
    errElem: p.TestType
) {
    let message = new vscode.TestMessage(data.txt);
    const loc = await setSourceLocation(data.test, data.testData);
    if (loc) {
        message.location = loc;
    }
    message.actualOutput = errElem.actual;
    message.expectedOutput = errElem.expected;
    return message;
}

/**
 * Return the line and column of the test error.
 * @param data The data needed to get the source location.
 * @returns A `Location` of the error or `undefined`.
 */
async function setSourceLocation(test: vscode.TestItem, testData: t.TestData) {
    if (test.uri) {
        const textData = await vscode.workspace.fs.readFile(test.uri);
        const ret = testData.get(test);
        const regexPref = ret?.isInline ? c.inlineTestPrefix + '"' : '"';
        const loc = helpers.getPosition(
            regexPref + p.escapeRegex(test.label),
            textData.toString()
        );
        return new vscode.Location(test.uri, loc);
    }
    // eslint-disable-next-line no-undefined
    return undefined;
}
