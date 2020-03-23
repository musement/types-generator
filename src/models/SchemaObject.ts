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
  example?: string;
} & (
  | {
      type: "string";
      enum?: string[];
    }
  | {
      type: "integer";
    }
  | {
      type: "number";
    }
  | {
      type: "boolean";
    }
  | {
      type: "array";
      items: SchemaObject | ReferenceObject;
    }
  | {
      type: "";
      allOf: (SchemaObject | ReferenceObject)[];
    }
  | {
      type: "";
      oneOf: (SchemaObject | ReferenceObject)[];
    }
  | {
      type: "";
      anyOf: (SchemaObject | ReferenceObject)[];
    }
  | {
      type: "object";
      properties?: {
        [key: string]: SchemaObject | ReferenceObject;
      };
    }
);
