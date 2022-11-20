import { ReferenceObject } from "./ReferenceObject";

export interface StringProperty {
  type: "string";
  minLength?: number;
  maxLength?: number;
  // currently support (date, date-time, password, byte, binary)
  format?: string; // not validate now
  pattern?: string; // regex pattern (case-sentive)
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

export type SchemaObject = {
  description?: string;
  example?: unknown;
  nullable?: boolean;
} & (
  | EnumProperty
  | StringProperty
  | IntegerProperty
  | NumberProperty
  | BooleanProperty
  | ArrayProperty
  | ObjectProperty
  | AllOfProperty
  | OneOfProperty
  | AnyOfProperty
);
