import axios from "axios";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { Swagger } from "./models/Swagger";
import * as T from "fp-ts/lib/Task";
import * as I from "fp-ts/lib/IO";
import * as E from "fp-ts/lib/Either";

function isUrl(pathOrUrl: string): boolean {
  return pathOrUrl.indexOf("https://") !== -1;
}

function getContentFromURL(url: string): T.Task<E.Either<Error, Swagger>> {
  return (): Promise<E.Either<Error, Swagger>> =>
    axios({
      method: "get",
      url
    })
      .then(({ data }) =>
        E.right(typeof data === "object" ? data : yaml.safeLoad(data))
      )
      .catch(error => E.left(error));
}

function getContentFromPath(file: string): I.IO<E.Either<Error, Swagger>> {
  return (): E.Either<Error, Swagger> => {
    try {
      const ext = path.extname(file);
      const content = fs.readFileSync(file, "utf8");
      const swagger =
        ext === ".yaml" || ext === ".yml"
          ? (yaml.safeLoad(content) as Swagger)
          : (JSON.parse(content) as Swagger);
      return E.right(swagger);
    } catch (error) {
      return E.left(error);
    }
  };
}

export function getContent(source: string): T.Task<E.Either<Error, Swagger>> {
  return isUrl(source)
    ? getContentFromURL(source)
    : T.fromIO(getContentFromPath(source));
}
