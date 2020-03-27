import axios from "axios";
import yaml from "js-yaml";
import { Swagger } from "./models/Swagger";
import { Task } from "fp-ts/lib/Task";
import { Either, left, right } from "fp-ts/lib/Either";

export function getContent(url: string): Task<Either<Error, Swagger>> {
  return (): Promise<Either<Error, Swagger>> =>
    axios({
      method: "get",
      url
    })
      .then(({ data }) =>
        right(typeof data === "object" ? data : yaml.safeLoad(data))
      )
      .catch(error => left(error));
}
