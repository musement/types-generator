import arg from "arg";
import inquirer from "inquirer";
import * as TE from "fp-ts/lib/TaskEither";
import * as T from "fp-ts/lib/Task";
import * as E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import { CliConfig } from "./models/CliConfig";
import { BuiltInParserName } from "prettier";

function parseArgumentsIntoOptions(rawArgs: string[]): Partial<CliConfig> {
  const args = arg(
    {
      "--destination": String,
      "--source": String,
      "--type": String,
      "--parser": String,
      "--exitOnInvalidType": Boolean,
      "--patchSource": String,
      "-d": "--destination",
      "-s": "--source",
      "-t": "--type",
      "-p": "--parser",
      "-e": "--exitOnInvalidType",
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    destination: args["--destination"],
    source: args["--source"],
    exitOnInvalidType: args["--exitOnInvalidType"] || false,
    type: args["--type"] as "Flow" | "TypeScript" | undefined,
    parser: args["--parser"] as BuiltInParserName,
    patchSource: args["--patchSource"],
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
      message: "Swagger's url or path",
    });
  }

  if (!options.destination) {
    questions.push({
      type: "string",
      name: "destination",
      message: "Name of the file",
    });
  }

  if (!options.type) {
    questions.push({
      type: "list",
      name: "type",
      message: "Types to generate",
      choices: ["TypeScript", "Flow"],
      default: "TypeScript",
    });
  }

  if (!options.parser) {
    questions.push({
      type: "list",
      name: "parser",
      message: "Parser format",
      choices: ["typescript", "babel", "flow", "babel-flow"],
      default: "typescript",
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
  if (!answers.parser) {
    return E.left(new Error("Parser is missing"));
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
    T.map((answers) => ({ ...options, ...answers })),
    T.map(checkOptions)
  );
}

const cli = flow(parseArgumentsIntoOptions, promptForMissingOptions);

export { cli };
