"use strict";
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
var fs_1 = __importDefault(require("fs"));
var prettier_1 = __importDefault(require("prettier"));
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var pipeable_1 = require("fp-ts/lib/pipeable");
function prettify(types) {
    return prettier_1.default.format(types);
}
function writeToFile(filename) {
    return function (types) {
        return TE.taskify(fs_1.default.writeFile)(filename, types);
    };
}
function write(filename) {
    return function (types) {
        return pipeable_1.pipe(types, prettify, writeToFile(filename));
    };
}
exports.write = write;
