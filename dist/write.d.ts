import { BuiltInParserName, CustomParser } from "prettier";
import * as TE from "fp-ts/lib/TaskEither";
declare function write(filename: string, parser?: BuiltInParserName | CustomParser): (types: string) => TE.TaskEither<Error, void>;
export { write };
