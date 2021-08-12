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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = exports.getType = exports.getDefinitions = void 0;
var E = __importStar(require("fp-ts/lib/Either"));
var A = __importStar(require("fp-ts/lib/Array"));
var pipeable_1 = require("fp-ts/lib/pipeable");
var function_1 = require("fp-ts/lib/function");
var utils_1 = require("./services/utils");
var type_guards_1 = require("./type-guards");
var type_guards_2 = require("./type-guards");
var typescriptGenerator_1 = require("./generators/typescriptGenerator");
var flowGenerator_1 = require("./generators/flowGenerator");
var codecGenerator_1 = require("./generators/codecGenerator");
var traverseArray = A.array.traverse(E.either);
function getGenerator(_a) {
    var type = _a.type;
    return {
        TypeScript: typescriptGenerator_1.typeScriptGenerator,
        Flow: flowGenerator_1.flowGenerator,
        CodecIoTs: codecGenerator_1.codecGenerator
    }[type];
}
function getDefinitions(swagger) {
    return swagger.components
        ? E.right(swagger.components.schemas)
        : E.left(new Error("There is no definition"));
}
exports.getDefinitions = getDefinitions;
function getReferenceName(options) {
    return function_1.flow(utils_1.replace("#/components/schemas/", ""), getGenerator(options).getTypeReference);
}
function isRequired(key, requiredFields) {
    return requiredFields != null && requiredFields.indexOf(key) !== -1;
}
function isNullable(property) {
    return function_1.constant(property.nullable === true);
}
function fixErrorsOnProperty(property) {
    if ("allOf" in property && "type" in property) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var _a = property, allOf = _a.allOf, otherProperties = __rest(_a, ["allOf"]);
        return {
            allOf: __spreadArrays(allOf, [__assign({}, otherProperties)])
        };
    }
    if ("oneOf" in property && "type" in property) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var _b = property, oneOf = _b.oneOf, otherProperties = __rest(_b, ["oneOf"]);
        return {
            oneOf: __spreadArrays(oneOf, [__assign({}, otherProperties)])
        };
    }
    if ("anyOf" in property && "type" in property) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var _c = property, anyOf = _c.anyOf, otherProperties = __rest(_c, ["anyOf"]);
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
            : E.right(getGenerator(options).getTypeUnknown());
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
function isValidAllOf(property) {
    return (type_guards_1.isAllOf(property) &&
        property.allOf.every(function (subprop) { return type_guards_1.isReference(subprop) || type_guards_1.isObject(subprop); }));
}
var getTypeRef = getPropertyHandler(type_guards_1.isReference, function (options) { return function (property) {
    return E.right(getReferenceName(options)(property.$ref));
}; });
var getTypeAllOf = getPropertyHandler(isValidAllOf, function (options) { return function (property) {
    return pipeable_1.pipe(traverseArray(property.allOf, getType(options)), E.map(getGenerator(options).getTypeAllOf));
}; });
var getTypeOneOf = getPropertyHandler(type_guards_1.isOneOf, function (options) { return function (property) {
    return pipeable_1.pipe(traverseArray(property.oneOf, getType(options)), E.map(getGenerator(options).getTypeOneOf));
}; });
var getTypeAnyOf = getPropertyHandler(type_guards_1.isAnyOf, function (options) { return function (property) {
    return pipeable_1.pipe(traverseArray(property.anyOf, getType(options)), E.map(getGenerator(options).getTypeAnyOf));
}; });
var getTypeArray = getPropertyHandler(type_guards_1.isArray, function (options) { return function (property) {
    return pipeable_1.pipe(property.items, getType(options), E.map(getGenerator(options).getTypeArray));
}; });
var getTypeEnum = getPropertyHandler(type_guards_1.isEnum, function (options) { return function (property) {
    return E.right(getGenerator(options).getTypeEnum(property.enum));
}; });
var getTypeInteger = getPropertyHandler(type_guards_1.isInteger, function (options) { return function () { return E.right(getGenerator(options).getTypeInteger()); }; });
var getTypeNumber = getPropertyHandler(type_guards_1.isNumber, function (options) { return function () {
    return E.right(getGenerator(options).getTypeNumber());
}; });
var getTypeString = getPropertyHandler(type_guards_2.isString, function (options) { return function () {
    return E.right(getGenerator(options).getTypeString());
}; });
var getTypeBoolean = getPropertyHandler(type_guards_1.isBoolean, function (options) { return function () { return E.right(getGenerator(options).getTypeBoolean()); }; });
var getTypeObject = getPropertyHandler(type_guards_1.isObject, function (options) { return function (property) {
    return pipeable_1.pipe(traverseArray(Object.entries(property.properties || {}), function (_a) {
        var key = _a[0], childProperty = _a[1];
        return pipeable_1.pipe(childProperty, getType(options), E.map(getGenerator(options).getProperty(key, isRequired(key, property.required))));
    }), E.map(getGenerator(options).getTypeObject));
}; });
function getType(options) {
    return function (property) {
        return pipeable_1.pipe(property, fixErrorsOnProperty, function_1.flow(getTypeRef(options), E.chain(getTypeAllOf(options)), E.chain(getTypeAnyOf(options)), E.chain(getTypeOneOf(options)), E.chain(getTypeArray(options)), E.chain(getTypeObject(options)), function_1.flow(E.chain(getTypeEnum(options)), E.chain(getTypeNumber(options)), E.chain(getTypeString(options)), E.chain(getTypeBoolean(options)), E.chain(getTypeInteger(options)))), E.fold(function_1.identity, getInvalidType(options)), E.map(utils_1.doIf(isNullable(property), getGenerator(options).makeTypeNullable)));
    };
}
exports.getType = getType;
function checkOpenApiVersion(swagger) {
    return swagger.openapi.match(/3\.0\.\d+/)
        ? E.right(swagger)
        : E.left(new Error("Version not supported: " + swagger.openapi));
}
function getTypesFromSchemas(options) {
    return function (schemas) {
        return pipeable_1.pipe(traverseArray(Object.entries(schemas), function (_a) {
            var key = _a[0], property = _a[1];
            return pipeable_1.pipe(getType(options)(property), E.map(getGenerator(options).getTypeDefinition(key)));
        }));
    };
}
var eitherPrefix = function (b) { return function (c) {
    return E.ap(c)(E.map(utils_1.prefix)(b));
}; };
function baseDefinitionsToString(options) {
    return function_1.flow(getTypesFromSchemas(options), E.map(getGenerator(options).combineTypes));
}
function definitionsToString(options) {
    return function (schemas) {
        return pipeable_1.pipe(baseDefinitionsToString(options)(schemas), utils_1.doIf(function_1.constant(options.type === "CodecIoTs"), function_1.flow(E.map(utils_1.prefix(";")), eitherPrefix(baseDefinitionsToString(__assign(__assign({}, options), { type: "TypeScript" }))(schemas)))));
    };
}
function generate(options) {
    return function_1.flow(checkOpenApiVersion, E.chain(getDefinitions), E.chain(definitionsToString(options)), E.map(getGenerator(options).addHeader));
}
exports.generate = generate;
