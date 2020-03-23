/* eslint-disable @typescript-eslint/no-use-before-define */
import { Swagger } from "./models/Swagger";
import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import { SchemaObject } from "./models/SchemaObject";
import { ReferenceObject } from "./models/ReferenceObject";

function getDefinitions(
  swagger: Swagger
): E.Either<Error, { [key: string]: SchemaObject | ReferenceObject }> {
  return swagger.components
    ? E.right(swagger.components.schemas)
    : E.left(new Error("There is no definition"));
}

function getReferenceName(reference: string): string {
  return reference.replace("#/components/schemas/", "");
}

function combineKeyAndProperty(
  key: string,
  property: SchemaObject | ReferenceObject,
  separator: string
): E.Either<Error, string> {
  return pipe(
    getType(property),
    E.map(type => `${key}${separator}${type}`)
  );
}

function getTypeSchemas(separator: string) {
  return function(schemas: {
    [key: string]: SchemaObject | ReferenceObject;
  }): E.Either<Error, string[]> {
    return pipe(
      A.array.traverse(E.either)(Object.entries(schemas), ([key, property]) =>
        combineKeyAndProperty(key, property, separator)
      )
    );
  };
}

function getType(
  property: SchemaObject | ReferenceObject
): E.Either<Error, string> {
  if ("$ref" in property) {
    return E.right(getReferenceName(property.$ref));
  }
  if (property.type === "array") {
    return pipe(
      property.items,
      getType,
      E.map(type => `Array<${type}>`)
    );
  }
  if (property.type === "string" && property.enum) {
    return E.right(
      property.enum.map(enumValue => `'${enumValue}'`).join(" | ")
    );
  }
  if ("allOf" in property && property.allOf) {
    return pipe(
      A.array.traverse(E.either)(property.allOf, getType),
      E.map(types => types.join(" & "))
    );
  }
  if ("anyOf" in property && property.anyOf) {
    return pipe(
      A.array.traverse(E.either)(property.anyOf, getType),
      E.map(types => types.join(" | "))
    );
  }
  if ("oneOf" in property && property.oneOf) {
    return pipe(
      A.array.traverse(E.either)(property.oneOf, getType),
      E.map(types => types.join(" | "))
    );
  }
  if (["boolean", "number", "null", "string"].indexOf(property.type) !== -1) {
    return E.right(property.type);
  }
  if (property.type === "integer") {
    return E.right("number");
  }
  if (property.type === "object" && property.properties) {
    return pipe(
      property.properties,
      getTypeSchemas(":"),
      E.map(properties => `{${properties.join(",")}}`)
    );
  }
  return E.left(new Error(`Invalid type: ${JSON.stringify(property)}`));
}

function generate(swagger: Swagger): E.Either<Error, string> {
  return pipe(
    swagger,
    getDefinitions,
    E.chain(getTypeSchemas("=")),
    E.map(properties => properties.map(prop => `type ${prop}`).join(";"))
  );
}

export { getDefinitions, getType, generate };
