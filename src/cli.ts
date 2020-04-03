import arg from "arg";
import inquirer from "inquirer";
import * as TE from "fp-ts/lib/TaskEither";
import * as T from "fp-ts/lib/Task";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { program } from "./program";
import { CliConfig } from "./models/CliConfig";
import { tupled } from "fp-ts/lib/function";

function parseArgumentsIntoOptions(rawArgs: string[]): Partial<CliConfig> {
  const args = arg(
    {
      "--destination": String,
      "--source": String,
      "--type": String,
      "--exitOnInvalidType": Boolean,
      "--patchSource": String,
      "-d": "--destination",
      "-s": "--source",
      "-t": "--type",
      "-e": "--exitOnInvalidType"
    },
    {
      argv: rawArgs.slice(2)
    }
  );
  return {
    destination: args["--destination"],
    source: args["--source"],
    exitOnInvalidType: args["--exitOnInvalidType"] || false,
    type: args["--type"] as "Flow" | "TypeScript" | undefined,
    patchSource: args["--patchSource"]
  };
}

function getQuestions(
  options: Partial<CliConfig>
): (inquirer.ListQuestion | inquirer.Question)[] {
  const questions: (inquirer.ListQuestion | inquirer.Question)[] = [];
  if (!options.source) {
    questions.push({
      type: "string",
      name: "source",
      message: "Swagger's url or path"
    });
  }

  if (!options.destination) {
    questions.push({
      type: "string",
      name: "destination",
      message: "Name of the file"
    });
  }

  if (!options.type) {
    questions.push({
      type: "list",
      name: "type",
      message: "Types to generate",
      choices: ["TypeScript", "Flow"],
      default: "TypeScript"
    });
  }

  return questions;
}

function checkOptions(answers: CliConfig): E.Either<Error, CliConfig> {
  if (!answers.source) {
    return E.left(new Error("Source is missing"));
  }
  if (!answers.destination) {
    return E.left(new Error("Destination is missing"));
  }
  if (!answers.type) {
    return E.left(new Error("Type is missing"));
  }
  return E.right(answers);
}

function getAnswers(
  questions: (inquirer.ListQuestion | inquirer.Question)[]
): T.Task<CliConfig> {
  return (): Promise<CliConfig> => inquirer.prompt<CliConfig>(questions);
}

function promptForMissingOptions(
  options: Partial<CliConfig>
): TE.TaskEither<Error, CliConfig> {
  return pipe(
    options,
    getQuestions,
    getAnswers,
    T.map(answers => ({ ...options, ...answers })),
    T.map(checkOptions)
  );
}

function configToProgramParams({
  source,
  destination,
  exitOnInvalidType,
  type,
  patchSource
}: CliConfig): Parameters<typeof program> {
  return [source, destination, { exitOnInvalidType, type }, patchSource];
}

function output(result: E.Either<Error, void>): void {
  return pipe(
    result,
    E.fold(
      error => console.error(error),
      () => console.log("success")
    )
  );
}

function cli(args: string[]): T.Task<void> {
  return pipe(
    args,
    parseArgumentsIntoOptions,
    promptForMissingOptions,
    TE.map(configToProgramParams),
    TE.chain(tupled(program)),
    T.map(output)
  );
}

export { cli };
