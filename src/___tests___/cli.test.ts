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
        "--url",
        "swagger_url",
        "--destination",
        "filename.d.ts"
      ])();
      expect(console.log).toHaveBeenCalledWith("success");
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([]);
      expect(program).toHaveBeenCalledWith("swagger_url", "filename.d.ts");
    });

    describe("when the program returns an error", () => {
      test("it returns a task that returns the error", async () => {
        ((program as unknown) as jest.Mock).mockReturnValue(() =>
          Promise.resolve({ _tag: "Left", left: new Error("program error") })
        );
        await cli([
          "node",
          "generate-types",
          "--url",
          "swagger_url",
          "--destination",
          "filename.d.ts"
        ])();
        expect(console.error).toHaveBeenCalledWith(new Error("program error"));
        expect(prompt).toHaveBeenCalledWith([]);
        expect(prompt).toHaveBeenCalledTimes(1);
        expect(program).toHaveBeenCalledWith("swagger_url", "filename.d.ts");
      });
    });
  });

  describe("when url is missing", () => {
    test("it prompts for the url", async () => {
      await cli(["node", "generate-types", "--destination", "filename.d.ts"])();
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          type: "string",
          name: "url",
          message: "Swagger's url",
          default: "https://api.musement.com/swagger_3.4.0.json?2"
        }
      ]);
    });

    describe("when user types a valid url", () => {
      test("it returns a task that executes the program", async () => {
        ((prompt as unknown) as jest.Mock).mockResolvedValue({
          url: "swagger_url"
        });
        await cli([
          "node",
          "generate-types",
          "--destination",
          "filename.d.ts"
        ])();
        expect(program).toHaveBeenCalledWith("swagger_url", "filename.d.ts");
      });
    });

    describe("when user types an empty url", () => {
      test("it returns a task that returns an error", async () => {
        ((prompt as unknown) as jest.Mock).mockResolvedValue({
          url: ""
        });
        await cli([
          "node",
          "generate-types",
          "--destination",
          "filename.d.ts"
        ])();
        expect(program).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(new Error("Url is missing"));
      });
    });
  });

  describe("when destination is missing", () => {
    test("it prompts for the destination", async () => {
      await cli(["node", "generate-types", "--url", "swagger_url"])();
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          type: "string",
          name: "destination",
          message: "Name of the file",
          default: "core.3.4.0.d.ts"
        }
      ]);
    });

    describe("when user types a valid destination", () => {
      test("it returns a task that executes the program", async () => {
        ((prompt as unknown) as jest.Mock).mockResolvedValue({
          destination: "filename.d.ts"
        });
        await cli(["node", "generate-types", "--url", "swagger_url"])();
        expect(program).toHaveBeenCalledWith("swagger_url", "filename.d.ts");
      });
    });

    describe("when user types an empty destination", () => {
      test("it returns a task that returns an error", async () => {
        ((prompt as unknown) as jest.Mock).mockResolvedValue({
          destination: ""
        });
        await cli(["node", "generate-types", "--url", "swagger_url"])();
        expect(program).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          new Error("Destination is missing")
        );
      });
    });
  });
});
