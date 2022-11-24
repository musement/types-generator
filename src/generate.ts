/* eslint-disable @typescript-eslint/no-use-before-define */
import { Swagger, Property } from "./models/Swagger";
import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { Options } from "./models/Options";
import { flow, identity, constant, pipe } from "fp-ts/lib/function";
import { doIf, prefix, replace } from "./services/utils";
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
  isBoolean,
} from "./type-guards";
import { isString } from "./type-guards";
import { AllOfProperty } from "./models/SchemaObject";
import { Generator } from "./models/Generator";
import { typeScriptGenerator } from "./generators/typescriptGenerator";
import { flowGenerator } from "./generators/flowGenerator";
import { codecGenerator } from "./generators/codecGenerator";

type TypeResult = E.Either<Error, string>;

const traverseArray = A.Traversable.traverse(E.Applicative);

function getGenerator({ type }: Options): Generator<unknown> {
  return {
    TypeScript: typeScriptGenerator,
    Flow: flowGenerator,
    CodecIoTs: codecGenerator,
  }[type] as Generator<unknown>;
}

function getDefinitions(
  swagger: Swagger
): E.Either<Error, { [key: string]: Property }> {
  return swagger.components
    ? E.right(swagger.components.schemas)
    : E.left(new Error("There is no definition"));
}

function getReferenceName(options: Options): (ref: string) => string {
  return flow(
    replace("#/components/schemas/", ""),
    getGenerator(options).getTypeReference
  );
}

function isRequired(
  key: string,
  requiredFields: string[] | undefined
): boolean {
  return requiredFields != null && requiredFields.indexOf(key) !== -1;
}

function isNullable(property: Property): () => boolean {
  return constant(property.nullable === true);
}

function fixErrorsOnProperty(property: Property): Property {
  if ("allOf" in property && "type" in property) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { allOf, ...otherProperties } = property as any;
    return {
      allOf: [...allOf, { ...otherProperties } as Property],
    };
  }
  if ("oneOf" in property && "type" in property) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { oneOf, ...otherProperties } = property as any;
    return {
      oneOf: [...oneOf, { ...otherProperties } as Property],
    };
  }
  if ("anyOf" in property && "type" in property) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { anyOf, ...otherProperties } = property as any;
    return {
      anyOf: [...anyOf, { ...otherProperties } as Property],
    };
  }
  return property;
}

function getInvalidType(options: Options) {
  return function (property: Property): TypeResult {
    return options.exitOnInvalidType
      ? E.left(new Error(`Invalid type: ${JSON.stringify(property)}`))
      : E.right(getGenerator(options).getTypeUnknown());
  };
}

function getPropertyHandler<T extends Property>(
  isT: (property: Property) => property is T,
  handleT: (options: Options) => (property: T) => TypeResult
) {
  return function (options: Options) {
    return function (property: Property): E.Either<TypeResult, Property> {
      return isT(property)
        ? E.left(handleT(options)(property))
        : E.right(property);
    };
  };
}

function isValidAllOf(property: Property): property is AllOfProperty {
  return (
    isAllOf(property) &&
    property.allOf.every((subprop) => isReference(subprop) || isObject(subprop))
  );
}

const getTypeRef = getPropertyHandler(
  isReference,
  (options) =>
    (property): TypeResult =>
      E.right(getReferenceName(options)(property.$ref))
);

