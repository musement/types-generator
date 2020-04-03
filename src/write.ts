import fs from "fs";
import prettier from "prettier";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

function format(types: string): string {
  return prettier.format(types);
}

function writeToFile(filename: string) {
  return function(types: string): TE.TaskEither<Error, void> {
    return async function(): Promise<E.Either<Error, void>> {
      let error = undefined;
      await fs.writeFile(filename, types, err => {
        if (err) {
          error = err;
        }
      });
      return !error ? E.right(undefined) : E.left(error);
    };
  };
}

function write(filename: string) {
  return function(types: string): TE.TaskEither<Error, void> {
    return pipe(types, format, writeToFile(filename));
  };
}

export { write };
