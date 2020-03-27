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
function sanitizeKey(key) {
    return key
        .split("-")
        .map(function (token) { return token[0].toUpperCase() + token.slice(1); })
        .join("");
}
function getReferenceName(reference) {
    return pipeable_1.pipe(reference.replace("#/components/schemas/", ""), sanitizeKey);
}
function combineKeyAndProperty(key, property, separator, options) {
    return pipeable_1.pipe(getType(options)(property), E.map(function (type) { return "" + key + separator + type; }));
}
function getTypesFromProperties(options) {
    return function (properties) {
        return pipeable_1.pipe(A.array.traverse(E.either)(Object.entries(properties), function (_a) {
            var key = _a[0], property = _a[1];
            return combineKeyAndProperty(key, property, ":", options);
        }));
    };
}
function getTypeUnknown(options) {
    return options.type === "TypeScript" ? "unknown" : "mixed";
}
function getExactObject(options) {
    return function (properties) {
        return options.type === "TypeScript"
            ? "{" + properties.join(",") + "}"
            : "{|" + properties.join(",") + "|}";
    };
}
function getType(options) {
    return function (property) {
        if ("$ref" in property) {
            return E.right(getReferenceName(property.$ref));
        }
        if (property.type === "array") {
            return pipeable_1.pipe(property.items, getType(options), E.map(function (type) { return "Array<" + type + ">"; }));
        }
        if (property.type === "string" && property.enum) {
            return E.right(property.enum.map(function (enumValue) { return "'" + enumValue + "'"; }).join(" | "));
        }
        if ("allOf" in property && property.allOf) {
            return pipeable_1.pipe(A.array.traverse(E.either)(property.allOf, getType(options)), E.map(function (types) { return types.join(" & "); }));
        }
        if ("anyOf" in property && property.anyOf) {
            return pipeable_1.pipe(A.array.traverse(E.either)(property.anyOf, getType(options)), E.map(function (types) { return types.join(" | "); }));
        }
        if ("oneOf" in property && property.oneOf) {
            return pipeable_1.pipe(A.array.traverse(E.either)(property.oneOf, getType(options)), E.map(function (types) { return types.join(" | "); }));
        }
        if (["boolean", "number", "null", "string"].indexOf(property.type) !== -1) {
            return E.right(property.type);
        }
        if (property.type === "integer") {
            return E.right("number");
        }
        if (property.type === "object" && property.properties) {
            return pipeable_1.pipe(property.properties, getTypesFromProperties(options), E.map(getExactObject(options)));
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
            return combineKeyAndProperty(sanitizeKey(key), property, "=", options);
        }));
    };
}
function generate(options) {
    return function (swagger) {
        return pipeable_1.pipe(swagger, getDefinitions, E.chain(getTypesFromSchemas(options)), E.map(function (properties) {
            return properties.map(function (prop) { return "export type " + prop; }).join(";");
        }));
    };
}
exports.generate = generate;
