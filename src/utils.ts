import merge from "deepmerge";
import { Swagger } from "./models/Swagger";

export function doIf<T, V>(
  checkValue: (value: V) => boolean,
  doIfTrue: (value: V) => T,
  doIfFalse: (value: V) => T
) {
  return function(value: V): T {
    return checkValue(value) ? doIfTrue(value) : doIfFalse(value);
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
