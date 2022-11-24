import { prompt } from "inquirer";
import { cli } from "../cli";
import { Either } from "fp-ts/lib/Either";
import * as E from "fp-ts/lib/Either";

jest.mock("../program", () => ({
  program: jest.fn(
    () => (): Promise<Either<Error, void>> =>
      Promise.resolve({ _tag: "Right", right: undefined })
  ),
}));
jest.mock("inquirer", () => ({ prompt: jest.fn(() => Promise.resolve({})) }));

describe("cli", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("when all options are given", () => {
    test("it returns the config object", async () => {
      expect(
        await cli([
          "node",
          "generate-types",
          "--source",
          "swagger_url",
          "--destination",
          "filename.d.ts",
          "--exitOnInvalidType",
          "--type",
          "TypeScript",
          "--patchSource",
          "patch_source",
          "--parser",
          "typescript",
        ])()
      ).toEqual(
        E.right({
          destination: "filename.d.ts",
          source: "swagger_url",
          exitOnInvalidType: true,
          type: "TypeScript",
          patchSource: "patch_source",
          parser: "typescript",
        })
      );
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
        "TypeScript",
        "--parser",
        "typescript",
      ])();
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          type: "string",
          name: "source",
          message: "Swagger's url or path",
        },
      ]);
    });

    describe("when user types a valid source", () => {
      test("it returns a config with the typed source", async () => {
        (prompt as unknown as jest.Mock).mockResolvedValue({
          source: "swagger_url",
        });
        expect(
          await cli([
            "node",
            "generate-types",
            "--destination",
            "filename.d.ts",
            "--exitOnInvalidType",
            "--type",
            "Flow",
            "--parser",
            "typescript",
          ])()
        ).toEqual(
          E.right({
            destination: "filename.d.ts",
            source: "swagger_url",
            exitOnInvalidType: true,
            type: "Flow",
            parser: "typescript",
          })
        );
      });
    });

    describe("when user types an empty source", () => {
      test("it returns an error", async () => {
        (prompt as unknown as jest.Mock).mockResolvedValue({
          source: "",
        });
        expect(
          await cli([
            "node",
            "generate-types",
            "--destination",
            "filename.d.ts",
            "--exitOnInvalidType",
            "--parser",
            "typescript",
          ])()
        ).toEqual(E.left(new Error("Source is missing")));
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
        "TypeScript",
        "--parser",
        "typescript",
      ])();
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          type: "string",
          name: "destination",
          message: "Name of the file",
        },
      ]);
    });

    describe("when user types a valid destination", () => {
      test("it returns a config with the typed destination", async () => {
        (prompt as unknown as jest.Mock).mockResolvedValue({
          destination: "filename.d.ts",
        });
        expect(
          await cli([
            "node",
            "generate-types",
            "--source",
            "swagger_url",
            "--exitOnInvalidType",
            "--type",
            "TypeScript",
            "--parser",
            "typescript",
          ])()
        ).toEqual(
          E.right({
            destination: "filename.d.ts",
            source: "swagger_url",
            exitOnInvalidType: true,
            type: "TypeScript",
            parser: "typescript",
          })
        );
      });
    });

    describe("when user types an empty destination", () => {
      test("it returns a task that returns an error", async () => {
        (prompt as unknown as jest.Mock).mockResolvedValue({
          destination: "",
        });
        expect(
          await cli([
            "node",
            "generate-types",
            "--source",
            "swagger_url",
            "--exitOnInvalidType",
          ])()
        ).toEqual(E.left(new Error("Destination is missing")));
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
        "core.3.4.0.d.ts",
        "--parser",
        "typescript",
      ])();
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          type: "list",
          name: "type",
          message: "Types to generate",
          choices: ["TypeScript", "Flow"],
          default: "TypeScript",
        },
      ]);
    });

    describe("when user types a valid type", () => {
      test("it returns a config with the typed type", async () => {
        (prompt as unknown as jest.Mock).mockResolvedValue({
          type: "TypeScript",
        });
        expect(
          await cli([
            "node",
            "generate-types",
            "--source",
            "swagger_url",
            "--destination",
            "filename.d.ts",
            "--exitOnInvalidType",
            "--parser",
            "typescript",
          ])()
        ).toEqual(
          E.right({
            destination: "filename.d.ts",
            source: "swagger_url",
            exitOnInvalidType: true,
            type: "TypeScript",
            parser: "typescript",
          })
        );
      });
    });

    describe("when user types an empty type", () => {
      test("it returns an error", async () => {
        (prompt as unknown as jest.Mock).mockResolvedValue({
          type: "",
        });
        expect(
          await cli([
            "node",
            "generate-types",
            "--source",
            "swagger_url",
            "--destination",
            "core.3.4.0.d.ts",
            "--exitOnInvalidType",
            "--parser",
            "typescript",
          ])()
        ).toEqual(E.left(new Error("Type is missing")));
      });
    });
  });
  describe("when Parser is missing", () => {
    test("it prompts for the parser", async () => {
      await cli([
        "node",
        "generate-types",
        "--source",
        "swagger_url",
        "--exitOnInvalidType",
        "--destination",
        "core.3.4.0.d.ts",
        "--type",
        "TypeScript",
      ])();
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          type: "list",
          name: "parser",
          message: "Parser format",
          choices: ["typescript", "babel", "flow", "babel-flow"],
          default: "typescript",
        },
      ]);
    });

    describe("when user types a valid parser", () => {
      test("it returns a config with the typed parser", async () => {
        (prompt as unknown as jest.Mock).mockResolvedValue({
          parser: "typescript",
        });
        expect(
          await cli([
            "node",
            "generate-types",
            "--source",
            "swagger_url",
            "--destination",
            "filename.d.ts",
            "--exitOnInvalidType",
            "--type",
            "TypeScript",
          ])()
        ).toEqual(
          E.right({
            destination: "filename.d.ts",
            source: "swagger_url",
            exitOnInvalidType: true,
            type: "TypeScript",
            parser: "typescript",
            patchSource: undefined,
          })
        );
      });
    });

    describe("when user types an empty parser", () => {
      test("it returns an error", async () => {
        (prompt as unknown as jest.Mock).mockResolvedValue({
          parser: "",
        });
        expect(
          await cli([
            "node",
            "generate-types",
            "--source",
            "swagger_url",
            "--destination",
            "core.3.4.0.d.ts",
            "--exitOnInvalidType",
            "--type",
            "TypeScript",
            "--parser",
            "",
          ])()
        ).toEqual(E.left(new Error("Parser is missing")));
      });
    });
  });

  describe("when --exitOnInvalidType is missing", () => {
    test("it sets exitOnInvalidType=false", async () => {
      (prompt as unknown as jest.Mock).mockResolvedValue({});
      expect(
        await cli([
          "node",
          "generate-types",
          "--source",
          "swagger_url",
          "--destination",
          "filename.d.ts",
          "--type",
          "TypeScript",
          "--parser",
          "typescript",
        ])()
      ).toEqual(
        E.right({
          destination: "filename.d.ts",
          source: "swagger_url",
          exitOnInvalidType: false,
          type: "TypeScript",
          parser: "typescript",
        })
      );
    });
  });
});
