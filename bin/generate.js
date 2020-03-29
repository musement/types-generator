"use strict";
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
function getDefinitions(swagger) {
    return swagger.components
        ? E.right(swagger.components.schemas)
        : E.left(new Error("There is no definition"));
}
exports.getDefinitions = getDefinitions;
function toCamelCase(key) {
    return key
        .split("-")
        .map(function (token) { return token[0].toUpperCase() + token.slice(1); })
        .join("");
}
function getReferenceName(reference) {
    return pipeable_1.pipe(reference.replace("#/components/schemas/", ""), toCamelCase);
}
function getExactObject(options) {
    return function (properties) {
        return options.type === "TypeScript"
            ? "{" + properties.join(",") + "}"
            : "{|" + properties.join(",") + "|}";
    };
}
function concatKeyAndType(key, isRequired) {
    return function concatType(type) {
        return "" + key + (isRequired ? "" : "?") + ":" + type;
    };
}
function isRequired(key, requiredFields) {
    return requiredFields != null && requiredFields.indexOf(key) !== -1;
}
function getTypeObject(options) {
    return function (_a) {
        var properties = _a.properties, required = _a.required;
        return pipeable_1.pipe(A.array.traverse(E.either)(Object.entries(properties), function (_a) {
            var key = _a[0], property = _a[1];
            return pipeable_1.pipe(property, getType(options), E.map(concatKeyAndType(key, isRequired(key, required))));
        }), E.map(getExactObject(options)));
    };
}
function getTypeUnknown(options) {
    return options.type === "TypeScript" ? "unknown" : "mixed";
}
function getTypeNullable(property) {
    return function (type) {
        return property.nullable ? "(" + type + "|null)" : type;
    };
}
function getType(options) {
    return function (property) {
        if ("$ref" in property) {
            return E.right(pipeable_1.pipe(getReferenceName(property.$ref), getTypeNullable(property)));
        }
        if (property.type === "array") {
            return pipeable_1.pipe(property.items, getType(options), E.map(function (type) { return "Array<" + type + ">"; }), E.map(getTypeNullable(property)));
        }
        if (property.type === "string" && property.enum) {
            return E.right(pipeable_1.pipe(property.enum.map(function (enumValue) { return "'" + enumValue + "'"; }).join("|"), getTypeNullable(property)));
        }
        if ("allOf" in property && property.allOf) {
            return pipeable_1.pipe(A.array.traverse(E.either)(property.allOf, getType(options)), E.map(function (types) { return types.join("&"); }), E.map(getTypeNullable(property)));
        }
        if ("anyOf" in property && property.anyOf) {
            return pipeable_1.pipe(A.array.traverse(E.either)(property.anyOf, getType(options)), E.map(function (types) { return types.join("|"); }), E.map(getTypeNullable(property)));
        }
        if ("oneOf" in property && property.oneOf) {
            return pipeable_1.pipe(A.array.traverse(E.either)(property.oneOf, getType(options)), E.map(function (types) { return types.join("|"); }), E.map(getTypeNullable(property)));
        }
        if (["boolean", "number", "null", "string"].indexOf(property.type) !== -1) {
            return E.right(pipeable_1.pipe(property.type, getTypeNullable(property)));
        }
        if (property.type === "integer") {
            return E.right(pipeable_1.pipe("number", getTypeNullable(property)));
        }
        if (property.type === "object" && property.properties) {
            var properties = property.properties, required = property.required;
            return pipeable_1.pipe({ properties: properties, required: required }, getTypeObject(options), E.map(getTypeNullable(property)));
        }
        return options.exitOnInvalidType
            ? E.left(new Error("Invalid type: " + JSON.stringify(property)))
            : E.right(getTypeUnknown(options));
    };
}
exports.getType = getType;
function getTypesFromSchemas(options) {
    return function (schemas) {
        return pipeable_1.pipe(A.array.traverse(E.either)(Object.entries(schemas), function (_a) {
            var key = _a[0], property = _a[1];
            return pipeable_1.pipe(getType(options)(property), E.map(function (type) { return toCamelCase(key) + "=" + type; }));
        }));
    };
}
function checkOpenApiVersion(swagger) {
    return swagger.openapi.match(/3\.0\.\d+/)
        ? E.right(swagger)
        : E.left(new Error("Version not supported: " + swagger.openapi));
}
function generate(options) {
    return function (swagger) {
        return pipeable_1.pipe(swagger, checkOpenApiVersion, E.chain(getDefinitions), E.chain(getTypesFromSchemas(options)), E.map(function (properties) {
            return properties.map(function (prop) { return "export type " + prop; }).join(";");
        }));
    };
}
exports.generate = generate;
