#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
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
