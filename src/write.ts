import fs from "fs";
import prettier, { BuiltInParserName, CustomParser } from "prettier";
import * as TE from "fp-ts/lib/TaskEither";
import { flow } from "fp-ts/lib/function";

function prettify(
  types: string,
  parser?: BuiltInParserName | CustomParser
): string {
  return prettier.format(types, { parser: parser });
}

function writeToFile(filename: string) {
  return function (types: string): TE.TaskEither<Error, void> {
    return TE.taskify<string, string, Error, void>(fs.writeFile)(
      filename,
      types
    );
  };
}

function write(
  filename: string,
  parser?: BuiltInParserName | CustomParser
): (types: string) => TE.TaskEither<Error, void> {
  return flow((types) => prettify(types, parser), writeToFile(filename));
}
export { write };
