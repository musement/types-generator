import * as TE from "fp-ts/lib/TaskEither";
import { ProgramConfig } from "./models/ProgramConfig";
export declare function program({ source, destination, exitOnInvalidType, type, patchSource, parser, }: ProgramConfig): TE.TaskEither<Error, void>;
