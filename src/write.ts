import fs from "fs";
import prettier, { BuiltInParserName, CustomParser } from "prettier";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";

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

function write(filename: string, parser?: BuiltInParserName | CustomParser) {
  return function (types: string): TE.TaskEither<Error, void> {
    return pipe(types, (t) => prettify(t, parser), writeToFile(filename));
  };
}

export { write };
