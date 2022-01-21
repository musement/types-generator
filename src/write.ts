import fs from "fs";
import prettier from "prettier";
import * as TE from "fp-ts/lib/TaskEither";
import { flow } from "fp-ts/lib/function";

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

function write(
  filename: string
): (types: string) => TE.TaskEither<Error, void> {
  return flow(prettify, writeToFile(filename));
}
export { write };
