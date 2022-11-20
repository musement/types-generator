import { write } from "../write";
import { right, left } from "fp-ts/lib/Either";
import fs from "fs";

jest.mock("prettier", () => ({
  format: jest.fn((content) => `prettified<${content}>`),
}));
jest.mock("fs", () => ({
  writeFile: jest.fn((filename, content, callback) => {
    callback();
    return Promise.resolve();
  }),
}));

describe("write", () => {
  describe("when it is possible to write on filesystem", () => {
    test("it returns a task containing right(undefined)", async () => {
      const task = write("filename")("content");
      const result = await task();
      expect(fs.writeFile).toHaveBeenCalledWith(
        "filename",
        "prettified<content>",
        expect.anything()
      );
      expect(result).toEqual(right(undefined));
    });
  });

  describe("when there's an error writing on filesystem", () => {
    test("it returns a task containing left(Error)", async () => {
      (fs.writeFile as unknown as jest.Mock).mockImplementationOnce(
        (filename, content, callback) => {
          callback(new Error("error"));
          return Promise.resolve();
        }
      );
      const task = write("filename")("content");
      const result = await task();
      expect(fs.writeFile).toHaveBeenCalledWith(
        "filename",
        "prettified<content>",
        expect.anything()
      );
      expect(result).toEqual(left(new Error("error")));
    });
  });
});
