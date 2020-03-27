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
var axios_1 = __importDefault(require("axios"));
var js_yaml_1 = __importDefault(require("js-yaml"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var T = __importStar(require("fp-ts/lib/Task"));
var E = __importStar(require("fp-ts/lib/Either"));
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
    return isUrl(source)
        ? getContentFromURL(source)
        : T.fromIO(getContentFromPath(source));
}
exports.getContent = getContent;
