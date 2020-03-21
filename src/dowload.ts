import axios from "axios";
import { Swagger } from "./models/Swagger";
import { Task } from "fp-ts/lib/Task";
import { Either, left, right } from "fp-ts/lib/Either";

export function getContent(url: string): Task<Either<Error, Swagger>> {
  return (): Promise<Either<Error, Swagger>> =>
    axios({
      method: "get",
      url
    })
      .then(response => right(response.data))
      .catch(error => left(error));
}
