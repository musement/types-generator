import { prompt } from "inquirer";
import { cli } from "../cli";
import { program } from "../program";
import { Either } from "fp-ts/lib/Either";

jest.mock("../program", () => ({
  program: jest.fn(() => (): Promise<Either<Error, void>> =>
    Promise.resolve({ _tag: "Right", right: undefined })
  )
}));
jest.mock("inquirer", () => ({ prompt: jest.fn(() => Promise.resolve({})) }));
console.error = jest.fn();
console.log = jest.fn();

describe("cli", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("when all options are given", () => {
    test("it returns a task that executes the program", async () => {
      await cli([
        "node",
        "generate-types",
        "--source",
        "swagger_url",
        "--destination",
        "filename.d.ts",
        "--exitOnInvalidType",
        "--type",
        "TypeScript"
      ])();
      expect(console.log).toHaveBeenCalledWith("success");
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([]);
      expect(program).toHaveBeenCalledWith("swagger_url", "filename.d.ts", {
        exitOnInvalidType: true,
        type: "TypeScript"
      });
    });

    describe("when the program returns an error", () => {
      test("it returns a task that writes the error to the console", async () => {
        ((program as unknown) as jest.Mock).mockReturnValue(() =>
          Promise.resolve({ _tag: "Left", left: new Error("program error") })
        );
        await cli([
          "node",
          "generate-types",
          "--source",
          "swagger_url",
          "--destination",
          "filename.d.ts",
          "--type",
          "TypeScript"
        ])();
        expect(console.error).toHaveBeenCalledWith(new Error("program error"));
      });
    });
  });

  describe("when source is missing", () => {
    test("it prompts for the source", async () => {
      await cli([
        "node",
        "generate-types",
        "--destination",
        "filename.d.ts",
        "--exitOnInvalidType",
        "--type",
        "TypeScript"
      ])();
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          type: "string",
          name: "source",
          message: "Swagger's url or path"
        }
      ]);
    });

    describe("when user types a valid source", () => {
      test("it returns a task that executes the program", async () => {
        ((prompt as unknown) as jest.Mock).mockResolvedValue({
          source: "swagger_url"
        });
        await cli([
          "node",
          "generate-types",
          "--destination",
          "filename.d.ts",
          "--exitOnInvalidType",
          "--type",
          "Flow"
        ])();
        expect(program).toHaveBeenCalledWith("swagger_url", "filename.d.ts", {
          exitOnInvalidType: true,
          type: "Flow"
        });
      });
    });

    describe("when user types an empty source", () => {
      test("it returns a task that returns an error", async () => {
        ((prompt as unknown) as jest.Mock).mockResolvedValue({
          source: ""
        });
        await cli([
          "node",
          "generate-types",
          "--destination",
          "filename.d.ts",
          "--exitOnInvalidType"
        ])();
        expect(program).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          new Error("Source is missing")
        );
      });
    });
  });

  describe("when destination is missing", () => {
    test("it prompts for the destination", async () => {
      await cli([
        "node",
        "generate-types",
        "--source",
        "swagger_url",
        "--exitOnInvalidType",
        "--type",
        "TypeScript"
      ])();
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          type: "string",
          name: "destination",
          message: "Name of the file"
        }
      ]);
    });

    describe("when user types a valid destination", () => {
      test("it returns a task that executes the program", async () => {
        ((prompt as unknown) as jest.Mock).mockResolvedValue({
          destination: "filename.d.ts"
        });
        await cli([
          "node",
          "generate-types",
          "--source",
          "swagger_url",
          "--exitOnInvalidType",
          "--type",
          "TypeScript"
        ])();
        expect(program).toHaveBeenCalledWith("swagger_url", "filename.d.ts", {
          exitOnInvalidType: true,
          type: "TypeScript"
        });
      });
    });

    describe("when user types an empty destination", () => {
      test("it returns a task that returns an error", async () => {
        ((prompt as unknown) as jest.Mock).mockResolvedValue({
          destination: ""
        });
        await cli([
          "node",
          "generate-types",
          "--source",
          "swagger_url",
          "--exitOnInvalidType"
        ])();
        expect(program).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          new Error("Destination is missing")
        );
      });
    });
  });

  describe("when type is missing", () => {
    test("it prompts for the type", async () => {
      await cli([
        "node",
        "generate-types",
        "--source",
        "swagger_url",
        "--exitOnInvalidType",
        "--destination",
        "core.3.4.0.d.ts"
      ])();
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          type: "list",
          name: "type",
          message: "Types to generate",
          choices: ["TypeScript", "Flow"],
          default: "TypeScript"
        }
      ]);
    });

    describe("when user types a valid type", () => {
      test("it returns a task that executes the program", async () => {
        ((prompt as unknown) as jest.Mock).mockResolvedValue({
          type: "TypeScript"
        });
        await cli([
          "node",
          "generate-types",
          "--source",
          "swagger_url",
          "--destination",
          "filename.d.ts",
          "--exitOnInvalidType"
        ])();
        expect(program).toHaveBeenCalledWith("swagger_url", "filename.d.ts", {
          exitOnInvalidType: true,
          type: "TypeScript"
        });
      });
    });

    describe("when user types an empty type", () => {
      test("it returns a task that returns an error", async () => {
        ((prompt as unknown) as jest.Mock).mockResolvedValue({
          type: ""
        });
        await cli([
          "node",
          "generate-types",
          "--source",
          "swagger_url",
          "--destination",
          "core.3.4.0.d.ts",
          "--exitOnInvalidType"
        ])();
        expect(program).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          new Error("Type is missing")
        );
      });
    });
  });

  describe("when --exitOnInvalidType is missing", () => {
    test("it calls 'program' with exitOnInvalidType=false", async () => {
      ((prompt as unknown) as jest.Mock).mockResolvedValue({});
      await cli([
        "node",
        "generate-types",
        "--source",
        "swagger_url",
        "--destination",
        "filename.d.ts",
        "--type",
        "TypeScript"
      ])();
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([]);
      expect(program).toHaveBeenCalledWith("swagger_url", "filename.d.ts", {
        exitOnInvalidType: false,
        type: "TypeScript"
      });
    });
  });
});
