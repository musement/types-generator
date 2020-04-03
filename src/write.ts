import fs from "fs";
import prettier from "prettier";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";

function prettify(types: string): string {
  return prettier.format(types);
}

function writeToFile(filename: string) {
  return function(types: string): TE.TaskEither<Error, void> {
    return TE.taskify<string, string, Error, void>(fs.writeFile)(
      filename,
      types
    );
  };
}

function write(filename: string) {
  return function(types: string): TE.TaskEither<Error, void> {
    return pipe(types, prettify, writeToFile(filename));
  };
}

export { write };
