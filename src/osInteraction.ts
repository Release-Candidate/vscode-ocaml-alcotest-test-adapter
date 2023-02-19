/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     osInteraction.ts
 * Date:     16.Feb.2023
 *
 * =============================================================================
 * File system access, reading files, calling executables and other interactions
 * with the OS. I/O.
 */
/* eslint-disable camelcase */

import * as c from "./constants";
import * as child_process from "child_process";
import internal = require("stream");
import * as parse from "./parsing";
import * as vscode from "vscode";

/**
 * Object holding the output of a process.
 *
 * Only two possible `Output`s exist: either
 * `{ stdout: string; stderr: string }` or `{ error: string }`.
 *
 *  - If an error occurred while executing the command, the field `error` is set to
 * the message. Normally that means, that the command has not been found.
 * `stdout` and `stderr` are both `undefined`.
 * - If the command returned an error, the error message is returned in the
 * field `stderr`, the output (if any) of stdout is in the string `stdout` and
 * `error` is `undefined`.
 * - If the command finished successfully, the output is returned in the field
 * `stdout`, the field `stderr` should be the empty string `""` and `error` is
 * `undefined`.
 */
export type Output = {
    stdout?: string;
    stderr?: string;
    error?: string;
};

/**
 * Check which of the given relative directories exist and are directories.
 * Return a list of directories, so that for all of the returned directories
 * path holds: `root`/path exists and path is in `dirs`.
 * @param root The directory to append the relative directories to test to.
 * @param dirs The relative directory paths to check for existence.
 * @returns A list of relative paths of the directories of `dirs` that exist.
 */
export async function filterExistingDirs(
    root: vscode.WorkspaceFolder,
    dirs: string[]
) {
    const promises = [];
    for (let dir of dirs) {
        const path = vscode.Uri.joinPath(root.uri, dir);
        promises.push(vscode.workspace.fs.stat(path));
    }
    const stats = await Promise.allSettled(promises);

    const statsAndPaths: [PromiseSettledResult<vscode.FileStat>, string][] =
        stats.map((e, idx) => [e, dirs[idx]]);

    function filterDirs(f: PromiseSettledResult<vscode.FileStat>) {
        return (
            f.status === "fulfilled" &&
            (f.value.type === vscode.FileType.Directory ||
                f.value.type === vscode.FileType.SymbolicLink)
        );
    }

    // eslint-disable-next-line no-unused-vars
    return statsAndPaths.filter(([f]) => filterDirs(f)).map(([_, d]) => d);
}

/**
 * Return `true` if the given path 'is' a file or symbolic link.
 * Return `false` else.
 * @param uri The `Uri` of the file to check.
 * @returns `true` if the given path 'is' a file or symbolic link. `false` else.
 */
export async function existsIsFile(uri: vscode.Uri) {
    try {
        const stat = await vscode.workspace.fs.stat(uri);
        return (
            stat.type === vscode.FileType.File ||
            stat.type === vscode.FileType.SymbolicLink
        );
    } catch (error) {
        return false;
    }
}

/**
 * Return a list of files matching the pattern `glob` in the directory `root`.
 * If no file matching the pattern has been found or an error occurred, the
 * empty list `[]` is returned.
 * @param root The path of the directory to search in.
 * @param glob The glob pattern to match against the absolute path of a file.
 * @returns A list of files matching the pattern `glob` in the directory `root`.
 */
export async function findFilesRelative(
    root: vscode.WorkspaceFolder,
    glob: string
) {
    try {
        const pattern = new vscode.RelativePattern(root, glob);
        const uris = await vscode.workspace.findFiles(pattern);
        return uris;
    } catch (error) {
        return [];
    }
}

/**
 * Spawn the given command with the given arguments and return the output.
 * Set `root` as the working directory of the command.
 * `{ stdout; stderr; error }` is returned, see {@link Output}.
 * @param root The current working directory for the command.
 * @param cmd The command to call.
 * @param args The arguments to pass to the command.
 * @returns An object containing the output of the command's execution.
 */
