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
exports.program = void 0;
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var E = __importStar(require("fp-ts/lib/Either"));
var function_1 = require("fp-ts/lib/function");
var read_1 = require("./read");
var generate_1 = require("./generate");
var write_1 = require("./write");
function sourceToEither(source) {
    if (source == undefined) {
        return undefined;
    }
    return typeof source === "string" ? E.left(source) : E.right(source);
}
function program(_a) {
    var source = _a.source, destination = _a.destination, exitOnInvalidType = _a.exitOnInvalidType, type = _a.type, patchSource = _a.patchSource;
    return function_1.pipe(source, read_1.getSwagger(sourceToEither(patchSource)), TE.chainEitherK(generate_1.generate({ exitOnInvalidType: exitOnInvalidType, type: type })), TE.chain(write_1.write(destination)));
}
exports.program = program;
