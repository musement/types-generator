/* eslint-disable @typescript-eslint/no-use-before-define */
import { Swagger, Property } from "./models/Swagger";
import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import { Options } from "./models/Options";
import { flow, identity } from "fp-ts/lib/function";
import { join, toCamelCase, map } from "./utils";
import {
  isReference,
  isAllOf,
  isOneOf,
  isAnyOf,
  isArray,
  isEnum,
  isInteger,
  isObject,
  isNumber,
  isBoolean
} from "./type-guards";
import { isString } from "./type-guards";

type TypeResult = E.Either<Error, string>;

const traverseArray = A.array.traverse(E.either);

function getDefinitions(
  swagger: Swagger
): E.Either<Error, { [key: string]: Property }> {
  return swagger.components
    ? E.right(swagger.components.schemas)
    : E.left(new Error("There is no definition"));
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

function getTypeUnknown(options: Options): string {
  return options.type === "TypeScript" ? "unknown" : "mixed";
}

function makeTypeNullable(property: Property) {
  return function(type: string): string {
    return property.nullable ? `(${type}|null)` : type;
  };
}

function fixErrorsOnProperty(property: Property): Property {
  if ("allOf" in property && "type" in property) {
    const { allOf, ...otherProperties } = property;
    return {
      allOf: [...allOf, { ...otherProperties } as Property]
    };
  }
  if ("oneOf" in property && "type" in property) {
    const { oneOf, ...otherProperties } = property;
    return {
      oneOf: [...oneOf, { ...otherProperties } as Property]
    };
  }
  if ("anyOf" in property && "type" in property) {
    const { anyOf, ...otherProperties } = property;
    return {
      anyOf: [...anyOf, { ...otherProperties } as Property]
    };
  }
  return property;
}

function getInvalidType(options: Options) {
  return function(property: Property): E.Either<Error, string> {
    return options.exitOnInvalidType
      ? E.left(new Error(`Invalid type: ${JSON.stringify(property)}`))
      : E.right(getTypeUnknown(options));
  };
}

function getPropertyHandler<T extends Property>(
  isT: (property: Property) => property is T,
  handleT: (options: Options) => (property: T) => TypeResult
) {
  return function(options: Options) {
    return function(property: Property): E.Either<TypeResult, Property> {
      return isT(property)
        ? E.left(handleT(options)(property))
        : E.right(property);
    };
  };
}

const getTypeRef = getPropertyHandler(
  isReference,
  () => (property): TypeResult => E.right(getReferenceName(property.$ref))
);
const getTypeAllOf = getPropertyHandler(
  isAllOf,
  options => (property): TypeResult =>
    pipe(traverseArray(property.allOf, getType(options)), E.map(join("&")))
);
const getTypeOneOf = getPropertyHandler(
  isOneOf,
  options => (property): TypeResult =>
    pipe(traverseArray(property.oneOf, getType(options)), E.map(join("|")))
);
const getTypeAnyOf = getPropertyHandler(
  isAnyOf,
  options => (property): TypeResult =>
    pipe(traverseArray(property.anyOf, getType(options)), E.map(join("|")))
);
const getTypeArray = getPropertyHandler(
  isArray,
  options => (property): TypeResult =>
    pipe(
      property.items,
      getType(options),
      E.map(type => `Array<${type}>`)
    )
);
const getTypeEnum = getPropertyHandler(isEnum, () => (property): TypeResult =>
  E.right(property.enum.map(enumValue => `'${enumValue}'`).join("|"))
);
const getTypeInteger = getPropertyHandler(isInteger, () => (): TypeResult =>
  E.right("number")
);
const getTypeNumber = getPropertyHandler(isNumber, () => (): TypeResult =>
  E.right("number")
);
const getTypeString = getPropertyHandler(isString, () => (): TypeResult =>
  E.right("string")
);
const getTypeBoolean = getPropertyHandler(isBoolean, () => (): TypeResult =>
  E.right("boolean")
);
const getTypeObject = getPropertyHandler(
  isObject,
  options => (property): TypeResult =>
    pipe(
      traverseArray(
        Object.entries(property.properties || {}),
        ([key, childProperty]) =>
          pipe(
            childProperty,
            getType(options),
            E.map(concatKeyAndType(key, isRequired(key, property.required)))
          )
      ),
      E.map(getExactObject(options))
    )
);

function getType(options: Options) {
  return function(property: Property): TypeResult {
    return pipe(
      property,
      fixErrorsOnProperty,
      flow(
        getTypeRef(options),
        E.chain(getTypeAllOf(options)),
        E.chain(getTypeAnyOf(options)),
        E.chain(getTypeOneOf(options)),
        E.chain(getTypeArray(options)),
        E.chain(getTypeObject(options)),
        flow(
          E.chain(getTypeEnum(options)),
          E.chain(getTypeNumber(options)),
          E.chain(getTypeString(options)),
          E.chain(getTypeBoolean(options)),
          E.chain(getTypeInteger(options))
        )
      ),
      E.fold(identity, getInvalidType(options)),
      E.map(makeTypeNullable(property))
    );
  };
}

function getTypesFromSchemas(options: Options) {
  return function(schemas: {
    [key: string]: Property;
  }): E.Either<Error, string[]> {
    return pipe(
      traverseArray(Object.entries(schemas), ([key, property]) =>
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

function addHeader(options: Options) {
  return function(content: string): string {
    return (
      (options.type === "TypeScript" ? '"use strict";' : "// @flow strict") +
      `\n${content}`
    );
  };
}

function generate(options: Options) {
  return function(swagger: Swagger): TypeResult {
    return pipe(
      swagger,
      checkOpenApiVersion,
      E.chain(getDefinitions),
      E.chain(getTypesFromSchemas(options)),
      E.map(
        flow(
          map(prop => `export type ${prop}`),
          join(";")
        )
      ),
      E.map(addHeader(options))
    );
  };
}

export { getDefinitions, getType, generate };
