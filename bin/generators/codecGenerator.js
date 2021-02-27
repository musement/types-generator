"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var function_1 = require("fp-ts/lib/function");
var pipeable_1 = require("fp-ts/lib/pipeable");
var utils_1 = require("../services/utils");
var getUnion = utils_1.doIfElse(function (values) { return values.length === 1; }, function (values) { return values[0]; }, function_1.flow(utils_1.join(","), utils_1.surround("t.union([", "])")));
var getIntersection = utils_1.doIfElse(function (values) { return values.length === 1; }, function (values) { return values[0]; }, function_1.flow(utils_1.join(","), utils_1.surround("t.intersection([", "])")));
var getKey = function (key) {
    return pipeable_1.pipe(key, utils_1.surround('"', '"'), utils_1.suffix(":"));
};
var getType = function_1.flow(utils_1.join(","), utils_1.surround("t.type({", "})"));
var getPartial = function_1.flow(utils_1.join(","), utils_1.surround("t.partial({", "})"));
var mapRequiredAndOptional = function (_a) {
    var required = _a[0], optional = _a[1];
    return [
        required.length > 0 ? getType(required) : null,
        optional.length > 0 ? getPartial(optional) : null
    ].filter(function (value) { return value !== null; });
};
var splitRequiredAndOptional = utils_1.reduce(function (_a, _b) {
    var required = _a[0], optional = _a[1];
    var property = _b.property, isRequired = _b.isRequired;
    return isRequired
        ? [__spreadArrays(required, [property]), optional]
        : [required, __spreadArrays(optional, [property])];
}, [[], []]);
exports.codecGenerator = {
    getTypeString: function () { return "t.string"; },
    getTypeNumber: function () { return "t.number"; },
    getTypeInteger: function () { return "t.number"; },
    getTypeBoolean: function () { return "t.boolean"; },
    getTypeEnum: function_1.flow(utils_1.map(utils_1.surround("t.literal('", "')")), getUnion),
    getTypeArray: utils_1.surround("t.array(", ")"),
    getTypeAnyOf: getUnion,
    getTypeOneOf: getUnion,
    getTypeAllOf: getIntersection,
    getTypeObject: function_1.flow(splitRequiredAndOptional, mapRequiredAndOptional, utils_1.doIfElse(function (values) { return values.length > 0; }, getIntersection, getType)),
    getTypeReference: utils_1.toPascalCase,
    getProperty: function (key, isRequired) {
        return function_1.flow(utils_1.prefix(getKey(key)), function (property) { return ({ isRequired: isRequired, property: property }); });
    },
    getTypeUnknown: function () { return "t.unknown"; },
    addHeader: function_1.flow(utils_1.prefix('"use strict";import * as t from "io-ts";'), utils_1.prefix("/* eslint-disable @typescript-eslint/camelcase */"), utils_1.prefix("/* eslint-disable @typescript-eslint/no-use-before-define */"), utils_1.prefix("/* eslint-disable no-var */")),
    combineTypes: function_1.flow(utils_1.join(";")),
    getTypeDefinition: function (key) {
        return utils_1.surround("export const " + utils_1.toPascalCase(key) + ":t.Type<" + utils_1.toPascalCase(key) + ">=t.recursion('" + utils_1.toPascalCase(key) + "',()=>", ")");
    },
    makeTypeNullable: function (type) { return getUnion([type, "t.null"]); }
};
