import axios from "axios";
import { getContent } from "../dowload";

jest.mock("axios", () =>
  jest.fn(() => Promise.resolve({ data: { info: { title: "Musement API" } } }))
);

describe("getContent", () => {
  test("it calls axios and returns the data", async () => {
    const swagger = await getContent("test");
    expect(axios).toHaveBeenCalledWith({ method: "get", url: "test" });
    expect(swagger).toEqual({ info: { title: "Musement API" } });
  });
});
