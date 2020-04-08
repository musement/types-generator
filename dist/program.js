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
var pipeable_1 = require("fp-ts/lib/pipeable");
var read_1 = require("./read");
var generate_1 = require("./generate");
var write_1 = require("./write");
function program(_a) {
    var source = _a.source, destination = _a.destination, exitOnInvalidType = _a.exitOnInvalidType, type = _a.type, patchSource = _a.patchSource;
    return pipeable_1.pipe(source, read_1.getSwagger(patchSource), TE.chainEitherK(generate_1.generate({ exitOnInvalidType: exitOnInvalidType, type: type })), TE.chain(write_1.write(destination)));
}
exports.program = program;
