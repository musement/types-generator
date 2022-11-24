import { ReferenceObject } from "./ReferenceObject";
export interface StringProperty {
    type: "string";
    minLength?: number;
    maxLength?: number;
    format?: string;
    pattern?: string;
    default?: string;
}
export interface EnumProperty {
    type: "string";
    enum: string[];
    default?: string;
}
export interface IntegerProperty {
    type: "integer";
    minimum?: number;
    maximum?: number;
    default?: number;
}
export interface NumberProperty {
    type: "number";
    minimum?: number;
    maximum?: number;
    default?: number;
}
export interface BooleanProperty {
    type: "boolean";
    default?: boolean;
}
export interface ArrayProperty {
    type: "array";
    items: SchemaObject | ReferenceObject;
    minItems?: number;
    maxItems?: number;
}
export interface ObjectProperty {
    type: "object";
    properties?: {
        [key: string]: SchemaObject | ReferenceObject;
    };
    required?: string[];
}
export interface AllOfProperty {
    allOf: (SchemaObject | ReferenceObject)[];
}
export interface OneOfProperty {
    oneOf: (SchemaObject | ReferenceObject)[];
}
export interface AnyOfProperty {
    anyOf: (SchemaObject | ReferenceObject)[];
}
export declare type SchemaObject = {
    description?: string;
    example?: unknown;
    nullable?: boolean;
} & (EnumProperty | StringProperty | IntegerProperty | NumberProperty | BooleanProperty | ArrayProperty | ObjectProperty | AllOfProperty | OneOfProperty | AnyOfProperty);
