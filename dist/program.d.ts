import * as TE from "fp-ts/lib/TaskEither";
import { CliConfig } from "./models/CliConfig";
export declare function program({ source, destination, exitOnInvalidType, type, patchSource }: CliConfig): TE.TaskEither<Error, void>;
