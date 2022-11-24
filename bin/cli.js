"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
var arg_1 = __importDefault(require("arg"));
var inquirer_1 = __importDefault(require("inquirer"));
var T = __importStar(require("fp-ts/lib/Task"));
var E = __importStar(require("fp-ts/lib/Either"));
var function_1 = require("fp-ts/lib/function");
function parseArgumentsIntoOptions(rawArgs) {
    var args = arg_1.default({
        "--destination": String,
        "--source": String,
        "--type": String,
        "--parser": String,
        "--exitOnInvalidType": Boolean,
        "--patchSource": String,
        "-d": "--destination",
        "-s": "--source",
        "-t": "--type",
        "-p": "--parser",
        "-e": "--exitOnInvalidType",
    }, {
        argv: rawArgs.slice(2),
    });
    return {
        destination: args["--destination"],
        source: args["--source"],
        exitOnInvalidType: args["--exitOnInvalidType"] || false,
        type: args["--type"],
        parser: args["--parser"],
        patchSource: args["--patchSource"],
    };
}
function getQuestions(options) {
    var questions = [];
    if (!options.source) {
        questions.push({
            type: "string",
            name: "source",
            message: "Swagger's url or path",
        });
    }
    if (!options.destination) {
        questions.push({
            type: "string",
            name: "destination",
            message: "Name of the file",
        });
    }
    if (!options.type) {
        questions.push({
            type: "list",
            name: "type",
            message: "Types to generate",
            choices: ["TypeScript", "Flow"],
            default: "TypeScript",
        });
    }
    if (!options.parser) {
        questions.push({
            type: "list",
            name: "parser",
            message: "Parser format",
            choices: ["typescript", "babel", "flow", "babel-flow"],
            default: "typescript",
        });
    }
    return questions;
}
function checkOptions(answers) {
    if (!answers.source) {
        return E.left(new Error("Source is missing"));
    }
    if (!answers.destination) {
        return E.left(new Error("Destination is missing"));
    }
    if (!answers.type) {
        return E.left(new Error("Type is missing"));
    }
    if (!answers.parser) {
        return E.left(new Error("Parser is missing"));
    }
    return E.right(answers);
}
function getAnswers(questions) {
    return function () { return inquirer_1.default.prompt(questions); };
}
function promptForMissingOptions(options) {
    return function_1.pipe(options, getQuestions, getAnswers, T.map(function (answers) { return (__assign(__assign({}, options), answers)); }), T.map(checkOptions));
}
var cli = function_1.flow(parseArgumentsIntoOptions, promptForMissingOptions);
exports.cli = cli;
