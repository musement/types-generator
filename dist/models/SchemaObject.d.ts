import { ReferenceObject } from "./ReferenceObject";
export interface StringProperty {
    type: "string";
    default?: string;
}
export interface EnumProperty {
    type: "string";
    enum: string[];
    default?: string;
}
export interface IntegerProperty {
    type: "integer";
    default?: number;
}
export interface NumberProperty {
    type: "number";
    default?: number;
}
export interface BooleanProperty {
    type: "boolean";
    default?: boolean;
}
export interface ArrayProperty {
    type: "array";
    items: SchemaObject | ReferenceObject;
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
