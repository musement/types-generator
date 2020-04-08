import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { Swagger, Schemas } from "./models/Swagger";
export declare function getSwagger(patchSource?: E.Either<string, Partial<Schemas>>): (source: string) => TE.TaskEither<Error, Swagger>;
