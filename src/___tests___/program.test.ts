import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { program } from "../program";
import { getSwagger } from "../read";
import { generate } from "../generate";
import { write } from "../write";

jest.mock("../read", () => ({ getSwagger: jest.fn(() => jest.fn()) }));
jest.mock("../generate", () => ({ generate: jest.fn() }));
jest.mock("../write", () => ({ write: jest.fn(() => jest.fn()) }));

describe("program", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("when everything is running smoothly", () => {
    test("it return a task that writes the file", async () => {
      const actualGetSwagger = jest.fn(() => TE.right({ openapi: "3.0.0" }));
      ((getSwagger as unknown) as jest.Mock).mockReturnValueOnce(
        actualGetSwagger
      );
      const actualGenerate = jest.fn(() => E.right("generated types"));
      ((generate as unknown) as jest.Mock).mockReturnValueOnce(actualGenerate);
      const actualWrite = jest.fn(() => TE.right(undefined));
      ((write as unknown) as jest.Mock).mockReturnValueOnce(actualWrite);

      const task = program({
        source: "swagger_url",
        destination: "filename",
        exitOnInvalidType: true,
        type: "Flow",
        patchSource: undefined
      });
      const result = await task();

      expect(getSwagger).toHaveBeenCalledWith(undefined);
      expect(actualGetSwagger).toHaveBeenCalledWith("swagger_url");
      expect(generate).toHaveBeenCalledWith({
        exitOnInvalidType: true,
        type: "Flow"
      });
      expect(actualGenerate).toHaveBeenCalledWith({ openapi: "3.0.0" });
      expect(write).toHaveBeenCalledWith("filename");
      expect(actualWrite).toHaveBeenCalledWith("generated types");
      expect(result).toEqual(E.right(undefined));
    });
  });

  describe("when there's an error downloading the swagger", () => {
    test("it return a task containing the error", async () => {
      const actualGetSwagger = jest.fn(() =>
        T.of(E.left(new Error("download error")))
      );
      ((getSwagger as unknown) as jest.Mock).mockReturnValueOnce(
        actualGetSwagger
      );
      const actualGenerate = jest.fn();
      ((generate as unknown) as jest.Mock).mockReturnValueOnce(actualGenerate);
      const actualWrite = jest.fn(() => (): T.Task<E.Either<never, void>> =>
        TE.right(undefined)
      );
      ((write as unknown) as jest.Mock).mockReturnValueOnce(actualWrite);

      const task = program({
        source: "swagger_url",
        destination: "filename",
        exitOnInvalidType: true,
        type: "Flow",
        patchSource: undefined
      });
      const result = await task();

      expect(getSwagger).toHaveBeenCalledWith(undefined);
      expect(actualGetSwagger).toHaveBeenCalledWith("swagger_url");
      expect(actualGenerate).not.toHaveBeenCalled();
      expect(write).toHaveBeenCalledWith("filename");
      expect(actualWrite).not.toHaveBeenCalled();
      expect(result).toEqual(E.left(new Error("download error")));
    });
  });

  describe("when there's an error generating the type definitions", () => {
    test("it return a task containing the error", async () => {
      const actualGetSwagger = jest.fn(() => TE.right({ openapi: "3.0.0" }));
      ((getSwagger as unknown) as jest.Mock).mockReturnValueOnce(
        actualGetSwagger
      );
      const actualGenerate = jest.fn(() => E.left(new Error("types error")));
      ((generate as unknown) as jest.Mock).mockReturnValueOnce(actualGenerate);
      const actualWrite = jest.fn(() => TE.right(undefined));
      ((write as unknown) as jest.Mock).mockReturnValueOnce(actualWrite);

      const task = program({
        source: "swagger_url",
        destination: "filename",
        exitOnInvalidType: true,
        type: "Flow",
        patchSource: undefined
      });
      const result = await task();

      expect(getSwagger).toHaveBeenCalledWith(undefined);
      expect(actualGetSwagger).toHaveBeenCalledWith("swagger_url");
      expect(generate).toHaveBeenCalledWith({
        exitOnInvalidType: true,
        type: "Flow"
      });
      expect(actualGenerate).toHaveBeenCalledWith({ openapi: "3.0.0" });
      expect(write).toHaveBeenCalledWith("filename");
      expect(actualWrite).not.toHaveBeenCalled();
      expect(result).toEqual(E.left(new Error("types error")));
    });
  });

  describe("when there's an error writing the file", () => {
    test("it return a task containing the error", async () => {
      const actualGetSwagger = jest.fn(() => TE.right({ openapi: "3.0.0" }));
      ((getSwagger as unknown) as jest.Mock).mockReturnValueOnce(
        actualGetSwagger
      );
      const actualGenerate = jest.fn(() => E.right("generated types"));
      ((generate as unknown) as jest.Mock).mockReturnValueOnce(actualGenerate);
      const actualWrite = jest.fn(() => T.of(E.left(new Error("write error"))));
      ((write as unknown) as jest.Mock).mockReturnValueOnce(actualWrite);

      const task = program({
        source: "swagger_url",
        destination: "filename",
        exitOnInvalidType: true,
        type: "Flow",
        patchSource: undefined
      });
      const result = await task();

      expect(getSwagger).toHaveBeenCalledWith(undefined);
      expect(actualGetSwagger).toHaveBeenCalledWith("swagger_url");
      expect(generate).toHaveBeenCalledWith({
        exitOnInvalidType: true,
        type: "Flow"
      });
      expect(actualGenerate).toHaveBeenCalledWith({ openapi: "3.0.0" });
      expect(write).toHaveBeenCalledWith("filename");
      expect(actualWrite).toHaveBeenCalledWith("generated types");
      expect(result).toEqual(E.left(new Error("write error")));
    });
  });
});
