"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var Either_1 = require("fp-ts/lib/Either");
function getContent(url) {
    return function () {
        return axios_1.default({
            method: "get",
            url: url
        })
            .then(function (response) { return Either_1.right(response.data); })
            .catch(function (error) { return Either_1.left(error); });
    };
}
exports.getContent = getContent;
