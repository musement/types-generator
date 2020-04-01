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
/* eslint-disable @typescript-eslint/no-non-null-assertion */
var axios_1 = __importDefault(require("axios"));
var js_yaml_1 = __importDefault(require("js-yaml"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var T = __importStar(require("fp-ts/lib/Task"));
var E = __importStar(require("fp-ts/lib/Either"));
var pipeable_1 = require("fp-ts/lib/pipeable");
var utils_1 = require("./utils");
var function_1 = require("fp-ts/lib/function");
function isUrl(pathOrUrl) {
    return pathOrUrl.indexOf("https://") !== -1;
}
function getContentFromURL(url) {
    return function () {
        return axios_1.default({
            method: "get",
            url: url
        })
            .then(function (_a) {
            var data = _a.data;
            return E.right(typeof data === "object" ? data : js_yaml_1.default.safeLoad(data));
        })
            .catch(function (error) { return E.left(error); });
    };
}
function getContentFromPath(file) {
    return function () {
        try {
            var ext = path_1.default.extname(file);
            var content = fs_1.default.readFileSync(file, "utf8");
            var swagger = ext === ".yaml" || ext === ".yml"
                ? js_yaml_1.default.safeLoad(content)
                : JSON.parse(content);
            return E.right(swagger);
        }
        catch (error) {
            return E.left(error);
        }
    };
}
function getContent(source) {
    return pipeable_1.pipe(source, utils_1.doIf(isUrl, function (source) { return getContentFromURL(source); }, function (source) { return T.fromIO(getContentFromPath(source)); }));
}
function patchSwagger(patchSource) {
    return function (swagger) {
        return pipeable_1.pipe(patchSource, function (source) { return getContent(source); }, T.map(E.map(utils_1.patch(swagger))));
    };
}
function getSwagger(patchSource) {
    return function (source) {
        return pipeable_1.pipe(source, function (source) { return getContent(source); }, utils_1.doIf(function () { return patchSource != null; }, function (task) {
            return pipeable_1.pipe(task, T.chain(function (eitherSwagger) {
                return E.either.traverse(T.task)(eitherSwagger, patchSwagger(patchSource));
            }), T.map(E.flatten));
        }, function_1.identity));
    };
}
exports.getSwagger = getSwagger;
