import { ReferenceObject } from "./ReferenceObject";

interface BaseObject {
  description?: string;
  example?: string;
}

export interface ArrayObject extends BaseObject {
  type: "array";
  items: SchemaObject | ReferenceObject;
}

export type SchemaObject = {
  description?: string;
  example?: unknown;
  nullable?: boolean;
} & (
  | {
      type: "string";
      enum?: string[];
      default?: string;
    }
  | {
      type: "integer";
      default?: number;
    }
  | {
      type: "number";
      default?: number;
    }
  | {
      type: "boolean";
      default?: boolean;
    }
  | {
      type: "array";
      items: SchemaObject | ReferenceObject;
    }
  | {
      type: "object";
      properties?: {
        [key: string]: SchemaObject | ReferenceObject;
      };
      required?: string[];
    }
  | {
      allOf: (SchemaObject | ReferenceObject)[];
    }
  | {
      oneOf: (SchemaObject | ReferenceObject)[];
    }
  | {
      anyOf: (SchemaObject | ReferenceObject)[];
    }
);
