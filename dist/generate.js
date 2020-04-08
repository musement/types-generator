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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var E = __importStar(require("fp-ts/lib/Either"));
var A = __importStar(require("fp-ts/lib/Array"));
var pipeable_1 = require("fp-ts/lib/pipeable");
var function_1 = require("fp-ts/lib/function");
var utils_1 = require("./utils");
var type_guards_1 = require("./type-guards");
var type_guards_2 = require("./type-guards");
var traverseArray = A.array.traverse(E.either);
function getDefinitions(swagger) {
    return swagger.components
        ? E.right(swagger.components.schemas)
        : E.left(new Error("There is no definition"));
}
exports.getDefinitions = getDefinitions;
var getReferenceName = function_1.flow(utils_1.replace("#/components/schemas/", ""), utils_1.toCamelCase);
function getExactObject(options) {
    return function_1.flow(utils_1.join(","), options.type === "TypeScript" ? utils_1.surround("{", "}") : utils_1.surround("{|", "|}"));
}
function concatKeyAndType(key, isRequired) {
    return utils_1.prefix("" + key + (isRequired ? "" : "?") + ":");
}
function isRequired(key, requiredFields) {
    return requiredFields != null && requiredFields.indexOf(key) !== -1;
}
function getTypeUnknown(options) {
    return options.type === "TypeScript" ? "unknown" : "mixed";
}
function isNullable(property) {
    return function_1.constant(property.nullable === true);
}
var makeTypeNullable = function_1.flow(utils_1.suffix("|null"), utils_1.surround("(", ")"));
function fixErrorsOnProperty(property) {
    if ("allOf" in property && "type" in property) {
        var allOf = property.allOf, otherProperties = __rest(property, ["allOf"]);
        return {
            allOf: __spreadArrays(allOf, [__assign({}, otherProperties)])
        };
    }
    if ("oneOf" in property && "type" in property) {
        var oneOf = property.oneOf, otherProperties = __rest(property, ["oneOf"]);
        return {
            oneOf: __spreadArrays(oneOf, [__assign({}, otherProperties)])
        };
    }
    if ("anyOf" in property && "type" in property) {
        var anyOf = property.anyOf, otherProperties = __rest(property, ["anyOf"]);
        return {
            anyOf: __spreadArrays(anyOf, [__assign({}, otherProperties)])
        };
    }
    return property;
}
function getInvalidType(options) {
    return function (property) {
        return options.exitOnInvalidType
            ? E.left(new Error("Invalid type: " + JSON.stringify(property)))
            : E.right(getTypeUnknown(options));
    };
}
function getPropertyHandler(isT, handleT) {
    return function (options) {
        return function (property) {
            return isT(property)
                ? E.left(handleT(options)(property))
                : E.right(property);
        };
    };
}
var combineAllOfForTypeScript = utils_1.join("&");
var combineAllOfForFlow = function_1.flow(utils_1.map(utils_1.prefix("...")), utils_1.join(","), utils_1.surround("{|", "|}"));
function combineAllOf(options) {
    return options.type === "TypeScript"
        ? combineAllOfForTypeScript
        : combineAllOfForFlow;
}
function isValidAllOf(property) {
    return (type_guards_1.isAllOf(property) &&
        property.allOf.every(function (subprop) { return type_guards_1.isReference(subprop) || type_guards_1.isObject(subprop); }));
}
var getTypeRef = getPropertyHandler(type_guards_1.isReference, function () { return function (property) { return E.right(getReferenceName(property.$ref)); }; });
var getTypeAllOf = getPropertyHandler(isValidAllOf, function (options) { return function (property) {
    return pipeable_1.pipe(traverseArray(property.allOf, getType(options)), E.map(combineAllOf(options)));
}; });
var getTypeOneOf = getPropertyHandler(type_guards_1.isOneOf, function (options) { return function (property) {
    return pipeable_1.pipe(traverseArray(property.oneOf, getType(options)), E.map(utils_1.join("|")));
}; });
var getTypeAnyOf = getPropertyHandler(type_guards_1.isAnyOf, function (options) { return function (property) {
    return pipeable_1.pipe(traverseArray(property.anyOf, getType(options)), E.map(utils_1.join("|")));
}; });
var getTypeArray = getPropertyHandler(type_guards_1.isArray, function (options) { return function (property) {
    return pipeable_1.pipe(property.items, getType(options), E.map(utils_1.surround("Array<", ">")));
}; });
var getTypeEnum = getPropertyHandler(type_guards_1.isEnum, function () { return function (property) {
    return E.right(pipeable_1.pipe(property.enum, utils_1.map(utils_1.surround("'", "'")), utils_1.join("|")));
}; });
var getTypeInteger = getPropertyHandler(type_guards_1.isInteger, function () { return function () {
    return E.right("number");
}; });
var getTypeNumber = getPropertyHandler(type_guards_1.isNumber, function () { return function () {
    return E.right("number");
}; });
var getTypeString = getPropertyHandler(type_guards_2.isString, function () { return function () {
    return E.right("string");
}; });
var getTypeBoolean = getPropertyHandler(type_guards_1.isBoolean, function () { return function () {
    return E.right("boolean");
}; });
var getTypeObject = getPropertyHandler(type_guards_1.isObject, function (options) { return function (property) {
    return pipeable_1.pipe(traverseArray(Object.entries(property.properties || {}), function (_a) {
        var key = _a[0], childProperty = _a[1];
        return pipeable_1.pipe(childProperty, getType(options), E.map(concatKeyAndType(key, isRequired(key, property.required))));
    }), E.map(getExactObject(options)));
}; });
function getType(options) {
    return function (property) {
        return pipeable_1.pipe(property, fixErrorsOnProperty, function_1.flow(getTypeRef(options), E.chain(getTypeAllOf(options)), E.chain(getTypeAnyOf(options)), E.chain(getTypeOneOf(options)), E.chain(getTypeArray(options)), E.chain(getTypeObject(options)), function_1.flow(E.chain(getTypeEnum(options)), E.chain(getTypeNumber(options)), E.chain(getTypeString(options)), E.chain(getTypeBoolean(options)), E.chain(getTypeInteger(options)))), E.fold(function_1.identity, getInvalidType(options)), E.map(utils_1.doIf(isNullable(property), makeTypeNullable)));
    };
}
exports.getType = getType;
function getTypesFromSchemas(options) {
    return function (schemas) {
        return pipeable_1.pipe(traverseArray(Object.entries(schemas), function (_a) {
            var key = _a[0], property = _a[1];
            return pipeable_1.pipe(getType(options)(property), E.map(utils_1.prefix(utils_1.toCamelCase(key) + "=")));
        }));
    };
}
function checkOpenApiVersion(swagger) {
    return swagger.openapi.match(/3\.0\.\d+/)
        ? E.right(swagger)
        : E.left(new Error("Version not supported: " + swagger.openapi));
}
function addHeader(options) {
    return function_1.flow(utils_1.prefix("\n"), utils_1.prefix(options.type === "TypeScript" ? '"use strict";' : "// @flow strict"));
}
function generate(options) {
    return function (swagger) {
        return pipeable_1.pipe(swagger, checkOpenApiVersion, E.chain(getDefinitions), E.chain(getTypesFromSchemas(options)), E.map(function_1.flow(utils_1.map(utils_1.prefix("export type ")), utils_1.join(";"))), E.map(addHeader(options)));
    };
}
exports.generate = generate;
