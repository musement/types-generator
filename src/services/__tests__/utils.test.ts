/* eslint-disable @typescript-eslint/camelcase */
import { patch, toPascalCase } from "../utils";

describe("patch", () => {
  describe("when the patch contains an existing property", () => {
    test("it overrides the property", () => {
      expect(
        patch({
          openapi: "3.0.0",
          components: {
            schemas: {
              PostActivity: { type: "object" },
            },
          },
        })({ PostActivity: { type: "string" } })
      ).toEqual({
        openapi: "3.0.0",
        components: {
          schemas: {
            PostActivity: { type: "string" },
          },
        },
      });
    });
  });

  describe("when the patch contains a new property", () => {
    test("it adds the property", () => {
      expect(
        patch({
          openapi: "3.0.0",
          components: {
            schemas: {
              PostActivity: { type: "object" },
            },
          },
        })({ NewProperty: { type: "string" } })
      ).toEqual({
        openapi: "3.0.0",
        components: {
          schemas: {
            PostActivity: { type: "object" },
            NewProperty: { type: "string" },
          },
        },
      });
    });
  });

  describe("when the patch contains an array", () => {
    test("it replace the array", () => {
      expect(
        patch({
          openapi: "3.0.0",
          components: {
            schemas: {
              PostActivity: {
                required: ["vertical"],
                properties: {
                  vertical: { type: "string" },
                },
                type: "object",
              },
            },
          },
        })({ PostActivity: { required: [] } })
      ).toEqual({
        openapi: "3.0.0",
        components: {
          schemas: {
            PostActivity: {
              required: [],
              properties: {
                vertical: { type: "string" },
              },
              type: "object",
            },
          },
        },
      });
    });
  });

  describe("when the patch contains a nested property", () => {
    test("it overrides the nested property", () => {
      expect(
        patch({
          openapi: "3.0.0",
          components: {
            schemas: {
              PostActivity: {
                properties: {
                  vertical: { type: "string" },
                  payment: {
                    properties: {
                      order_uuid: { type: "string" },
                      client_ip: { type: "string" },
                    },
                    type: "object",
                  },
                },
                type: "object",
              },
            },
          },
        })({
          PostActivity: {
            properties: {
              payment: {
                properties: {
                  order_uuid: { type: "object" },
                },
              },
            },
          },
        })
      ).toEqual({
        openapi: "3.0.0",
        components: {
          schemas: {
            PostActivity: {
              properties: {
                vertical: { type: "string" },
                payment: {
                  properties: {
                    order_uuid: { type: "object" },
                    client_ip: { type: "string" },
                  },
                  type: "object",
                },
              },
              type: "object",
            },
          },
        },
      });
    });
  });
});

describe("toPascalCase", () => {
  test("it should convert any string to PascalCase", () => {
    expect(toPascalCase("test-string")).toBe("TestString");
    expect(toPascalCase("test_string")).toBe("TestString");
    expect(toPascalCase("test string")).toBe("TestString");
    expect(toPascalCase("test.string")).toBe("TestString");
    expect(toPascalCase("testString")).toBe("TestString");
    expect(toPascalCase("TestString")).toBe("TestString");
    expect(toPascalCase("Multiple_test-string")).toBe("MultipleTestString");
    expect(toPascalCase("multiple.test String")).toBe("MultipleTestString");
  });
});
