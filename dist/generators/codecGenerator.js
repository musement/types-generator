"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codecGenerator = void 0;
var function_1 = require("fp-ts/lib/function");
var utils_1 = require("../services/utils");
var getUnion = utils_1.doIfElse(function (values) { return values.length === 1; }, function (values) { return values[0]; }, function_1.flow(utils_1.join(','), utils_1.surround('t.union([', '])')));
var getIntersection = utils_1.doIfElse(function (values) { return values.length === 1; }, function (values) { return values[0]; }, function_1.flow(utils_1.join(','), utils_1.surround('t.intersection([', '])')));
var getKey = function_1.flow(utils_1.surround('"', '"'), utils_1.suffix(':'));
var getType = function_1.flow(utils_1.join(','), utils_1.surround('t.type({', '})'));
var getPartial = function_1.flow(utils_1.join(','), utils_1.surround('t.partial({', '})'));
var mapRequiredAndOptional = function (_a) {
    var required = _a[0], optional = _a[1];
    return [
        required.length > 0 ? getType(required) : null,
        optional.length > 0 ? getPartial(optional) : null,
    ].filter(function (value) { return value !== null; });
};
var splitRequiredAndOptional = utils_1.reduce(function (_a, _b) {
    var required = _a[0], optional = _a[1];
    var property = _b.property, isRequired = _b.isRequired;
    return isRequired
        ? [__spreadArrays(required, [property]), optional]
        : [required, __spreadArrays(optional, [property])];
}, [[], []]);
var safeSurroundEnum = function (item) {
    if (item.indexOf("'") !== -1) {
        return utils_1.surround('t.literal("', '")')(item);
    }
    return utils_1.surround("t.literal('", "')")(item);
};
exports.codecGenerator = {
    getTypeString: function (options) {
        if (options.maxLength != null || options.minLength != null) {
            if (options.pattern != null)
                return "StringPatternWithLengthC(`" + options.pattern + "`, " + options.minLength + ", " + options.maxLength + ")";
            return "StringLengthC(" + options.minLength + ", " + options.maxLength + ")";
        }
        if (options.pattern != null)
            return utils_1.surround('StringPatternC(`', '`)')(options.pattern);
        return 't.string';
    },
    getTypeNumber: function (opt) {
        if (opt.maximum == null && opt.minimum == null)
            return 't.number';
        // apply min/max
        return "MinMaxNumberC(" + opt.minimum + ", " + opt.maximum + ")";
    },
    getTypeInteger: function (opt) {
        if (opt.maximum == null && opt.minimum == null)
            return 'IntegerC';
        // apply min/max
        return "MinMaxIntC(" + opt.minimum + ", " + opt.maximum + ")";
    },
    getTypeBoolean: function () { return 't.boolean'; },
    getTypeEnum: function_1.flow(utils_1.map(safeSurroundEnum), getUnion),
    getTypeArray: function (itemType, options) {
        if (options.maxItems == null && options.minItems == null)
            return utils_1.surround('t.array(', ')')(itemType);
        return utils_1.surround('MinMaxArrayC(', ", " + options.minItems + ", " + options.maxItems + ")")(itemType);
    },
    getTypeAnyOf: getUnion,
    getTypeOneOf: getUnion,
    getTypeAllOf: getIntersection,
    getTypeObject: function_1.flow(splitRequiredAndOptional, mapRequiredAndOptional, utils_1.doIfElse(function (values) { return values.length > 0; }, getIntersection, getType)),
    getTypeReference: utils_1.toPascalCase,
    getProperty: function (key, isRequired) {
        return function_1.flow(utils_1.prefix(getKey(key)), function (property) { return ({ isRequired: isRequired, property: property }); });
    },
    getTypeUnknown: function () { return 't.unknown'; },
    addHeader: function_1.flow(
    // Note: Flow only allow max 9 functions
    // add integer
    // add min max Int
    utils_1.prefix("\n    const IntegerC = t.number.pipe(\n      new t.Type<number, number, number>(\n        'IntegerC',\n        (i: unknown): i is number =>\n          t.number.is(i) &&\n          Number.isInteger(i),\n        (i, c) => {\n          if (!t.number.is(i)) return t.failure(i, c);\n          if (!Number.isInteger(i)) return t.failure(i, c, `${i} is not an integer`);\n             \n          return t.success(i);\n        },\n        Number\n      )\n    );\n\n    function MinMaxIntC(min?: number, max?: number) {\n      return t.number.pipe(\n        new t.Type<number, number, number>(\n          'MinMaxIntC',\n          (i: unknown): i is number =>\n            t.number.is(i) &&\n            Number.isInteger(i) &&\n            (min == null || min <= i) &&\n            (max == null || max >= i),\n          (i, c) => {\n            if (!t.number.is(i)) return t.failure(i, c);\n            if (!Number.isInteger(i)) return t.failure(i, c, `${i} is not an integer`);\n            if (min != null && i < min) return t.failure(i, c, `${i} < ${min}`);\n            if (max != null && i > max) return t.failure(i, c, `${i} > ${max}`);\n    \n            return t.success(i);\n          },\n          Number\n        )\n      );\n    };\n\n    // add min max number\n    function MinMaxNumberC(min?: number, max?: number) {\n      return t.number.pipe(\n        new t.Type<number, number, number>(\n          'MinMaxNumberC',\n          (i: unknown): i is number =>\n            t.number.is(i) &&\n            (min == null || min <= i) &&\n            (max == null || max >= i),\n          (i, c) => {\n            if (!t.number.is(i)) return t.failure(i, c);\n            if (min != null && i < min)\n              return t.failure(i, c, `${i} < ${min}`);\n            if (max != null && i > max)\n              return t.failure(i, c, `${i} > ${max}`);\n    \n            return t.success(i);\n          },\n          Number\n        )\n      );\n    };\n"), 
    // add string length
    utils_1.prefix("function StringLengthC(min?: number, max?: number) {\n      return t.string.pipe(\n        new t.Type<string, string, string>(\n          'StringLengthC',\n          (i: unknown): i is string =>\n            t.string.is(i) &&\n            (min == null || min <= i.length) &&\n            (max == null || max >= i.length),\n          (i, c) => {\n            if (!t.string.is(i)) return t.failure(i, c);\n            if (min != null && i.length < min)\n              return t.failure(i, c, `${i} has length of: ${i.length} < ${min}`);\n            if (max != null && i.length > max)\n              return t.failure(i, c, `${i} has length of: ${i.length} > ${max}`);\n    \n            return t.success(i);\n          },\n          String\n        )\n      );\n    };\n\n    // add string pattern\n    function StringPatternC(pattern: string) {\n      return t.string.pipe(\n        new t.Type<string, string, string>(\n          'StringPatternC',\n          (i: unknown): i is string => t.string.is(i) && new RegExp(pattern).test(i),\n          (i, c) => {\n            if (!t.string.is(i)) return t.failure(i, c);\n            if (!new RegExp(pattern).test(i))\n              return t.failure(i, c, `${i} not in format: ${pattern}`);\n            return t.success(i);\n          },\n          String\n        )\n      );\n    };\n\n\n    function StringPatternWithLengthC(pattern: string, min?: number, max?: number) {\n      return StringPatternC(pattern).pipe(StringLengthC(min, max));\n    };\n\n    "), 
    //   // add MinMaxArrayType
    utils_1.prefix("function MinMaxArrayC<C extends t.Mixed>(a: C, min?: number, max?: number) {\n        return t.array(a).pipe(\n          new t.Type<t.TypeOf<C>[], t.TypeOf<C>[], C[]>(\n            'MinMaxArrayC',\n            (u): u is t.TypeOf<C>[] =>\n              t.array(a).is(u) &&\n              (min ?? 0) <= u.length &&\n              (max == null || u.length <= max),\n            (i, c) => {\n              if (!t.array(a).is(i)) return t.failure(i, c);\n              if (min != null && i.length < min)\n                return t.failure(\n                  i,\n                  c,\n                  `Array length should be >= : ${min}, Got: ${i.length}`\n                );\n      \n              if (max != null && i.length > max)\n                return t.failure(\n                  i,\n                  c,\n                  `Array length should be <= : ${max}, Got: ${i.length}`\n                );\n      \n              return t.success(i);\n            },\n            t.identity\n          )\n        );\n      };\n"), utils_1.prefix('\n"use strict";\nimport * as t from "io-ts";\n'), utils_1.prefix('/* eslint-disable @typescript-eslint/camelcase */\n'), utils_1.prefix('/* eslint-disable @typescript-eslint/no-use-before-define */\n'), utils_1.prefix('/* eslint-disable no-var */\n')),
    combineTypes: function_1.flow(utils_1.join(';')),
    getTypeDefinition: function (key) {
        return utils_1.surround("export const " + utils_1.toPascalCase(key) + ":t.Type<" + utils_1.toPascalCase(key) + ">=t.recursion('" + utils_1.toPascalCase(key) + "',()=>", ')');
    },
    makeTypeNullable: function (type) { return getUnion([type, 't.null']); },
};
