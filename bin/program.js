"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var E = __importStar(require("fp-ts/lib/Either"));
var T = __importStar(require("fp-ts/lib/Task"));
var pipeable_1 = require("fp-ts/lib/pipeable");
var dowload_1 = require("./dowload");
var generate_1 = require("./generate");
var write_1 = require("./write");
function flatGenerate(options) {
    return T.map(E.chain(generate_1.generate(options)));
}
function flatWrite(destination) {
    return function (eitherString) {
        return pipeable_1.pipe(eitherString, T.chain(function (eitherString) {
            return E.either.traverse(T.task)(eitherString, write_1.write(destination));
        }), T.map(E.flatten));
    };
}
function program(swaggerUrl, destination, options) {
    return pipeable_1.pipe(swaggerUrl, dowload_1.getContent, flatGenerate(options), flatWrite(destination));
}
exports.program = program;
