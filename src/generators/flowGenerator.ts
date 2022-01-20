import { constant, flow, not } from "fp-ts/lib/function";
import { pipe } from "fp-ts/lib/pipeable";
import { Generator } from "../models/Generator";
import {
  doIf,
  join,
  map,
  prefix,
  suffix,
  surround,
  toPascalCase
} from "../services/utils";
const safeSurroundEnum = (item: string): string => {
  if (item.indexOf("'") !== -1) {
    return surround('"', '"')(item);
  }
  return surround("'", "'")(item);
};
export const flowGenerator: Generator = {
  getTypeString: () => "string",
  getTypeNumber: () => "number",
  getTypeInteger: () => "number",
  getTypeBoolean: () => "boolean",
  getTypeEnum: flow(map(safeSurroundEnum), join("|")),
  getTypeArray: surround("Array<", ">"),
  getTypeAnyOf: join("|"),
  getTypeOneOf: join("|"),
  getTypeAllOf: flow(map(prefix("...")), join(","), surround("{|", "|}")),
  getTypeObject: flow(join(","), surround("{|", "|}")),
  getTypeReference: toPascalCase,
  getProperty: (key, isRequired) =>
    pipe(
      key,
      surround('"', '"'),
      doIf(not(constant(isRequired)), suffix("?")),
      suffix(":"),
      prefix
    ),
  getTypeUnknown: constant("mixed"),
  addHeader: prefix("// @flow strict\n"),
  combineTypes: join(";"),
  getTypeDefinition: key => prefix(`export type ${toPascalCase(key)}=`),
  makeTypeNullable: flow(suffix("|null"), surround("(", ")"))
};
