import { flow } from "fp-ts/lib/function";
import { pipe } from "fp-ts/lib/pipeable";
import { Generator } from "../models/Generator";
import {
  doIfElse,
  join,
  map,
  prefix,
  reduce,
  suffix,
  surround,
  toPascalCase
} from "../services/utils";

const getUnion = doIfElse(
  (values: string[]) => values.length === 1,
  values => values[0],
  flow(join(","), surround("t.union([", "])"))
);

const getIntersection = doIfElse(
  (values: string[]) => values.length === 1,
  values => values[0],
  flow(join(","), surround("t.intersection([", "])"))
);

const getKey = (key: string): string =>
  pipe(key, surround('"', '"'), suffix(":"));

const getType = flow(join(","), surround("t.type({", "})"));

const getPartial = flow(join(","), surround("t.partial({", "})"));

const mapRequiredAndOptional = ([required, optional]: [
  string[],
  string[]
]): string[] =>
  [
    required.length > 0 ? getType(required) : null,
    optional.length > 0 ? getPartial(optional) : null
  ].filter(value => value !== null) as string[];

const splitRequiredAndOptional = reduce<PropertyModel, [string[], string[]]>(
  ([required, optional], { property, isRequired }) => {
    return isRequired
      ? [[...required, property], optional]
      : [required, [...optional, property]];
  },
  [[], []]
);

type PropertyModel = {
  isRequired: boolean;
  property: string;
};

export const codecGenerator: Generator<PropertyModel> = {
  getTypeString: () => "t.string",
  getTypeNumber: () => "t.number",
  getTypeInteger: () => "t.number",
  getTypeBoolean: () => "t.boolean",
  getTypeEnum: flow(map(surround("t.literal('", "')")), getUnion),
  getTypeArray: surround("t.array(", ")"),
  getTypeAnyOf: getUnion,
  getTypeOneOf: getUnion,
  getTypeAllOf: getIntersection,
  getTypeObject: flow(
    splitRequiredAndOptional,
    mapRequiredAndOptional,
    doIfElse(values => values.length > 0, getIntersection, getType)
  ),
  getTypeReference: toPascalCase,
  getProperty: (key, isRequired) =>
    flow(prefix(getKey(key)), property => ({ isRequired, property })),
  getTypeUnknown: () => "t.unknown",
  addHeader: flow(
    prefix('"use strict";import * as t from "io-ts";'),
    prefix("/* eslint-disable @typescript-eslint/camelcase */"),
    prefix("/* eslint-disable @typescript-eslint/no-use-before-define */"),
    prefix("/* eslint-disable no-var */")
  ),
  combineTypes: flow(join(";")),
  getTypeDefinition: key =>
    surround(
      `export const ${toPascalCase(key)}:t.Type<${toPascalCase(
        key
      )}>=t.recursion('${toPascalCase(key)}',()=>`,
      ")"
    ),
  makeTypeNullable: type => getUnion([type, "t.null"])
};
