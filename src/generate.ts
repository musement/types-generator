/* eslint-disable @typescript-eslint/no-use-before-define */
import { Swagger } from "./models/Swagger";
import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import { SchemaObject } from "./models/SchemaObject";
import { ReferenceObject } from "./models/ReferenceObject";
import { Options } from "./models/Options";

function getDefinitions(
  swagger: Swagger
): E.Either<Error, { [key: string]: SchemaObject | ReferenceObject }> {
  return swagger.components
    ? E.right(swagger.components.schemas)
    : E.left(new Error("There is no definition"));
}

function toCamelCase(key: string): string {
  return key
    .split("-")
    .map(token => token[0].toUpperCase() + token.slice(1))
    .join("");
}

function getReferenceName(reference: string): string {
  return pipe(reference.replace("#/components/schemas/", ""), toCamelCase);
}

function getExactObject(options: Options) {
  return function(properties: string[]): string {
    return options.type === "TypeScript"
      ? `{${properties.join(",")}}`
      : `{|${properties.join(",")}|}`;
  };
}

function concatKeyAndType(key: string, isRequired: boolean) {
  return function concatType(type: string): string {
    return `${key}${isRequired ? "" : "?"}:${type}`;
  };
}

function isRequired(
  key: string,
  requiredFields: string[] | undefined
): boolean {
  return requiredFields != null && requiredFields.indexOf(key) !== -1;
}

function getTypeObject(options: Options) {
  return function({
    properties,
    required
  }: {
    properties: { [key: string]: SchemaObject | ReferenceObject };
    required?: string[];
  }): E.Either<Error, string> {
    return pipe(
      A.array.traverse(E.either)(
        Object.entries(properties),
        ([key, property]) =>
          pipe(
            property,
            getType(options),
            E.map(concatKeyAndType(key, isRequired(key, required)))
          )
      ),
      E.map(getExactObject(options))
    );
  };
}

function getTypeUnknown(options: Options): string {
  return options.type === "TypeScript" ? "unknown" : "mixed";
}

function getTypeNullable(property: SchemaObject | ReferenceObject) {
  return function(type: string): string {
    return property.nullable ? `(${type}|null)` : type;
  };
}

function getType(options: Options) {
  return function(
    property: SchemaObject | ReferenceObject
  ): E.Either<Error, string> {
    if ("$ref" in property) {
      return E.right(
        pipe(getReferenceName(property.$ref), getTypeNullable(property))
      );
    }
    if (property.type === "array") {
      return pipe(
        property.items,
        getType(options),
        E.map(type => `Array<${type}>`),
        E.map(getTypeNullable(property))
      );
    }
    if (property.type === "string" && property.enum) {
      return E.right(
        pipe(
          property.enum.map(enumValue => `'${enumValue}'`).join("|"),
          getTypeNullable(property)
        )
      );
    }
    if ("allOf" in property && property.allOf) {
      return pipe(
        A.array.traverse(E.either)(property.allOf, getType(options)),
        E.map(types => types.join("&")),
        E.map(getTypeNullable(property))
      );
    }
    if ("anyOf" in property && property.anyOf) {
      return pipe(
        A.array.traverse(E.either)(property.anyOf, getType(options)),
        E.map(types => types.join("|")),
        E.map(getTypeNullable(property))
      );
    }
    if ("oneOf" in property && property.oneOf) {
      return pipe(
        A.array.traverse(E.either)(property.oneOf, getType(options)),
        E.map(types => types.join("|")),
        E.map(getTypeNullable(property))
      );
    }
    if (["boolean", "number", "null", "string"].indexOf(property.type) !== -1) {
      return E.right(pipe(property.type, getTypeNullable(property)));
    }
    if (property.type === "integer") {
      return E.right(pipe("number", getTypeNullable(property)));
    }
    if (property.type === "object" && property.properties) {
      const { properties, required } = property;
      return pipe(
        { properties, required },
        getTypeObject(options),
        E.map(getTypeNullable(property))
      );
    }
    return options.exitOnInvalidType
      ? E.left(new Error(`Invalid type: ${JSON.stringify(property)}`))
      : E.right(getTypeUnknown(options));
  };
}

function getTypesFromSchemas(options: Options) {
  return function(schemas: {
    [key: string]: SchemaObject | ReferenceObject;
  }): E.Either<Error, string[]> {
    return pipe(
      A.array.traverse(E.either)(Object.entries(schemas), ([key, property]) =>
        pipe(
          getType(options)(property),
          E.map(type => `${toCamelCase(key)}=${type}`)
        )
      )
    );
  };
}

function checkOpenApiVersion(swagger: Swagger): E.Either<Error, Swagger> {
  return swagger.openapi.match(/3\.0\.\d+/)
    ? E.right(swagger)
    : E.left(new Error(`Version not supported: ${swagger.openapi}`));
}

function generate(options: Options) {
  return function(swagger: Swagger): E.Either<Error, string> {
    return pipe(
      swagger,
      checkOpenApiVersion,
      E.chain(getDefinitions),
      E.chain(getTypesFromSchemas(options)),
      E.map(properties =>
        properties.map(prop => `export type ${prop}`).join(";")
      )
    );
  };
}

export { getDefinitions, getType, generate };
