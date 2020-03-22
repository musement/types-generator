import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import { pipe } from "fp-ts/lib/pipeable";
import { getContent } from "./dowload";
import { generate } from "./generate";
import { write } from "./write";

const flatGenerate = T.map(E.chain(generate));

const flatWrite = (destination: string) => (
  eitherString: T.Task<E.Either<Error, string>>
): T.Task<E.Either<Error, void>> =>
  pipe(
    eitherString,
    T.chain(eitherString =>
      E.either.traverse(T.task)(eitherString, write(destination))
    ),
    s => s,
    T.map(E.flatten)
  );

export function program(
  swaggerUrl: string,
  destination: string
): T.Task<E.Either<Error, void>> {
  return pipe(swaggerUrl, getContent, flatGenerate, flatWrite(destination));
}
