#!/usr/bin/env node

import * as TE from "fp-ts/lib/TaskEither";
import * as T from "fp-ts/lib/Task";
import { cli } from "./cli";
import { program } from "./program";
import { flow } from "fp-ts/lib/function";

const exec = flow(
  cli,
  TE.chain(program),
  TE.fold(
    (error) => T.of(console.error(error)),
    () => T.of(console.log("success"))
  )
);

exec(process.argv)();
