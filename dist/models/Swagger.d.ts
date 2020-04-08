import { SchemaObject } from "./SchemaObject";
import { ReferenceObject } from "./ReferenceObject";
export declare type Property = SchemaObject | ReferenceObject;
export declare type Schemas = {
    [key: string]: Property;
};
export declare type Swagger = {
    openapi: string;
    components?: {
        schemas: Schemas;
    };
};
