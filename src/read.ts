/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from "axios";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import * as IE from "fp-ts/lib/IOEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { Swagger } from "./models/Swagger";
import { doIf, patch } from "./utils";
import { identity } from "fp-ts/lib/function";

function isUrl(pathOrUrl: string): boolean {
  return pathOrUrl.indexOf("https://") !== -1;
}

function getContentFromURL<T>(url: string): TE.TaskEither<Error, T> {
  return (): Promise<E.Either<Error, T>> =>
    axios({
      method: "get",
      url
    })
      .then(({ data }) =>
        E.right(typeof data === "object" ? data : yaml.safeLoad(data))
      )
      .catch(error => E.left(error));
}

function getContentFromPath<T>(file: string): IE.IOEither<Error, T> {
  return (): E.Either<Error, T> => {
    try {
      const ext = path.extname(file);
      const content = fs.readFileSync(file, "utf8");
      const swagger =
        ext === ".yaml" || ext === ".yml"
          ? (yaml.safeLoad(content) as T)
          : (JSON.parse(content) as T);
      return E.right(swagger);
    } catch (error) {
      return E.left(error);
    }
  };
}

function getContent<T>(source: string): TE.TaskEither<Error, T> {
  return pipe(
    source,
    doIf(
      isUrl,
      source => getContentFromURL<T>(source),
      source => TE.fromIOEither(getContentFromPath<T>(source))
    )
  );
}

function patchSwagger(patchSource: string) {
  return function(swagger: Swagger): TE.TaskEither<Error, Swagger> {
    return pipe(
      patchSource,
      source => getContent<Partial<Swagger>>(source),
      TE.map(patch(swagger))
    );
  };
}

export function getSwagger(patchSource?: string) {
  return function(source: string): TE.TaskEither<Error, Swagger> {
    return pipe(
      source,
      source => getContent<Swagger>(source),
      doIf(
        () => patchSource != null,
        TE.chain(patchSwagger(patchSource!)),
        identity
      )
    );
  };
}
