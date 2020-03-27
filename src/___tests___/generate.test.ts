import { getDefinitions, getType, generate } from "../generate";
import { right, left } from "fp-ts/lib/Either";
import { Options } from "../models/Options";

const baseOptions: Options = { exitOnInvalidType: true, type: "TypeScript" };

describe("getDefinitions", () => {
  describe("when the swagger contains the schemas", () => {
    test("it returns the schemas", () => {
      expect(
        getDefinitions({
          openapi: "3.0.0",
          components: {
            schemas: {
              ExceptionResponse: {
                properties: {
                  code: {
                    description: "Error code",
                    type: "string",
                    example: "1401"
                  },
                  message: {
                    description: "Error message",
                    type: "string",
                    example:
                      "Full authentication is required to access this resource."
                  },
                  data: {
                    description: "Extra information about the error",
                    type: "string"
                  }
                },
                type: "object"
              },
              PassengersInfoForm: {
                properties: {
                  number: {
                    description: "Number of passengers",
                    type: "integer"
                  },
                  fields: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/FormFieldDefinition"
                    }
                  }
                },
                type: "object"
              }
            }
          }
        })
      ).toEqual(
        right({
          ExceptionResponse: {
            properties: {
              code: {
                description: "Error code",
                type: "string",
                example: "1401"
              },
              message: {
                description: "Error message",
                type: "string",
                example:
                  "Full authentication is required to access this resource."
              },
              data: {
                description: "Extra information about the error",
                type: "string"
              }
            },
            type: "object"
          },
          PassengersInfoForm: {
            properties: {
              number: {
                description: "Number of passengers",
                type: "integer"
              },
              fields: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/FormFieldDefinition"
                }
              }
            },
            type: "object"
          }
        })
      );
    });
  });

  describe("when the swagger does not contain the schema", () => {
    test("it returns an error", () => {
      expect(getDefinitions({ openapi: "3.0.0" } as never)).toEqual(
        left(new Error("There is no definition"))
      );
    });
  });
});

