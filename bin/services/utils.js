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
exports.toPascalCase = exports.replace = exports.surround = exports.suffix = exports.prefix = exports.split = exports.map = exports.reduce = exports.join = exports.patch = exports.doIf = exports.doIfElse = void 0;
var deepmerge_1 = __importDefault(require("deepmerge"));
var function_1 = require("fp-ts/lib/function");
function doIfElse(checkValue, doIfTrue, doIfFalse) {
    return function (value) {
        return checkValue(value) ? doIfTrue(value) : doIfFalse(value);
    };
}
exports.doIfElse = doIfElse;
function doIf(checkValue, doIfTrue) {
    return function (value) {
        return checkValue(value) ? doIfTrue(value) : value;
    };
}
exports.doIf = doIf;
function patch(swagger) {
    return function (toApply) {
        return deepmerge_1.default(swagger, { components: { schemas: __assign({}, toApply) } }, {
            arrayMerge: function (destination, source) { return source; },
        });
    };
}
exports.patch = patch;
function join(separator) {
    return function (array) {
        return array.join(separator);
    };
}
exports.join = join;
function reduce(fn, initialValue) {
    return function (array) {
        return array.reduce(fn, initialValue);
    };
}
exports.reduce = reduce;
function map(fn) {
    return function (array) {
        return array.map(fn);
    };
}
exports.map = map;
function split(separator) {
    return function (value) {
        return value.split(separator);
    };
}
exports.split = split;
function prefix(start) {
    return function (value) {
        return start + value;
    };
}
exports.prefix = prefix;
function suffix(end) {
    return function (value) {
        return value + end;
    };
}
exports.suffix = suffix;
function surround(start, end) {
    return function_1.flow(prefix(start), suffix(end));
}
exports.surround = surround;
function replace(searchValue, replaceValue) {
    return function (value) {
        return value.replace(searchValue, replaceValue);
    };
}
exports.replace = replace;
exports.toPascalCase = function_1.flow(split("-"), map(function (token) { return token[0].toUpperCase() + token.slice(1); }), join(""));
