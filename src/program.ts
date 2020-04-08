import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { getSwagger } from "./read";
import { generate } from "./generate";
import { write } from "./write";
import { CliConfig } from "./models/CliConfig";

export function program({
  source,
  destination,
  exitOnInvalidType,
  type,
  patchSource
}: CliConfig): TE.TaskEither<Error, void> {
  return pipe(
    source,
    getSwagger(patchSource),
    TE.chainEitherK(generate({ exitOnInvalidType, type })),
    TE.chain(write(destination))
  );
}
