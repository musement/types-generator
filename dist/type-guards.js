"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isReference(property) {
    return "$ref" in property;
}
exports.isReference = isReference;
function isAllOf(property) {
    return "allOf" in property && property.allOf != null;
}
exports.isAllOf = isAllOf;
function isOneOf(property) {
    return "oneOf" in property && property.oneOf != null;
}
exports.isOneOf = isOneOf;
function isAnyOf(property) {
    return "anyOf" in property && property.anyOf != null;
}
exports.isAnyOf = isAnyOf;
function isArray(property) {
    return "type" in property && property.type === "array";
}
exports.isArray = isArray;
function isEnum(property) {
    return "type" in property && property.type === "string" && "enum" in property;
}
exports.isEnum = isEnum;
function isString(property) {
    return ("type" in property && property.type === "string" && !("enum" in property));
}
exports.isString = isString;
function isBoolean(property) {
    return "type" in property && property.type === "boolean";
}
exports.isBoolean = isBoolean;
function isNumber(property) {
    return "type" in property && property.type === "number";
}
exports.isNumber = isNumber;
function isInteger(property) {
    return "type" in property && property.type === "integer";
}
exports.isInteger = isInteger;
function isObject(property) {
    return ("type" in property &&
        property.type === "object" &&
        !isAllOf(property) &&
        !isOneOf(property) &&
        !isAnyOf(property));
}
exports.isObject = isObject;
