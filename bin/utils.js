"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var deepmerge_1 = __importDefault(require("deepmerge"));
function doIf(checkValue, doIfTrue, doIfFalse) {
    return function (value) {
        return checkValue(value) ? doIfTrue(value) : doIfFalse(value);
    };
}
exports.doIf = doIf;
function patch(swagger) {
    return function (toApply) {
        return deepmerge_1.default(swagger, { components: { schemas: __assign({}, toApply) } }, {
            arrayMerge: function (destination, source) { return source; }
        });
    };
}
exports.patch = patch;