describe("getType", () => {
  describe("string", () => {
    test("it returns a valid type", () => {
      expect(getType(baseOptions)({ type: "string" })).toEqual(right("string"));
    });
  });

  describe("string with enum", () => {
    test("it returns a valid type", () => {
      expect(
        getType(baseOptions)({
          type: "string",
          enum: ["text", "date", "number"]
        })
      ).toEqual(right("'text' | 'date' | 'number'"));
    });
  });

  describe("number", () => {
    test("it returns a valid type", () => {
      expect(getType(baseOptions)({ type: "number" })).toEqual(right("number"));
    });
  });

  describe("integer", () => {
    test("it returns a valid type", () => {
      expect(getType(baseOptions)({ type: "integer" })).toEqual(
        right("number")
      );
    });
  });

  describe("reference", () => {
    test("it returns a valid type", () => {
      expect(
        getType(baseOptions)({
          $ref: "#/components/schemas/ExtraCustomerDataField"
        })
      ).toEqual(right("ExtraCustomerDataField"));
    });

    describe("when the reference name contains '-'", () => {
      test("it converts the name to PascalCase", () => {
        expect(
          getType(baseOptions)({
            $ref: "#/components/schemas/extra-customer-data-field"
          })
        ).toEqual(right("ExtraCustomerDataField"));
      });
    });
  });

  describe("array", () => {
    test("it returns a valid type", () => {
      expect(
        getType(baseOptions)({
          type: "array",
          items: {
            $ref: "#/components/schemas/FormFieldDefinition"
          }
        })
      ).toEqual(right("Array<FormFieldDefinition>"));
    });
  });

  describe("allOf", () => {
    test("it returns a valid type", () => {
      expect(
        getType(baseOptions)({
          type: "",
          allOf: [
            {
              $ref: "#/components/schemas/PostCartItem"
            },
            {
              $ref: "#/components/schemas/PostCart"
            }
          ]
        })
      ).toEqual(right("PostCartItem & PostCart"));
    });

    describe("when it contains invalid types", () => {
      test("it returns an error with first invalid type", () => {
        expect(
          getType(baseOptions)({
            type: "",
            allOf: [
              { type: "first invalid type" } as never,
              { type: "second invalid type" } as never
            ]
          })
        ).toEqual(
          left(new Error('Invalid type: {"type":"first invalid type"}'))
        );
      });
    });
  });

  describe("anyOf", () => {
    test("it returns a valid type", () => {
      expect(
        getType(baseOptions)({
          type: "",
          anyOf: [
            {
              $ref: "#/components/schemas/PostCartItem"
            },
            {
              $ref: "#/components/schemas/PostCart"
            }
          ]
        })
      ).toEqual(right("PostCartItem | PostCart"));
    });

    describe("when it contains invalid types", () => {
      test("it returns an error with first invalid type", () => {
        expect(
          getType(baseOptions)({
            type: "",
            anyOf: [
              { type: "first invalid type" } as never,
              { type: "second invalid type" } as never
            ]
          })
        ).toEqual(
          left(new Error('Invalid type: {"type":"first invalid type"}'))
        );
      });
    });
  });

  describe("oneOf", () => {
    test("it returns a valid type", () => {
      expect(
        getType(baseOptions)({
          type: "",
          oneOf: [
            {
              $ref: "#/components/schemas/PostCartItem"
            },
            {
              $ref: "#/components/schemas/PostCart"
            }
          ]
        })
      ).toEqual(right("PostCartItem | PostCart"));
    });

    describe("when it contains invalid types", () => {
      test("it returns an error with first invalid type", () => {
        expect(
          getType(baseOptions)({
            type: "",
            oneOf: [
              { type: "first invalid type" } as never,
              { type: "second invalid type" } as never
            ]
          })
        ).toEqual(
          left(new Error('Invalid type: {"type":"first invalid type"}'))
        );
      });
    });
  });

  describe("object", () => {
    describe('when options.type === "TypeScript"', () => {
      test("it returns a valid type", () => {
        expect(
          getType({ ...baseOptions, type: "TypeScript" })({
            properties: {
              names: { type: "string" },
              data: {
                type: "object",
                properties: {
                  age: { type: "number" },
                  address: { type: "string" }
                }
              }
            },
            type: "object"
          })
        ).toEqual(right("{names:string,data:{age:number,address:string}}"));
      });
    });

    describe('when options.type === "Flow"', () => {
      test("it returns an exact object", () => {
        expect(
          getType({ ...baseOptions, type: "Flow" })({
            properties: {
              names: { type: "string" },
              data: {
                type: "object",
                properties: {
                  age: { type: "number" },
                  address: { type: "string" }
                }
              }
            },
            type: "object"
          })
        ).toEqual(right("{|names:string,data:{|age:number,address:string|}|}"));
      });
    });

    describe("when it doesn't contain 'properties'", () => {
      test("it returns an error", () => {
        expect(getType(baseOptions)({ type: "object" })).toEqual(
          left(new Error('Invalid type: {"type":"object"}'))
        );
      });
    });

    describe("when it contains invalid types", () => {
      test("it returns an error with first invalid type", () => {
        expect(
          getType(baseOptions)({
            properties: {
              code: { type: "string" },
              message: { type: "first invalid type" as never },
              data: { type: "second invalid type" as never }
            },
            type: "object"
          })
        ).toEqual(
          left(new Error('Invalid type: {"type":"first invalid type"}'))
        );
      });
    });
  });

  describe("invalid type", () => {
    describe("when exitOnInvalidType is true", () => {
      test("it returns an error", () => {
        expect(getType(baseOptions)({ type: "invalid" } as never)).toEqual(
          left(new Error('Invalid type: {"type":"invalid"}'))
        );
      });
    });

    describe("when exitOnInvalidType is false", () => {
      describe("when options.type == 'TypeScript'", () => {
        test("it returns 'unknown'", () => {
          expect(
            getType({
              ...baseOptions,
              exitOnInvalidType: false,
              type: "TypeScript"
            })({
              type: "invalid"
            } as never)
          ).toEqual(right("unknown"));
        });
      });

      describe("when options.type == 'Flow'", () => {
        test("it returns 'mixed'", () => {
          expect(
            getType({
              ...baseOptions,
              exitOnInvalidType: false,
              type: "Flow"
            })({
              type: "invalid"
            } as never)
          ).toEqual(right("mixed"));
        });
      });
    });
  });
});

describe("generate", () => {
  describe("when the swagger is valid", () => {
    test("it returns the type definitios", () => {
      expect(
        generate({ ...baseOptions, exitOnInvalidType: false })({
          openapi: "3.0.0",
          components: {
            schemas: {
              ExceptionResponse: {
                properties: {
                  code: {
                    description: "Error code",
                    type: "string",
                    example: "1401"
                  },
                  message: {
                    description: "Error message",
                    type: "string",
                    example:
                      "Full authentication is required to access this resource."
                  },
                  data: {
                    description: "Extra information about the error",
                    type: "string"
                  }
                },
                type: "object"
              },
              FormFieldValue: {
                properties: {
                  name: {
                    type: "string",
                    example: "firstname"
                  },
                  value: {
                    type: "string",
                    example: "Linus"
                  }
                },
                type: "object"
              }
            }
          }
        })
      ).toEqual(
        right(
          "type ExceptionResponse={code:string,message:string,data:string};type FormFieldValue={name:string,value:string}"
        )
      );
    });
  });

  describe("when a type name contains '-'", () => {
    test("it converts the name to PascalCase", () => {
      expect(
        generate(baseOptions)({
          openapi: "3.0.0",
          components: {
            schemas: {
              "exception-response": {
                properties: {
                  code: {
                    description: "Error code",
                    type: "string",
                    example: "1401"
                  }
                },
                type: "object"
              }
            }
          }
        })
      ).toEqual(right("type ExceptionResponse={code:string}"));
    });
  });

  describe("when 'getDefinitions' returns an error", () => {
    test("it returns the error", () => {
      expect(
        generate({ ...baseOptions, exitOnInvalidType: false })({
          openapi: "3.0.0"
        })
      ).toEqual(left(new Error("There is no definition")));
    });
  });
});
