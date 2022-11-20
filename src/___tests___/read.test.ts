import axios from "axios";
import fs from "fs";
import path from "path";
import { getSwagger } from "../read";
import { right, left } from "fp-ts/lib/Either";

jest.mock("axios", () => jest.fn());
jest.mock("fs", () => ({ readFileSync: jest.fn() }));
jest.mock("path", () => ({ extname: jest.fn(() => "json") }));

describe("getSwagger", () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("when source is an url", () => {
    describe("when url is reachable", () => {
      describe("when content is in json format", () => {
        test("it returns a task that calls axios and returns the data", async () => {
          (axios as unknown as jest.Mock).mockResolvedValueOnce({
            data: { info: { title: "Musement API" } },
          });
          const task = getSwagger()("https://test");
          const swagger = await task();
          expect(axios).toHaveBeenCalledWith({
            method: "get",
            url: "https://test",
          });
          expect(swagger).toEqual(right({ info: { title: "Musement API" } }));
        });
      });

      describe("when content is in yaml format", () => {
        test("it returns a task that calls axios and returns the data", async () => {
          (axios as unknown as jest.Mock).mockResolvedValueOnce({
            data: `
openapi: "3.0.0"
info:
  title: Musement API`,
          });
          const task = getSwagger()("https://test");
          const swagger = await task();
          expect(axios).toHaveBeenCalledWith({
            method: "get",
            url: "https://test",
          });
          expect(swagger).toEqual(
            right({ openapi: "3.0.0", info: { title: "Musement API" } })
          );
        });
      });
    });

    describe("when url is unreachable", () => {
      test("it returns a task that calls axios and returns an error", async () => {
        (axios as unknown as jest.Mock).mockRejectedValueOnce(
          new Error("error")
        );
        const task = getSwagger()("https://test");
        const swagger = await task();
        expect(axios).toHaveBeenCalledWith({
          method: "get",
          url: "https://test",
        });
        expect(swagger).toEqual(left(new Error("error")));
      });
    });
  });

  describe("when source is a path", () => {
    describe("when url is reachable", () => {
      describe("when content is in json format", () => {
        test("it returns a task that read the file and returns the data", async () => {
          (fs.readFileSync as unknown as jest.Mock).mockReturnValueOnce(
            '{ "info": { "title": "Musement API" } }'
          );
          (path.extname as unknown as jest.Mock).mockReturnValueOnce(".json");

          const task = getSwagger()("test.json");
          const swagger = await task();

          expect(fs.readFileSync).toHaveBeenCalledWith("test.json", "utf8");
          expect(swagger).toEqual(right({ info: { title: "Musement API" } }));
        });
      });

      describe("when content is in yaml format", () => {
        test("it returns a task that read the file and returns the data", async () => {
          (fs.readFileSync as unknown as jest.Mock).mockReturnValueOnce(
            `
openapi: "3.0.0"
info:
  title: Musement API`
          );
          (path.extname as unknown as jest.Mock).mockReturnValueOnce(".yaml");

          const task = getSwagger()("test.yaml");
          const swagger = await task();

          expect(fs.readFileSync).toHaveBeenCalledWith("test.yaml", "utf8");
          expect(swagger).toEqual(
            right({ openapi: "3.0.0", info: { title: "Musement API" } })
          );
        });
      });
    });

    describe("when url is unreachable", () => {
      test("it returns a task that read the file and returns an error", async () => {
        (fs.readFileSync as unknown as jest.Mock).mockImplementationOnce(() => {
          throw new Error("error");
        });
        (path.extname as unknown as jest.Mock).mockReturnValueOnce(".json");
        const task = getSwagger()("test.json");
        const swagger = await task();
        expect(fs.readFileSync).toHaveBeenCalledWith("test.json", "utf8");
        expect(swagger).toEqual(left(new Error("error")));
      });
    });
  });

  describe('when "patchSource" is given', () => {
    describe('when "patchSource" is a string', () => {
      test("it returns a task that calls axios and applied a patch to the data", async () => {
        (axios as unknown as jest.Mock).mockResolvedValueOnce({
          data: { components: { schemas: { Property: { type: "string" } } } },
        });
        (axios as unknown as jest.Mock).mockResolvedValueOnce({
          data: { Property: { type: "object" } },
        });
        const task = getSwagger(left("https://patch"))("https://swagger");
        const swagger = await task();
        expect(axios).toHaveBeenNthCalledWith(1, {
          method: "get",
          url: "https://swagger",
        });
        expect(axios).toHaveBeenNthCalledWith(2, {
          method: "get",
          url: "https://patch",
        });
        expect(swagger).toEqual(
          right({ components: { schemas: { Property: { type: "object" } } } })
        );
      });
    });
  });

  describe('when "patchSource" is an object', () => {
    test("it applies the patch to the data", async () => {
      (axios as unknown as jest.Mock).mockResolvedValueOnce({
        data: { components: { schemas: { Property: { type: "string" } } } },
      });
      const task = getSwagger(right({ Property: { type: "object" } }))(
        "https://swagger"
      );

      const swagger = await task();

      expect(axios).toHaveBeenCalledTimes(1);
      expect(axios).toHaveBeenNthCalledWith(1, {
        method: "get",
        url: "https://swagger",
      });
      expect(swagger).toEqual(
        right({ components: { schemas: { Property: { type: "object" } } } })
      );
    });
  });
});
