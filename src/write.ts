import fs from "fs";
import prettier from "prettier";
import { Task } from "fp-ts/lib/Task";
import { Either, right, left } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

function format(types: string): string {
  return prettier.format(types);
}

function writeToFile(filename: string) {
  return function(types: string): Task<Either<Error, void>> {
    return async function(): Promise<Either<Error, void>> {
      let error = undefined;
      await fs.writeFile(filename, types, err => {
        if (err) {
          error = err;
        }
      });
      return !error ? right(undefined) : left(error);
    };
  };
}

function write(filename: string) {
  return function(types: string): Task<Either<Error, void>> {
    return pipe(types, format, writeToFile(filename));
  };
}

export { write };
