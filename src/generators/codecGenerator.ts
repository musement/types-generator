import { flow } from "fp-ts/lib/function";
import { pipe } from "fp-ts/lib/pipeable";
import { ArrayOpt, Generator, StringOpt } from "../models/Generator";
import {
  doIfElse,
  join,
  map,
  prefix,
  reduce,
  suffix,
  surround,
  toPascalCase,
} from "../services/utils";

const getUnion = doIfElse(
  (values: string[]) => values.length === 1,
  (values) => values[0],
  flow(join(","), surround("t.union([", "])"))
);

const getIntersection = doIfElse(
  (values: string[]) => values.length === 1,
  (values) => values[0],
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
    optional.length > 0 ? getPartial(optional) : null,
  ].filter((value) => value !== null) as string[];

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
const safeSurroundEnum = (item: string): string => {
  if (item.indexOf("'") !== -1) {
    return surround('t.literal("', '")')(item);
  }
  return surround("t.literal('", "')")(item);
};
export const codecGenerator: Generator<PropertyModel> = {
  getTypeString: (options: StringOpt) => {
    if (options.maxLength != null || options.minLength != null)
      return `StringLengthC(${options.minLength}, ${options.maxLength})`;

    if (options.pattern != null)
      return surround("StringPatternC(`", "`)")(options.pattern);

    return "t.string";
  },
  getTypeNumber: (opt) => {
    if (opt.maximum == null && opt.minimum == null) return "t.number";
    // apply min/max
    return `MinMaxNumberC(${opt.minimum}, ${opt.maximum})`;
  },
  getTypeInteger: (opt) => {
    if (opt.maximum == null && opt.minimum == null) return "IntegerC";
    // apply min/max
    return `MinMaxIntC(${opt.minimum}, ${opt.maximum})`;
  },
  getTypeBoolean: () => "t.boolean",
  getTypeEnum: flow(map(safeSurroundEnum), getUnion),
  getTypeArray: (itemType: string, options: ArrayOpt) => {
    if (options.maxItems == null && options.minItems == null)
      return surround("t.array(", ")")(itemType);
    return surround(
      "MinMaxArrayC(",
      `, ${options.minItems}, ${options.maxItems})`
    )(itemType);
  },
  getTypeAnyOf: getUnion,
  getTypeOneOf: getUnion,
  getTypeAllOf: getIntersection,
  getTypeObject: flow(
    splitRequiredAndOptional,
    mapRequiredAndOptional,
    doIfElse((values) => values.length > 0, getIntersection, getType)
  ),
  getTypeReference: toPascalCase,
  getProperty: (key, isRequired) =>
    flow(prefix(getKey(key)), (property) => ({ isRequired, property })),
  getTypeUnknown: () => "t.unknown",
  addHeader: flow(
    // Note: Flow only allow max 9 functions
    // add integer
    // add min max Int
    prefix(`
    const IntegerC = t.number.pipe(
      new t.Type<number, number, number>(
        'IntegerC',
        (i: unknown): i is number =>
          t.number.is(i) &&
          Number.isInteger(i),
        (i, c) => {
          if (!t.number.is(i)) return t.failure(i, c);
          if (!Number.isInteger(i)) return t.failure(i, c, \`\${i} is not an integer\`);
             
          return t.success(i);
        },
        Number
      )
    );\n
    function MinMaxIntC(min?: number, max?: number) {
      return t.number.pipe(
        new t.Type<number, number, number>(
          'MinMaxIntC',
          (i: unknown): i is number =>
            t.number.is(i) &&
            Number.isInteger(i) &&
            (min == null || min <= i) &&
            (max == null || max >= i),
          (i, c) => {
            if (!t.number.is(i)) return t.failure(i, c);
            if (!Number.isInteger(i)) return t.failure(i, c, \`\${i} is not an integer\`);
            if (min != null && i < min) return t.failure(i, c, \`\${i} < \${min}\`);
            if (max != null && i > max) return t.failure(i, c, \`\${i} > \${max}\`);
    
            return t.success(i);
          },
          Number
        )
      );
    };\n
    // add min max number
    function MinMaxNumberC(min?: number, max?: number) {
      return t.number.pipe(
        new t.Type<number, number, number>(
          'MinMaxNumberC',
          (i: unknown): i is number =>
            t.number.is(i) &&
            (min == null || min <= i) &&
            (max == null || max >= i),
          (i, c) => {
            if (!t.number.is(i)) return t.failure(i, c);
            if (min != null && i < min)
              return t.failure(i, c, \`\${i} < \${min}\`);
            if (max != null && i > max)
              return t.failure(i, c, \`\${i} > \${max}\`);
    
            return t.success(i);
          },
          Number
        )
      );
    };\n`),
    // add string length
    prefix(`function StringLengthC(min?: number, max?: number) {
      return t.string.pipe(
        new t.Type<string, string, string>(
          'StringLengthC',
          (i: unknown): i is string =>
            t.string.is(i) &&
            (min == null || min <= i.length) &&
            (max == null || max >= i.length),
          (i, c) => {
            if (!t.string.is(i)) return t.failure(i, c);
            if (min != null && i.length < min)
              return t.failure(i, c, \`\${i} has length of: \${i.length} < \${min}\`);
            if (max != null && i.length > max)
              return t.failure(i, c, \`\${i} has length of: \${i.length} > \${max}\`);
    
            return t.success(i);
          },
          String
        )
      );
    };\n`),
    // add string pattern
    prefix(`function StringPatternC(pattern: string) {
      return t.string.pipe(
        new t.Type<string, string, string>(
          'StringPatternC',
          (i: unknown): i is string => t.string.is(i) && new RegExp(pattern).test(i),
          (i, c) => {
            if (!t.string.is(i)) return t.failure(i, c);
            if (!new RegExp(pattern).test(i))
              return t.failure(i, c, \`\${i} not in format: \${pattern}\`);
            return t.success(i);
          },
          String
        )
      );
    };\n`),
    //   // add MinMaxArrayType
    prefix(
      `function MinMaxArrayC<C extends t.Mixed>(a: C, min?: number, max?: number) {
        return t.array(a).pipe(
          new t.Type<t.TypeOf<C>[], t.TypeOf<C>[], C[]>(
            'MinMaxArrayC',
            (u): u is t.TypeOf<C>[] =>
              t.array(a).is(u) &&
              (min ?? 0) <= u.length &&
              (max == null || u.length <= max),
            (i, c) => {
              if (!t.array(a).is(i)) return t.failure(i, c);
              if (min != null && i.length < min)
                return t.failure(
                  i,
                  c,
                  \`Array length should be >= : \${min}, Got: \${i.length}\`
                );
      
              if (max != null && i.length > max)
                return t.failure(
                  i,
                  c,
                  \`Array length should be <= : \${max}, Got: \${i.length}\`
                );
      
              return t.success(i);
            },
            t.identity
          )
        );
      };\n`
    ),
    prefix('\n"use strict";\nimport * as t from "io-ts";\n'),
    prefix("/* eslint-disable @typescript-eslint/camelcase */\n"),
    prefix("/* eslint-disable @typescript-eslint/no-use-before-define */\n"),
    prefix("/* eslint-disable no-var */\n")
  ),
  combineTypes: flow(join(";")),
  getTypeDefinition: (key) =>
    surround(
      `export const ${toPascalCase(key)}:t.Type<${toPascalCase(
        key
      )}>=t.recursion('${toPascalCase(key)}',()=>`,
      ")"
    ),
  makeTypeNullable: (type) => getUnion([type, "t.null"]),
};
