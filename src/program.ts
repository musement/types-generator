import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { getSwagger } from "./read";
import { generate } from "./generate";
import { write } from "./write";
import { ProgramConfig } from "./models/ProgramConfig";
import { Schemas } from "./models/Swagger";

function sourceToEither(
  source: string | Partial<Schemas> | undefined
): E.Either<string, Partial<Schemas>> | undefined {
  if (source == undefined) {
    return undefined;
  }
  return typeof source === "string" ? E.left(source) : E.right(source);
}

export function program({
  source,
  destination,
  exitOnInvalidType,
  type,
  patchSource
}: ProgramConfig): TE.TaskEither<Error, void> {
  return pipe(
    source,
    getSwagger(sourceToEither(patchSource)),
    TE.chainEitherK(generate({ exitOnInvalidType, type })),
    TE.chain(write(destination))
  );
}
