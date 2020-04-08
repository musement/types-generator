import { Swagger, Property } from "./models/Swagger";
import * as E from "fp-ts/lib/Either";
import { Options } from "./models/Options";
import { AllOfProperty } from "./models/SchemaObject";
declare function getDefinitions(swagger: Swagger): E.Either<Error, {
    [key: string]: Property;
}>;
declare function getType(options: Options): (property: import("./models/ReferenceObject").ReferenceObject | ({
    description?: string | undefined;
    example?: unknown;
    nullable?: boolean | undefined;
} & import("./models/SchemaObject").StringProperty) | ({
    description?: string | undefined;
    example?: unknown;
    nullable?: boolean | undefined;
} & import("./models/SchemaObject").EnumProperty) | ({
    description?: string | undefined;
    example?: unknown;
    nullable?: boolean | undefined;
} & import("./models/SchemaObject").IntegerProperty) | ({
    description?: string | undefined;
    example?: unknown;
    nullable?: boolean | undefined;
} & import("./models/SchemaObject").NumberProperty) | ({
    description?: string | undefined;
    example?: unknown;
    nullable?: boolean | undefined;
} & import("./models/SchemaObject").BooleanProperty) | ({
    description?: string | undefined;
    example?: unknown;
    nullable?: boolean | undefined;
} & import("./models/SchemaObject").ArrayProperty) | ({
    description?: string | undefined;
    example?: unknown;
    nullable?: boolean | undefined;
} & import("./models/SchemaObject").ObjectProperty) | ({
    description?: string | undefined;
    example?: unknown;
    nullable?: boolean | undefined;
} & AllOfProperty) | ({
    description?: string | undefined;
    example?: unknown;
    nullable?: boolean | undefined;
} & import("./models/SchemaObject").OneOfProperty) | ({
    description?: string | undefined;
    example?: unknown;
    nullable?: boolean | undefined;
} & import("./models/SchemaObject").AnyOfProperty)) => E.Either<Error, string>;
declare function generate(options: Options): (swagger: Swagger) => E.Either<Error, string>;
export { getDefinitions, getType, generate };
