"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var js_yaml_1 = __importDefault(require("js-yaml"));
var Either_1 = require("fp-ts/lib/Either");
function getContent(url) {
    return function () {
        return axios_1.default({
            method: "get",
            url: url
        })
            .then(function (_a) {
            var data = _a.data;
            return Either_1.right(typeof data === "object" ? data : js_yaml_1.default.safeLoad(data));
        })
            .catch(function (error) { return Either_1.left(error); });
    };
}
exports.getContent = getContent;
