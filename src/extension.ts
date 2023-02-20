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
import * as t from "./tests";
import * as vscode from "vscode";

// TODO: workspace.onDidChangeWorkspaceFolders

/**
 * Called when the extension is being activated.
 * That is, the registered `Activation Event` has happened. The
 * `Activation Events` are configured in `package.json`, in the
 * `activationEvents` field.
 *
 * @param _context The `vscode.ExtensionContext` to use.
 */
// eslint-disable-next-line max-statements
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
    const testData: t.TestData = new WeakMap();

    const config = vscode.workspace.getConfiguration(c.cfgSection);

    const controller = vscode.tests.createTestController(
        c.testControllerID,
        c.testControllerLabel
    );
    context.subscriptions.push(controller);

    controller.createRunProfile(
        c.runProfileLabel,
        vscode.TestRunProfileKind.Run,
        (r, tok) =>
            runHandler({ config, controller, outChannel, testData }, r, tok)
    );

    await t.addTests({ config, controller, outChannel, testData });

    controller.resolveHandler = async () =>
        t.addTests({ config, controller, outChannel, testData });
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
            await runSingleTest(passEnv, test);
        }
    }

    run.end();
}

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
    env.outChannel.appendLine(
        `Running test "${test.parent ? test.parent.label : ""}   ${
            test.id
        }    ${test?.label}"`
    );
    const ret = env.testData.get(test);
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
 * Parse a test
 * @param env
 * @param data
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
    env.outChannel.appendLine(`Test output:\n${data.out.stdout}`);
    const [errList] = p.parseTestErrors(data.out.stdout as string);
    const errElem = errList?.tests.find((e) => `${e.id}` === data.test.id);
    if (errElem) {
        let message = await constructMessage(
            {
                out: data.out,
                startTime: data.startTime,
                test: data.test,
                testData: env.testData,
            },
            errElem
        );
        env.run.failed(data.test, message, Date.now() - data.startTime);
    } else {
        env.run.passed(data.test, Date.now() - data.startTime);
    }
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
        out: io.Output;
        startTime: number;
        test: vscode.TestItem;
        testData: t.TestData;
    },
    errElem: p.TestType
) {
    let message = new vscode.TestMessage(
        data.out.stdout ? data.out.stdout : ""
    );
    if (data.test.uri) {
        const textData = await vscode.workspace.fs.readFile(data.test.uri);
        const ret = data.testData.get(data.test);
        const regexPref = ret?.isInline ? c.inlineTestPrefix + '"' : '"';
        const loc = helpers.getPosition(
            regexPref + p.escapeRegex(data.test.label) + '"',
            textData.toString()
        );
        message.location = new vscode.Location(data.test.uri, loc);
    }
    message.actualOutput = errElem.actual;
    message.expectedOutput = errElem.expected;
    return message;
}
