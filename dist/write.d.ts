import * as TE from "fp-ts/lib/TaskEither";
declare function write(filename: string): (types: string) => TE.TaskEither<Error, void>;
export { write };
