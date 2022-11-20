/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from "axios";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import * as IE from "fp-ts/lib/IOEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Swagger, Schemas } from "./models/Swagger";
import { doIf, patch, doIfElse } from "./services/utils";
import { constant } from "fp-ts/lib/function";

function isUrl(pathOrUrl: string): boolean {
  return pathOrUrl.indexOf("https://") !== -1;
}

function getContentFromURL<T>(url: string): TE.TaskEither<Error, T> {
  return TE.tryCatch<Error, T>(
    () =>
      axios({ method: "get", url }).then(({ data }) =>
        typeof data === "object" ? data : yaml.safeLoad(data)
      ),
    (error) => error as Error
  );
}

function getContentFromPath<T>(file: string): IE.IOEither<Error, T> {
  return IE.tryCatch(
    () => {
      const ext = path.extname(file);
      const content = fs.readFileSync(file, "utf8");
      const swagger =
        ext === ".yaml" || ext === ".yml"
          ? (yaml.safeLoad(content) as unknown as T)
          : (JSON.parse(content) as T);
      return swagger;
    },
    (error) => error as Error
  );
}

function getContent<T>(source: string): TE.TaskEither<Error, T> {
  return pipe(
    source,
    doIfElse(
      isUrl,
      (source) => getContentFromURL<T>(source),
      (source) => TE.fromIOEither(getContentFromPath<T>(source))
    )
  );
}

function patchSwagger(patchSource: E.Either<string, Partial<Schemas>>) {
  return function (swagger: Swagger): TE.TaskEither<Error, Swagger> {
    return pipe(
      patchSource,
      E.fold((source) => getContent<Partial<Swagger>>(source), TE.right),
      TE.map(patch(swagger))
    );
  };
}

export function getSwagger(patchSource?: E.Either<string, Partial<Schemas>>) {
  return function (source: string): TE.TaskEither<Error, Swagger> {
    return pipe(
      source,
      (source) => getContent<Swagger>(source),
      doIf(constant(patchSource != null), TE.chain(patchSwagger(patchSource!)))
    );
  };
}
