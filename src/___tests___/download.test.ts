import axios from "axios";
import { getContent } from "../dowload";
import { right, left } from "fp-ts/lib/Either";

jest.mock("axios", () => jest.fn());

describe("getContent", () => {
  describe("when url is reachable", () => {
    test("it returns a task that calls axios and returns the data", async () => {
      ((axios as unknown) as jest.Mock).mockResolvedValueOnce({
        data: { info: { title: "Musement API" } }
      });
      const task = getContent("test");
      const swagger = await task();
      expect(axios).toHaveBeenCalledWith({ method: "get", url: "test" });
      expect(swagger).toEqual(right({ info: { title: "Musement API" } }));
    });

    describe("", () => {
      test("it returns a task that calls axios and returns the data", async () => {
        ((axios as unknown) as jest.Mock).mockResolvedValueOnce({
          data: `
openapi: "3.0.0"
info:
  title: Musement API`
        });
        const task = getContent("test");
        const swagger = await task();
        expect(axios).toHaveBeenCalledWith({ method: "get", url: "test" });
        expect(swagger).toEqual(
          right({ openapi: "3.0.0", info: { title: "Musement API" } })
        );
      });
    });
  });

  describe("when url is unreachable", () => {
    test("it returns a task that calls axios and returns an error", async () => {
      ((axios as unknown) as jest.Mock).mockRejectedValueOnce(
        new Error("error")
      );
      const task = getContent("test");
      const swagger = await task();
      expect(axios).toHaveBeenCalledWith({ method: "get", url: "test" });
      expect(swagger).toEqual(left(new Error("error")));
    });
  });
});
