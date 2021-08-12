#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var T = __importStar(require("fp-ts/lib/Task"));
var cli_1 = require("./cli");
var program_1 = require("./program");
var function_1 = require("fp-ts/lib/function");
var exec = function_1.flow(cli_1.cli, TE.chain(program_1.program), TE.fold(function (error) { return T.of(console.error(error)); }, function () { return T.of(console.log("success")); }));
exec(process.argv)();
