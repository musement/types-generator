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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.write = void 0;
var fs_1 = __importDefault(require("fs"));
var prettier_1 = __importDefault(require("prettier"));
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var function_1 = require("fp-ts/lib/function");
function prettify(types, parser) {
    return prettier_1.default.format(types, { parser: parser });
}
function writeToFile(filename) {
    return function (types) {
        return TE.taskify(fs_1.default.writeFile)(filename, types);
    };
}
function write(filename, parser) {
    return function_1.flow(function (types) { return prettify(types, parser); }, writeToFile(filename));
}
exports.write = write;
