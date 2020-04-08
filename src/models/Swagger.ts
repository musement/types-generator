import { SchemaObject } from "./SchemaObject";
import { ReferenceObject } from "./ReferenceObject";

export type Property = SchemaObject | ReferenceObject;
export type Schemas = { [key: string]: Property };

export type Swagger = {
  openapi: string;
  components?: { schemas: Schemas };
};
