import { Property } from "./models/Swagger";
import {
  StringProperty,
  AllOfProperty,
  OneOfProperty,
  AnyOfProperty,
  ArrayProperty,
  NumberProperty,
  BooleanProperty,
  EnumProperty,
  ObjectProperty
} from "./models/SchemaObject";
import { ReferenceObject } from "./models/ReferenceObject";

export function isReference(property: Property): property is ReferenceObject {
  return "$ref" in property;
}

export function isAllOf(property: Property): property is AllOfProperty {
  return "allOf" in property && property.allOf != null;
}

export function isOneOf(property: Property): property is OneOfProperty {
  return "oneOf" in property && property.oneOf != null;
}

export function isAnyOf(property: Property): property is AnyOfProperty {
  return "anyOf" in property && property.anyOf != null;
}

export function isArray(property: Property): property is ArrayProperty {
  return "type" in property && property.type === "array";
}

export function isEnum(property: Property): property is EnumProperty {
  return "type" in property && property.type === "string" && "enum" in property;
}

export function isString(property: Property): property is StringProperty {
  return (
    "type" in property && property.type === "string" && !("enum" in property)
  );
}

export function isBoolean(property: Property): property is BooleanProperty {
  return "type" in property && property.type === "boolean";
}

export function isNumber(property: Property): property is NumberProperty {
  return "type" in property && property.type === "number";
}

export function isInteger(property: Property): property is NumberProperty {
  return "type" in property && property.type === "integer";
}

export function isObject(property: Property): property is ObjectProperty {
  return (
    "type" in property &&
    property.type === "object" &&
    !isAllOf(property) &&
    !isOneOf(property) &&
    !isAnyOf(property)
  );
}
