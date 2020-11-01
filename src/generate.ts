/* eslint-disable @typescript-eslint/no-use-before-define */
import { Swagger, Property } from "./models/Swagger";
import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import { Options } from "./models/Options";
import { flow, identity, constant } from "fp-ts/lib/function";
import { doIf, replace } from "./services/utils";
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
import { AllOfProperty } from "./models/SchemaObject";
import { Generator } from "./models/Generator";
import { typeScriptGenerator } from "./generators/typescriptGenerator";
import { flowGenerator } from "./generators/flowGenerator";
import { codecGenerator } from "./generators/codecGenerator";
import { doIfElse } from "./services/utils";

type TypeResult = E.Either<Error, string>;
interface GenerateOptions {
  exitOnInvalidType: boolean;
  generator: Generator<unknown>;
}

const traverseArray = A.array.traverse(E.either);

function getDefinitions(
  swagger: Swagger
): E.Either<Error, { [key: string]: Property }> {
  return swagger.components
    ? E.right(swagger.components.schemas)
    : E.left(new Error("There is no definition"));
}

function getReferenceName(options: GenerateOptions): (ref: string) => string {
  return flow(
    replace("#/components/schemas/", ""),
    options.generator.getTypeReference
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
      allOf: [...allOf, { ...otherProperties } as Property]
    };
  }
  if ("oneOf" in property && "type" in property) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { oneOf, ...otherProperties } = property as any;
    return {
      oneOf: [...oneOf, { ...otherProperties } as Property]
    };
  }
  if ("anyOf" in property && "type" in property) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { anyOf, ...otherProperties } = property as any;
    return {
      anyOf: [...anyOf, { ...otherProperties } as Property]
    };
  }
  return property;
}

function getInvalidType({ generator, exitOnInvalidType }: GenerateOptions) {
  return function(property: Property): TypeResult {
    return exitOnInvalidType
      ? E.left(new Error(`Invalid type: ${JSON.stringify(property)}`))
      : E.right(generator.getTypeUnknown());
  };
}

function getPropertyHandler<T extends Property>(
  isT: (property: Property) => property is T,
  handleT: (options: GenerateOptions) => (property: T) => TypeResult
) {
  return function(options: GenerateOptions) {
    return function(property: Property): E.Either<TypeResult, Property> {
      return isT(property)
        ? E.left(handleT(options)(property))
        : E.right(property);
    };
  };
}

function isValidAllOf(property: Property): property is AllOfProperty {
  return (
    isAllOf(property) &&
    property.allOf.every(subprop => isReference(subprop) || isObject(subprop))
  );
}

const getTypeRef = getPropertyHandler(
  isReference,
  options => (property): TypeResult =>
    E.right(getReferenceName(options)(property.$ref))
);

const getTypeAllOf = getPropertyHandler(
  isValidAllOf,
  options => (property): TypeResult =>
    pipe(
      traverseArray(property.allOf, getType(options)),
      E.map(options.generator.getTypeAllOf)
    )
);
const getTypeOneOf = getPropertyHandler(
  isOneOf,
  options => (property): TypeResult =>
    pipe(
      traverseArray(property.oneOf, getType(options)),
      E.map(options.generator.getTypeOneOf)
    )
);
const getTypeAnyOf = getPropertyHandler(
  isAnyOf,
  options => (property): TypeResult =>
    pipe(
      traverseArray(property.anyOf, getType(options)),
      E.map(options.generator.getTypeAnyOf)
    )
);
const getTypeArray = getPropertyHandler(
  isArray,
  options => (property): TypeResult =>
    pipe(
      property.items,
      getType(options),
      E.map(options.generator.getTypeArray)
    )
);
const getTypeEnum = getPropertyHandler(
  isEnum,
  ({ generator }) => (property): TypeResult =>
    E.right(generator.getTypeEnum(property.enum))
);
const getTypeInteger = getPropertyHandler(
  isInteger,
  ({ generator }) => (): TypeResult => E.right(generator.getTypeInteger())
);
const getTypeNumber = getPropertyHandler(
  isNumber,
  ({ generator }) => (): TypeResult => E.right(generator.getTypeNumber())
);
const getTypeString = getPropertyHandler(
  isString,
  ({ generator }) => (): TypeResult => E.right(generator.getTypeString())
);
const getTypeBoolean = getPropertyHandler(
  isBoolean,
  ({ generator }) => (): TypeResult => E.right(generator.getTypeBoolean())
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
            E.map(
              options.generator.getProperty(
                key,
                isRequired(key, property.required)
              )
            )
          )
      ),
      E.map(options.generator.getTypeObject)
    )
);

function getType(options: GenerateOptions) {
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
      E.map(doIf(isNullable(property), options.generator.makeTypeNullable))
    );
  };
}

function getTypesFromSchemas(options: GenerateOptions) {
  return function(schemas: {
    [key: string]: Property;
  }): E.Either<Error, string[]> {
    return pipe(
      traverseArray(Object.entries(schemas), ([key, property]) =>
        pipe(
          getType(options)(property),
          E.map(options.generator.getTypeDefinition(key))
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

function getGenerateOptions({
  exitOnInvalidType,
  type
}: Options): GenerateOptions {
  return {
    exitOnInvalidType,
    generator: {
      TypeScript: typeScriptGenerator,
      Flow: flowGenerator,
      CodecIoTs: codecGenerator
    }[type] as Generator<unknown>
  };
}

function schemasToString(
  options: GenerateOptions
): (schemas: { [key: string]: Property }) => E.Either<Error, string> {
  return flow(
    getTypesFromSchemas(options),
    E.map(options.generator.combineTypes)
  );
}

function schemasToStringForCodecs(
  options: GenerateOptions
): (schemas: { [key: string]: Property }) => E.Either<Error, string> {
  return (schemas): E.Either<Error, string> => {
    return pipe(
      [
        schemasToString({
          ...options,
          generator: typeScriptGenerator as Generator<unknown>
        })(schemas),
        schemasToString(options)(schemas)
      ],
      A.array.sequence(E.either),
      E.map(values => values.join(";"))
    );
  };
}

function generate(
  options: Options
): (swagger: Swagger) => E.Either<Error, string> {
  return flow(
    checkOpenApiVersion,
    E.chain(getDefinitions),
    doIfElse(
      constant(options.type === "CodecIoTs"),
      E.chain(schemasToStringForCodecs(getGenerateOptions(options))),
      E.chain(schemasToString(getGenerateOptions(options)))
    ),
    E.map(getGenerateOptions(options).generator.addHeader)
  );
}

export { getDefinitions, getType, generate };
