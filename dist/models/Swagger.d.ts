import { SchemaObject } from "./SchemaObject";
import { ReferenceObject } from "./ReferenceObject";
export declare type Swagger = {
    openapi: string;
    components?: {
        schemas: {
            [key: string]: SchemaObject | ReferenceObject;
        };
    };
};
export declare type Property = SchemaObject | ReferenceObject;
