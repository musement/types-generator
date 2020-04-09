/* eslint-disable @typescript-eslint/no-explicit-any */
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
    test("it returns 'string'", () => {
      expect(getType(baseOptions)({ type: "string" })).toEqual(right("string"));
    });

    describe("when the property is nullable", () => {
      test("it returns 'string' or null", () => {
        expect(
          getType(baseOptions)({ type: "string", nullable: true })
        ).toEqual(right("(string|null)"));
      });
    });
  });

  describe("string with enum", () => {
    test("it returns the possible values", () => {
      expect(
        getType(baseOptions)({
          type: "string",
          enum: ["text", "date", "number"]
        })
      ).toEqual(right("'text'|'date'|'number'"));
    });

    describe("when the property is nullable", () => {
      test("it returns the possible values or null", () => {
        expect(
          getType(baseOptions)({
            type: "string",
            enum: ["text", "date", "number"],
            nullable: true
          })
        ).toEqual(right("('text'|'date'|'number'|null)"));
      });
    });
  });

  describe("boolean", () => {
    test("it returns boolean", () => {
      expect(getType(baseOptions)({ type: "boolean" })).toEqual(
        right("boolean")
      );
    });

    describe("when the property is nullable", () => {
      test("it returns boolean or null", () => {
        expect(
          getType(baseOptions)({ type: "boolean", nullable: true })
        ).toEqual(right("(boolean|null)"));
      });
    });
  });
  describe("number", () => {
    test("it returns number", () => {
      expect(getType(baseOptions)({ type: "number" })).toEqual(right("number"));
    });

    describe("when the property is nullable", () => {
      test("it returns number or null", () => {
        expect(
          getType(baseOptions)({ type: "number", nullable: true })
        ).toEqual(right("(number|null)"));
      });
    });
  });

  describe("integer", () => {
    test("it returns integer", () => {
      expect(getType(baseOptions)({ type: "integer" })).toEqual(
        right("number")
      );
    });

    describe("when the property is nullable", () => {
      test("it returns integer or null", () => {
        expect(
          getType(baseOptions)({ type: "integer", nullable: true })
        ).toEqual(right("(number|null)"));
      });
    });
  });

  describe("reference", () => {
    test("it returns the referenced type", () => {
      expect(
        getType(baseOptions)({
          $ref: "#/components/schemas/ExtraCustomerDataField"
        })
      ).toEqual(right("ExtraCustomerDataField"));
    });

    describe("when the property is nullable", () => {
      test("it returns the referenced type or null", () => {
        expect(
          getType(baseOptions)({
            $ref: "#/components/schemas/ExtraCustomerDataField",
            nullable: true
          })
        ).toEqual(right("(ExtraCustomerDataField|null)"));
      });
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
    test("it returns array", () => {
      expect(
        getType(baseOptions)({
          type: "array",
          items: {
            $ref: "#/components/schemas/FormFieldDefinition"
          }
        })
      ).toEqual(right("Array<FormFieldDefinition>"));
    });

    describe("when the property is nullable", () => {
      test("it returns array or null", () => {
        expect(
          getType(baseOptions)({
            type: "array",
            items: {
              $ref: "#/components/schemas/FormFieldDefinition",
              nullable: true
            },
            nullable: true
          })
        ).toEqual(right("(Array<(FormFieldDefinition|null)>|null)"));
      });
    });
  });

  describe("allOf", () => {
    describe("when type is TypeScript", () => {
      test("it combines the schemas with '&'", () => {
        expect(
          getType({ ...baseOptions, type: "TypeScript" })({
            allOf: [
              {
                $ref: "#/components/schemas/PostCartItem"
              },
              {
                $ref: "#/components/schemas/PostCart"
              }
            ]
          })
        ).toEqual(right("PostCartItem&PostCart"));
      });
    });

    describe("when type is Flow", () => {
      test("it returns a value destructuring the types", () => {
        expect(
          getType({ ...baseOptions, type: "Flow" })({
            allOf: [
              {
                $ref: "#/components/schemas/PostCartItem"
              },
              {
                $ref: "#/components/schemas/PostCart"
              }
            ]
          })
        ).toEqual(right("{|...PostCartItem,...PostCart|}"));
      });
    });

    describe("when it contains a type", () => {
      test("it consider the type as part of 'allOf'", () => {
        expect(
          getType(baseOptions)({
            allOf: [
              {
                $ref: "#/components/schemas/PostCartItem"
              }
            ],
            type: "object",
            properties: {
              itemUuid: { type: "string" }
            }
          } as any)
        ).toEqual(right("PostCartItem&{itemUuid?:string}"));
      });
    });

    describe("when the property is nullable", () => {
      test("it returns a valid type that can be null", () => {
        expect(
          getType(baseOptions)({
            allOf: [
              {
                $ref: "#/components/schemas/PostCartItem"
              },
              {
                $ref: "#/components/schemas/PostCart",
                nullable: true
              }
            ],
            nullable: true
          })
        ).toEqual(right("(PostCartItem&(PostCart|null)|null)"));
        expect(
          getType(baseOptions)({
            allOf: [
              {
                $ref: "#/components/schemas/PostCartItem"
              },
              {
                $ref: "#/components/schemas/PostCart",
                nullable: true
              }
            ],
            nullable: false
          })
        ).toEqual(right("PostCartItem&(PostCart|null)"));
      });
    });

    describe("when the subschemas are different from object and $ref", () => {
      test("it returns an error", () => {
        expect(
          getType(baseOptions)({
            allOf: [
              { $ref: "#/components/schemas/PostCartItem" },
              { type: "string" }
            ]
          })
        ).toEqual(
          left(
            new Error(
              'Invalid type: {"allOf":[{"$ref":"#/components/schemas/PostCartItem"},{"type":"string"}]}'
            )
          )
        );
      });
    });
  });

  describe("anyOf", () => {
    test("it returns a value the contains any of the subschemas", () => {
      expect(
        getType(baseOptions)({
          anyOf: [
            {
              $ref: "#/components/schemas/PostCartItem"
            },
            {
              $ref: "#/components/schemas/PostCart"
            }
          ]
        })
      ).toEqual(right("PostCartItem|PostCart"));
    });

    describe("when it contains a type", () => {
      test("it consider the type as part of 'anyOf'", () => {
        expect(
          getType(baseOptions)({
            anyOf: [
              {
                $ref: "#/components/schemas/PostCartItem"
              }
            ],
            type: "object",
            properties: {
              itemUuid: { type: "string" }
            }
          } as any)
        ).toEqual(right("PostCartItem|{itemUuid?:string}"));
      });
    });

    describe("when the property is nullable", () => {
      test("it returns a valid type that can be null", () => {
        expect(
          getType(baseOptions)({
            anyOf: [
              {
                $ref: "#/components/schemas/PostCartItem"
              },
              {
                $ref: "#/components/schemas/PostCart",
                nullable: true
              }
            ],
            nullable: true
          })
        ).toEqual(right("(PostCartItem|(PostCart|null)|null)"));
        expect(
          getType(baseOptions)({
            anyOf: [
              {
                $ref: "#/components/schemas/PostCartItem"
              },
              {
                $ref: "#/components/schemas/PostCart",
                nullable: true
              }
            ],
            nullable: false
          })
        ).toEqual(right("PostCartItem|(PostCart|null)"));
      });
    });

    describe("when it contains invalid types", () => {
      test("it returns an error with first invalid type", () => {
        expect(
          getType(baseOptions)({
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
    test("it returns a value the contains one of the subschemas", () => {
      expect(
        getType(baseOptions)({
          oneOf: [
            {
              $ref: "#/components/schemas/PostCartItem"
            },
            {
              $ref: "#/components/schemas/PostCart"
            }
          ]
        })
      ).toEqual(right("PostCartItem|PostCart"));
    });

    describe("when it contains a type", () => {
      test("it consider the type as part of 'oneOf'", () => {
        expect(
          getType(baseOptions)({
            oneOf: [
              {
                $ref: "#/components/schemas/PostCartItem"
              }
            ],
            type: "object",
            properties: {
              itemUuid: { type: "string" }
            }
          } as any)
        ).toEqual(right("PostCartItem|{itemUuid?:string}"));
      });
    });

    describe("when the property is nullable", () => {
      test("it returns a valid type that can be null", () => {
        expect(
          getType(baseOptions)({
            oneOf: [
              {
                $ref: "#/components/schemas/PostCartItem"
              },
              {
                $ref: "#/components/schemas/PostCart",
                nullable: true
              }
            ],
            nullable: true
          })
        ).toEqual(right("(PostCartItem|(PostCart|null)|null)"));
        expect(
          getType(baseOptions)({
            oneOf: [
              {
                $ref: "#/components/schemas/PostCartItem"
              },
              {
                $ref: "#/components/schemas/PostCart",
                nullable: true
              }
            ],
            nullable: false
          })
        ).toEqual(right("PostCartItem|(PostCart|null)"));
      });
    });

    describe("when it contains invalid types", () => {
      test("it returns an error with first invalid type", () => {
        expect(
          getType(baseOptions)({
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
      test("it returns an object with its properties", () => {
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
              },
              1: { type: "string" }
            },
            type: "object"
          })
        ).toEqual(
          right("{1?:string,names?:string,data?:{age?:number,address?:string}}")
        );
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
              },
              1: { type: "string" }
            },
            type: "object"
          })
        ).toEqual(
          right(
            '{|"1"?:string,names?:string,data?:{|age?:number,address?:string|}|}'
          )
        );
      });
    });

    describe("when the property is nullable", () => {
      test("it returns an object or null", () => {
        expect(
          getType({ ...baseOptions, type: "TypeScript" })({
            properties: {
              names: { type: "string", nullable: true },
              data: {
                type: "object",
                properties: {
                  age: { type: "number" },
                  address: { type: "string" }
                }
              }
            },
            type: "object",
            nullable: true
          })
        ).toEqual(
          right(
            "({names?:(string|null),data?:{age?:number,address?:string}}|null)"
          )
        );
      });
    });

    describe("when the property has required fields", () => {
      test("it returns a valid type", () => {
        expect(
          getType({ ...baseOptions, type: "TypeScript" })({
            properties: {
              names: { type: "string" },
              addresses: { type: "string" },
              data: {
                type: "object",
                properties: {
                  age: { type: "number" },
                  address: { type: "string" }
                },
                required: ["age"]
              }
            },
            type: "object",
            required: ["names", "data"]
          })
        ).toEqual(
          right(
            "{names:string,addresses?:string,data:{age:number,address?:string}}"
          )
        );
      });
    });

    describe("when it doesn't contain 'properties'", () => {
      test("it returns an empty object", () => {
        expect(getType(baseOptions)({ type: "object" })).toEqual(right("{}"));
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
        expect(getType(baseOptions)({} as never)).toEqual(
          left(new Error("Invalid type: {}"))
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
    describe('when type is "TypeScript"', () => {
      test("it returns the type definitios", () => {
        expect(
          generate({ ...baseOptions, type: "TypeScript" })({
            openapi: "3.0.0",
            components: {
              schemas: {
                ExceptionResponse: {
                  properties: {
                    code: {
                      description: "Error code",
                      type: "string",
                      example: "1401"
                    }
                  },
                  type: "object"
                },
                FormFieldValue: {
                  properties: {
                    name: {
                      type: "string",
                      example: "firstname"
                    }
                  },
                  type: "object"
                }
              }
            }
          })
        ).toEqual(
          right(
            '"use strict";\nexport type ExceptionResponse={code?:string};export type FormFieldValue={name?:string}'
          )
        );
      });
    });

    describe('when type is "Flow"', () => {
      test("it returns the type definitios", () => {
        expect(
          generate({ ...baseOptions, type: "Flow" })({
            openapi: "3.0.0",
            components: {
              schemas: {
                ExceptionResponse: {
                  properties: {
                    code: {
                      description: "Error code",
                      type: "string",
                      example: "1401"
                    }
                  },
                  type: "object"
                },
                FormFieldValue: {
                  properties: {
                    name: {
                      type: "string",
                      example: "firstname"
                    }
                  },
                  type: "object"
                }
              }
            }
          })
        ).toEqual(
          right(
            "// @flow strict\nexport type ExceptionResponse={|code?:string|};export type FormFieldValue={|name?:string|}"
          )
        );
      });
    });
  });

  describe("when openapi version is not supported", () => {
    test("it returns an error", () => {
      expect(generate(baseOptions)({ openapi: "3.2.0" })).toEqual(
        left(new Error("Version not supported: 3.2.0"))
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
      ).toEqual(
        right('"use strict";\nexport type ExceptionResponse={code?:string}')
      );
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
