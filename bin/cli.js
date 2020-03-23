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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var arg_1 = __importDefault(require("arg"));
var inquirer_1 = __importDefault(require("inquirer"));
var T = __importStar(require("fp-ts/lib/Task"));
var E = __importStar(require("fp-ts/lib/Either"));
var program_1 = require("./program");
var pipeable_1 = require("fp-ts/lib/pipeable");
function parseArgumentsIntoOptions(rawArgs) {
    var args = arg_1.default({
        "--destination": String,
        "--url": String,
        "--type": String,
        "-d": "--destination",
        "-u": "--url",
        "-t": "--type"
    }, {
        argv: rawArgs.slice(2)
    });
    return {
        destination: args["--destination"],
        url: args["--url"]
    };
}
function getQuestions(options) {
    var questions = [];
    if (!options.url) {
        questions.push({
            type: "string",
            name: "url",
            message: "Swagger's url",
            default: "https://api.musement.com/swagger_3.4.0.json?2"
        });
    }
    if (!options.destination) {
        questions.push({
            type: "string",
            name: "destination",
            message: "Name of the file",
            default: "core.3.4.0.d.ts"
        });
    }
    return questions;
}
function checkOptions(answers) {
    if (!answers.url) {
        return E.left(new Error("Url is missing"));
    }
    if (!answers.destination) {
        return E.left(new Error("Destination is missing"));
    }
    return E.right(answers);
}
function getAnswers(questions) {
    return function () { return inquirer_1.default.prompt(questions); };
}
function promptForMissingOptions(options) {
    return pipeable_1.pipe(options, getQuestions, getAnswers, T.map(function (answers) { return (__assign(__assign({}, options), answers)); }), T.map(checkOptions));
}
function executeProgram(options) {
    return program_1.program(options.url, options.destination);
}
function output(result) {
    return pipeable_1.pipe(result, T.map(E.fold(function (error) { return console.error(error); }, function () { return console.log("success"); })));
}
function cli(args) {
    return pipeable_1.pipe(args, parseArgumentsIntoOptions, promptForMissingOptions, T.chain(function (options) { return E.either.traverse(T.task)(options, executeProgram); }), T.map(E.flatten), output);
}
exports.cli = cli;
