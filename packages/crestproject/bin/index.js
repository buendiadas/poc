#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var yargs_1 = __importDefault(require("yargs"));
var extensions = [path_1.default.extname(__filename).slice(1)];
yargs_1.default
    .env('CRESTPROJECT')
    .pkgConf('crestproject')
    .commandDir('commands', { extensions: extensions })
    .demandCommand(1, '')
    .help();
