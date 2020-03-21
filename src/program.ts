import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import { pipe } from "fp-ts/lib/pipeable";
import { getContent } from "./dowload";
import { generate } from "./generate";
import { write } from "./write"; // string => Task<Either<Error, void>>

function flatten(
  taskEither: T.Task<E.Either<Error, T.Task<E.Either<Error, void>>>>
): T.Task<E.Either<Error, void>> {
  return pipe(
    taskEither,
    T.map(
      E.fold(
        error => T.of(E.left(error)),
        task => task
      )
    ), // Task<Task<E.Either<Error, void>>>
    T.flatten
  );
}

export function program(
  swaggerUrl: string,
  destination: string
): T.Task<E.Either<Error, void>> {
  return pipe(
    swaggerUrl,
    getContent, // Task<Either<Error, Swagger>>
    T.map(E.chain(generate)), // Task<Either<Error, string>>
    T.map(E.map(write(destination))), // T.Task<E.Either<Error, T.Task<E.Either<Error, void>>>>
    flatten
  );
}