const getTypeAllOf = getPropertyHandler(
  isValidAllOf,
  (options) =>
    (property): TypeResult =>
      pipe(
        traverseArray(property.allOf, getType(options)),
        E.map(getGenerator(options).getTypeAllOf)
      )
);
const getTypeOneOf = getPropertyHandler(
  isOneOf,
  (options) =>
    (property): TypeResult =>
      pipe(
        traverseArray(property.oneOf, getType(options)),
        E.map(getGenerator(options).getTypeOneOf)
      )
);
const getTypeAnyOf = getPropertyHandler(
  isAnyOf,
  (options) =>
    (property): TypeResult =>
      pipe(
        traverseArray(property.anyOf, getType(options)),
        E.map(getGenerator(options).getTypeAnyOf)
      )
);
const getTypeArray = getPropertyHandler(
  isArray,
  (options) =>
    (property): TypeResult => {
      // wrap with array length if have min/max length
      const { items, ...rest } = property;

      return pipe(
        items,
        getType(options),
        E.map((itemType: string) =>
          getGenerator(options).getTypeArray(itemType, rest)
        )
      );
    }
);
const getTypeEnum = getPropertyHandler(
  isEnum,
  (options) =>
    (property): TypeResult =>
      E.right(getGenerator(options).getTypeEnum(property.enum))
);
const getTypeInteger = getPropertyHandler(
  isInteger,
  (options) =>
    (itemTyp): TypeResult =>
      E.right(getGenerator(options).getTypeInteger(itemTyp))
);
const getTypeNumber = getPropertyHandler(
  isNumber,
  (options) =>
    (itemTyp): TypeResult =>
      E.right(getGenerator(options).getTypeNumber(itemTyp))
);
const getTypeString = getPropertyHandler(
  isString,
  (options) =>
    (itemType): TypeResult =>
      E.right(getGenerator(options).getTypeString(itemType))
);
const getTypeBoolean = getPropertyHandler(
  isBoolean,
  (options) => (): TypeResult => E.right(getGenerator(options).getTypeBoolean())
);
const getTypeObject = getPropertyHandler(
  isObject,
  (options) =>
    (property): TypeResult =>
      pipe(
        traverseArray(
          Object.entries(property.properties || {}),
          ([key, childProperty]) =>
            pipe(
              childProperty,
              getType(options),
              E.map(
                getGenerator(options).getProperty(
                  key,
                  isRequired(key, property.required)
                )
              )
            )
        ),
        E.map(getGenerator(options).getTypeObject)
      )
);

function getType(options: Options) {
  return function (property: Property): TypeResult {
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
      E.map(doIf(isNullable(property), getGenerator(options).makeTypeNullable))
    );
  };
}

function checkOpenApiVersion(swagger: Swagger): E.Either<Error, Swagger> {
  return swagger.openapi.match(/3\.0\.\d+/)
    ? E.right(swagger)
    : E.left(new Error(`Version not supported: ${swagger.openapi}`));
}

function getTypesFromSchemas(options: Options) {
  return function (schemas: {
    [key: string]: Property;
  }): E.Either<Error, string[]> {
    return traverseArray(Object.entries(schemas), ([key, property]) =>
      E.map(getGenerator(options).getTypeDefinition(key))(
        getType(options)(property)
      )
    );
  };
}

const eitherPrefix =
  (b: E.Either<Error, string>) =>
  (c: E.Either<Error, string>): E.Either<Error, string> => {
    return E.ap(c)(E.map(prefix)(b));
  };

function baseDefinitionsToString(
  options: Options
): (schemas: { [key: string]: Property }) => E.Either<Error, string> {
  return flow(
    getTypesFromSchemas(options),
    E.map(getGenerator(options).combineTypes)
  );
}

function definitionsToString(options: Options) {
  return (schemas: { [key: string]: Property }): E.Either<Error, string> => {
    return pipe(
      baseDefinitionsToString(options)(schemas),
      doIf(
        constant(options.type === "CodecIoTs"),
        flow(
          E.map(prefix(";")),
          eitherPrefix(
            baseDefinitionsToString({ ...options, type: "TypeScript" })(schemas)
          )
        )
      )
    );
  };
}

function generate(
  options: Options
): (swagger: Swagger) => E.Either<Error, string> {
  return flow(
    checkOpenApiVersion,
    E.chain(getDefinitions),
    E.chain(definitionsToString(options)),
    E.map(getGenerator(options).addHeader)
  );
}

export { getDefinitions, getType, generate };
