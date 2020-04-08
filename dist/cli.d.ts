import * as TE from "fp-ts/lib/TaskEither";
import { CliConfig } from "./models/CliConfig";
declare function cli(args: string[]): TE.TaskEither<Error, CliConfig>;
export { cli };
