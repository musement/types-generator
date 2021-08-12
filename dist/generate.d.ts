import { Swagger, Property } from "./models/Swagger";
import * as E from "fp-ts/lib/Either";
import { Options } from "./models/Options";
declare type TypeResult = E.Either<Error, string>;
declare function getDefinitions(swagger: Swagger): E.Either<Error, {
    [key: string]: Property;
}>;
declare function getType(options: Options): (property: Property) => TypeResult;
declare function generate(options: Options): (swagger: Swagger) => E.Either<Error, string>;
export { getDefinitions, getType, generate };
