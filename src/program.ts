import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { getSwagger } from "./read";
import { generate } from "./generate";
import { write } from "./write";
import { Options } from "./models/Options";

export function program(
  swaggerUrl: string,
  destination: string,
  options: Options,
  patchSource?: string
): TE.TaskEither<Error, void> {
  return pipe(
    swaggerUrl,
    getSwagger(patchSource),
    TE.chainEitherK(generate(options)),
    TE.chain(write(destination))
  );
}
