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
exports.getSwagger = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
var axios_1 = __importDefault(require("axios"));
var js_yaml_1 = __importDefault(require("js-yaml"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var IE = __importStar(require("fp-ts/lib/IOEither"));
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var E = __importStar(require("fp-ts/lib/Either"));
var function_1 = require("fp-ts/lib/function");
var utils_1 = require("./services/utils");
var function_2 = require("fp-ts/lib/function");
function isUrl(pathOrUrl) {
    return pathOrUrl.indexOf("https://") !== -1;
}
function getContentFromURL(url) {
    return TE.tryCatch(function () {
        return axios_1.default({ method: "get", url: url }).then(function (_a) {
            var data = _a.data;
            return typeof data === "object" ? data : js_yaml_1.default.safeLoad(data);
        });
    }, function (error) { return error; });
}
function getContentFromPath(file) {
    return IE.tryCatch(function () {
        var ext = path_1.default.extname(file);
        var content = fs_1.default.readFileSync(file, "utf8");
        var swagger = ext === ".yaml" || ext === ".yml"
            ? js_yaml_1.default.safeLoad(content)
            : JSON.parse(content);
        return swagger;
    }, function (error) { return error; });
}
function getContent(source) {
    return function_1.pipe(source, utils_1.doIfElse(isUrl, function (source) { return getContentFromURL(source); }, function (source) { return TE.fromIOEither(getContentFromPath(source)); }));
}
function patchSwagger(patchSource) {
    return function (swagger) {
        return function_1.pipe(patchSource, E.fold(function (source) { return getContent(source); }, TE.right), TE.map(utils_1.patch(swagger)));
    };
}
function getSwagger(patchSource) {
    return function (source) {
        return function_1.pipe(source, function (source) { return getContent(source); }, utils_1.doIf(function_2.constant(patchSource != null), TE.chain(patchSwagger(patchSource))));
    };
}
exports.getSwagger = getSwagger;
