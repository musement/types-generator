import * as TE from "fp-ts/lib/TaskEither";
import { CliConfig } from "./models/CliConfig";
declare const cli: (rawArgs: string[]) => TE.TaskEither<Error, CliConfig>;
export { cli };