export async function runCommand(
    root: vscode.WorkspaceFolder,
    cmd: string,
    args: string[]
): Promise<Output> {
    const process = child_process.spawn(cmd, args, { cwd: root.uri.path });

    const checkCmd = new Promise((_, reject) => {
        process.on("error", reject);
    });

    const out = await readStream(process.stdout);
    const err = await readStream(process.stderr);

    const exitCode = new Promise<number>((resolve) => {
        process.on("close", resolve);
    });

    try {
        await Promise.race([checkCmd, exitCode]);
        return { stdout: out, stderr: err };
    } catch (error) {
        // eslint-disable-next-line no-extra-parens
        return { error: (error as Error).message };
    }
}

/**
 * Run the given runner executable with command line arguments to list all tests
 * using dune and return its output.
 * Set `root` as the working directory of the command.
 * The test list output is contained in `stdout`, `stderr` should be the empty
 * string und `error` should be `undefined`. See {@link Output}
 * @param root The current working directory for the dune command.
 * @param runner The path to the runner to execute.
 * @returns The output of the test runner in the `stdout` field.
 */
export async function runRunnerListDune(
    root: vscode.WorkspaceFolder,
    runner: vscode.Uri
) {
    return runCommand(root, c.duneCmd, [
        c.duneExecArg,
        runner.path,
        "--",
        ...c.runnerListOpts,
    ]);
}

/**
 * Run the given runner executable command line arguments to run all given tests
 * using dune and return its output.
 * Set `root` as the working directory of the command.
 * `{ stdout; stderr; error }` is returned, see {@link Output}.
 * @param root The current working directory for the dune command.
 * @param runner The path to the runner to execute.
 * @param tests The names of the tests to run.
 * @returns The output of the test runner.
 */
export async function runRunnerTestsDune(
    root: vscode.WorkspaceFolder,
    runner: vscode.Uri,
    tests: string[]
) {
    return runCommand(root, c.duneCmd, [
        c.duneExecArg,
        runner.path,
        "--",
        c.runnerTestArg,
        ...tests,
        ...c.runnerTestOpts,
    ]);
}

/**
 * Run all known tests using `dune runtest` and return its output.
 * @param root The current working directory for the dune command.
 * @returns The output of `dune test` called in the directory `root`.
 */
export async function runDuneTests(root: vscode.WorkspaceFolder) {
    return runCommand(root, c.duneCmd, [c.duneAllTestArg]);
}

/**
 * Check, if dune is working, that is `dune --version` returns a version.
 * A message suitable to be logged is returned in `error`, `stderr` or
 * `stdout`.
 *
 * If the dune command has not been found or is not working at all, an error
 * message is returned in `error`.
 * If the dune command works, but the `--version` argument printed something at
 * stderr, `stderr` is set to a warning message, but I guess dune is working and
 * can be used.
 * If 'dune --version' returned a version string that could not be parsed,
 * `stderr` is set to a message, but I guess dune is working and
 * can be used.
 * If 'dune --version' could be parsed, a message is returned in the field
 * `stdout`.
 * @param root The working directory for dune to use.
 * @returns A message suitable to be logged is returned in `error`, `stderr` or
 * `stdout`.
 */
export async function checkDune(root: vscode.WorkspaceFolder): Promise<Output> {
    const {
        stdout: duneVersion,
        stderr: duneStderr,
        error: cmdError,
    } = await runCommand(root, c.duneCmd, [c.duneVersionArg]);
    if (cmdError) {
        return {
            error: `Error calling ${c.duneCmd} in ${root.uri.path}, can't use dune! Error message: """${cmdError}"""`,
        };
    }
    if (duneStderr?.length) {
        return {
            stderr: `Warning: ${c.duneCmd} ${duneVersion} did return something at stderr: """${duneStderr}"""
not sure if dune is working, but using it anyway`,
        };
    }
    if (parse.isValidVersion(duneVersion)) {
        return {
            stdout: `Dune command "${c.duneCmd}" is working in ${root.uri.path}.`,
        };
    }
    return {
        stderr: `Info: ${c.duneCmd} ${duneVersion} did return '${duneVersion}' which I could not parse as a version. Using ${c.duneCmd} anyway.`,
    };
}

/**
 * Return all data read from the given stream.
 * @param stream The stream to read from.
 * @returns All data read from the given stream.
 */
export async function readStream(stream: internal.Readable) {
    let out = "";
    for await (const chunk of stream) {
        out = out.concat(chunk);
    }

    return out;
}
