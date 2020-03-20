import { SchemaObject } from "./SchemaObject";
import { ReferenceObject } from "./ReferenceObject";

export type Swagger = {
  openapi: string;
  components?: {
    schemas: { [key: string]: SchemaObject | ReferenceObject };
  };
};
