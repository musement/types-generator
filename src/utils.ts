import merge from "deepmerge";
import { Swagger } from "./models/Swagger";
import { flow } from "fp-ts/lib/function";

export function doIfElse<T, V>(
  checkValue: (value: V) => boolean,
  doIfTrue: (value: V) => T,
  doIfFalse: (value: V) => T
) {
  return function(value: V): T {
    return checkValue(value) ? doIfTrue(value) : doIfFalse(value);
  };
}

export function doIf<T>(
  checkValue: (value: T) => boolean,
  doIfTrue: (value: T) => T
): (value: T) => T {
  return function(value: T): T {
    return checkValue(value) ? doIfTrue(value) : value;
  };
}

export function patch(swagger: Swagger) {
  return function(toApply: {}): Swagger {
    return merge(
      swagger,
      { components: { schemas: { ...toApply } } },
      {
        arrayMerge: (destination, source) => source
      }
    );
  };
}

export function join(separator: string) {
  return function(array: string[]): string {
    return array.join(separator);
  };
}

export function map<T>(fn: (item: string, index: number) => T) {
  return function(array: string[]): T[] {
    return array.map(fn);
  };
}

export function split(separator: string) {
  return function(value: string): string[] {
    return value.split(separator);
  };
}

export function prefix(start: string) {
  return function(value: string): string {
    return start + value;
  };
}

export function suffix(end: string) {
  return function(value: string): string {
    return value + end;
  };
}

export function surround(
  start: string,
  end: string
): (value: string) => string {
  return flow(prefix(start), suffix(end));
}

export function replace(searchValue: string, replaceValue: string) {
  return function(value: string): string {
    return value.replace(searchValue, replaceValue);
  };
}

export const toCamelCase = flow(
  split("-"),
  map((token, index) =>
    index === 0 ? token : token[0].toUpperCase() + token.slice(1)
  ),
  join("")
);

export const toPascalCase = flow(
  split("-"),
  map(token => token[0].toUpperCase() + token.slice(1)),
  join("")
);
