import arg from "arg";
import inquirer from "inquirer";
import * as T from "fp-ts/lib/Task";
import * as E from "fp-ts/lib/Either";
import { program } from "./program";
import { pipe } from "fp-ts/lib/pipeable";

type Options = {
  destination: string;
  url: string;
};

function parseArgumentsIntoOptions(rawArgs: string[]): Partial<Options> {
  const args = arg(
    {
      "--destination": String,
      "--url": String,
      "--type": String,
      "-d": "--destination",
      "-u": "--url",
      "-t": "--type"
    },
    {
      argv: rawArgs.slice(2)
    }
  );
  return {
    destination: args["--destination"],
    url: args["--url"]
  };
}

function getQuestions(
  options: Partial<Options>
): (inquirer.ListQuestion | inquirer.Question)[] {
  const questions: (inquirer.ListQuestion | inquirer.Question)[] = [];
  if (!options.url) {
    questions.push({
      type: "string",
      name: "url",
      message: "Swagger's url",
      default: "https://api.musement.com/swagger_3.4.0.json?2"
    });
  }

  if (!options.destination) {
    questions.push({
      type: "string",
      name: "destination",
      message: "Name of the file",
      default: "core.3.4.0.d.ts"
    });
  }
  return questions;
}

function checkOptions(answers: Options): E.Either<Error, Options> {
  if (!answers.url) {
    return E.left(new Error("Url is missing"));
  }
  if (!answers.destination) {
    return E.left(new Error("Destination is missing"));
  }
  return E.right(answers);
}

function getAnswers(
  questions: (inquirer.ListQuestion | inquirer.Question)[]
): T.Task<Options> {
  return (): Promise<Options> => inquirer.prompt<Options>(questions);
}

function promptForMissingOptions(
  options: Partial<Options>
): T.Task<E.Either<Error, Options>> {
  return pipe(
    options,
    getQuestions,
    getAnswers,
    T.map(answers => ({ ...options, ...answers })),
    T.map(checkOptions)
  );
}

function executeProgram(options: Options): T.Task<E.Either<Error, void>> {
  return program(options.url, options.destination);
}

function cli(args: string[]): T.Task<E.Either<Error, void>> {
  return pipe(
    args,
    parseArgumentsIntoOptions,
    promptForMissingOptions,
    T.chain(options => E.either.traverse(T.task)(options, executeProgram)),
    T.map(E.flatten)
  );
}

export { cli };
