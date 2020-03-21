import * as T from "fp-ts/lib/Task";
import * as E from "fp-ts/lib/Either";
import { program } from "../program";
import { getContent } from "../dowload";
import { generate } from "../generate";
import { write } from "../write";

jest.mock("../dowload", () => ({ getContent: jest.fn() }));
jest.mock("../generate", () => ({ generate: jest.fn() }));
jest.mock("../write", () => ({ write: jest.fn(() => jest.fn()) }));

describe("program", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("when everything is running smoothly", () => {
    test("it return a task that writes the file", async () => {
      ((getContent as unknown) as jest.Mock).mockImplementationOnce(
        (): T.Task<E.Either<Error, { openapi: string }>> =>
          T.of(E.right({ openapi: "3.0.0" }))
      );
      ((generate as unknown) as jest.Mock).mockImplementationOnce(
        (): E.Either<Error, string> => {
          return E.right("generated types");
        }
      );
      const writeMock = jest.fn(
        (): T.Task<E.Either<Error, void>> => {
          return T.of(E.right(undefined));
        }
      );
      ((write as unknown) as jest.Mock).mockImplementationOnce(() => writeMock);
      const task = program("swagger_url", "filename");
      const result = await task();
      expect(getContent).toHaveBeenCalledWith("swagger_url");
      expect(generate).toHaveBeenCalledWith({ openapi: "3.0.0" });
      expect(write).toHaveBeenCalledWith("filename");
      expect(writeMock).toHaveBeenCalledWith("generated types");
      expect(result).toEqual(E.right(undefined));
    });
  });

  describe("when there's an error downloading the swagger", () => {
    test("it return a task containing the error", async () => {
      ((getContent as unknown) as jest.Mock).mockImplementationOnce(
        (): T.Task<E.Either<Error, {}>> =>
          T.of(E.left(new Error("download error")))
      );
      ((generate as unknown) as jest.Mock).mockImplementationOnce(
        (): E.Either<Error, string> => {
          return E.right("generated types");
        }
      );
      const writeMock = jest.fn(
        (): T.Task<E.Either<Error, void>> => {
          return T.of(E.right(undefined));
        }
      );
      ((write as unknown) as jest.Mock).mockImplementationOnce(() => writeMock);
      const task = program("swagger_url", "filename");
      const result = await task();
      expect(getContent).toHaveBeenCalledWith("swagger_url");
      expect(generate).not.toHaveBeenCalled();
      expect(write).toHaveBeenCalledWith("filename");
      expect(writeMock).not.toHaveBeenCalled();
      expect(result).toEqual(E.left(new Error("download error")));
    });
  });

  describe("when there's an error generating the type definitions", () => {
    test("it return a task containing the error", async () => {
      ((getContent as unknown) as jest.Mock).mockImplementationOnce(
        (): T.Task<E.Either<Error, { openapi: string }>> =>
          T.of(E.right({ openapi: "3.0.0" }))
      );
      ((generate as unknown) as jest.Mock).mockImplementationOnce(
        (): E.Either<Error, string> => {
          return E.left(new Error("types error"));
        }
      );
      const writeMock = jest.fn(
        (): T.Task<E.Either<Error, void>> => {
          return T.of(E.right(undefined));
        }
      );
      ((write as unknown) as jest.Mock).mockImplementationOnce(() => writeMock);
      const task = program("swagger_url", "filename");
      const result = await task();
      expect(getContent).toHaveBeenCalledWith("swagger_url");
      expect(generate).toHaveBeenCalledWith({ openapi: "3.0.0" });
      expect(write).toHaveBeenCalledWith("filename");
      expect(writeMock).not.toHaveBeenCalled();
      expect(result).toEqual(E.left(new Error("types error")));
    });
  });

  describe("when there's an error writing the file", () => {
    test("it return a task containing the error", async () => {
      ((getContent as unknown) as jest.Mock).mockImplementationOnce(
        (): T.Task<E.Either<Error, { openapi: string }>> =>
          T.of(E.right({ openapi: "3.0.0" }))
      );
      ((generate as unknown) as jest.Mock).mockImplementationOnce(
        (): E.Either<Error, string> => {
          return E.right("generated types");
        }
      );
      const writeMock = jest.fn(
        (): T.Task<E.Either<Error, void>> => {
          return T.of(E.left(new Error("write error")));
        }
      );
      ((write as unknown) as jest.Mock).mockImplementationOnce(() => writeMock);
      const task = program("swagger_url", "filename");
      const result = await task();
      expect(getContent).toHaveBeenCalledWith("swagger_url");
      expect(generate).toHaveBeenCalledWith({ openapi: "3.0.0" });
      expect(write).toHaveBeenCalledWith("filename");
      expect(writeMock).toHaveBeenCalledWith("generated types");
      expect(result).toEqual(E.left(new Error("write error")));
    });
  });
});
