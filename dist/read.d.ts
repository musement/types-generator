import * as TE from "fp-ts/lib/TaskEither";
import { Swagger } from "./models/Swagger";
export declare function getSwagger(patchSource?: string): (source: string) => TE.TaskEither<Error, Swagger>;
