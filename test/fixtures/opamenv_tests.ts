/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-alcotest-test-adapter
 * File:     opamenv_tests.ts
 * Date:     18.Mar.2023
 *
 * ==============================================================================
 * Possible outputs of `opam env` and the expected results.
 */

/**
 * Output of `opam env` on unix like systems.
 */
export const opamEnvUnixish = `OPAM_SWITCH_PREFIX='/Users/user name/.opam/5.0.0'; export OPAM_SWITCH_PREFIX;
CAML_LD_LIBRARY_PATH='/home/somebody/.opam/5.0.0/lib/stublibs:/home/somebody/.opam/5.0.0/lib/ocaml/stublibs:/home/somebody/.opam/5.0.0/lib/ocaml'; export CAML_LD_LIBRARY_PATH;
OCAML_TOPLEVEL_PATH='/Users/user name/.opam/5.0.0/lib/toplevel'; export OCAML_TOPLEVEL_PATH;
PKG_CONFIG_PATH='/home/somebody/.opam/5.0.0/lib/pkgconfig:/home/somebody/.opam/5.0.0/lib/pkgconfig:'; export PKG_CONFIG_PATH;
PATH='/Users/user name/.opam/5.0.0/bin:/bin:/usr/bin:/usr/local/bin'; export PATH;`;

/**
 * The expected result of parsing `opamEnvUnixish`.
 */
export const opamEnvUnixishObject = [
    { name: "OPAM_SWITCH_PREFIX", value: "/Users/user name/.opam/5.0.0" },
    {
        name: "CAML_LD_LIBRARY_PATH",
        value: "/home/somebody/.opam/5.0.0/lib/stublibs:/home/somebody/.opam/5.0.0/lib/ocaml/stublibs:/home/somebody/.opam/5.0.0/lib/ocaml",
    },
    {
        name: "OCAML_TOPLEVEL_PATH",
        value: "/Users/user name/.opam/5.0.0/lib/toplevel",
    },
    {
        name: "PKG_CONFIG_PATH",
        value: "/home/somebody/.opam/5.0.0/lib/pkgconfig:/home/somebody/.opam/5.0.0/lib/pkgconfig:",
    },
    {
        name: "PATH",
        value: "/Users/user name/.opam/5.0.0/bin:/bin:/usr/bin:/usr/local/bin",
    },
];

/**
 * Some Windows style environment definitions.
 */
export const opamEnvWin = `SET OPAM_SWITCH_PREFIX="C:\\opam\\switch"
setx CAML_LD_LIBRARY_PATH "C:\\some path1;C:\\some other path"
set OCAML_TOPLEVEL_PATH="c:\\toplevel1;c:\\toplvel2"
setx PKG_CONFIG_PATH "C:\\package config\\path"
SET PATH="C:\\Windows;C:\\ocaml\\bin"`;

/**
 * The expected result of parsing `opamEnvUnixish`.
 */
export const opamEnvWinObject = [
    { name: "OPAM_SWITCH_PREFIX", value: "C:\\opam\\switch" },
    {
        name: "CAML_LD_LIBRARY_PATH",
        value: "C:\\some path1;C:\\some other path",
    },
    {
        name: "OCAML_TOPLEVEL_PATH",
        value: "c:\\toplevel1;c:\\toplvel2",
    },
    {
        name: "PKG_CONFIG_PATH",
        value: "C:\\package config\\path",
    },
    {
        name: "PATH",
        value: "C:\\Windows;C:\\ocaml\\bin",
    },
];
