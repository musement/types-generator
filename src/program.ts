import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import { pipe } from "fp-ts/lib/pipeable";
import { getContent } from "./read";
import { generate } from "./generate";
import { write } from "./write";
import { Options } from "./models/Options";
import { Swagger } from "./models/Swagger";

function flatGenerate(
  options: Options
): (fa: T.Task<E.Either<Error, Swagger>>) => T.Task<E.Either<Error, string>> {
  return T.map(E.chain(generate(options)));
}

function flatWrite(destination: string) {
  return function(
    eitherString: T.Task<E.Either<Error, string>>
  ): T.Task<E.Either<Error, void>> {
    return pipe(
      eitherString,
      T.chain(eitherString =>
        E.either.traverse(T.task)(eitherString, write(destination))
      ),
      T.map(E.flatten)
    );
  };
}

export function program(
  swaggerUrl: string,
  destination: string,
  options: Options
): T.Task<E.Either<Error, void>> {
  return pipe(
    swaggerUrl,
    getContent,
    flatGenerate(options),
    flatWrite(destination)
  );
}
