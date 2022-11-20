import * as t from "io-ts";

// function StringPatternC(pattern: string) {
//   return t.string.pipe(
//     new t.Type(
//       'StringPatternC',
//       (i: unknown) =>
//         t.string.is(i) && new RegExp(pattern).test(i),
//       (i, c) => {
//         if (!t.string.is(i)) return t.failure(i, c);
//         if (!new RegExp(pattern).test(i))
//           return t.failure(i, c, i + ' not in format: ' + pattern);
//         return t.success(i);
//       }
//     )
//   );
// }

function MinMaxArrayC<C extends t.Mixed>(min: number, max: number, a: C) {
  return t.array(a).pipe(
    new t.Type<t.TypeOf<C>[], t.TypeOf<C>[], C[]>(
      "MinMaxArrayC",
      (u): u is t.TypeOf<C>[] =>
        t.array(a).is(u) && min <= u.length && u.length <= max,
      (i, c) => {
        if (!t.array(a).is(i) || i.length < min || i.length > max)
          return t.failure(i, c);

        return t.success(i);
      },
      t.identity
    )
  );
}
