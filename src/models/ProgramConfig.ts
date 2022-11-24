import { BuiltInParserName } from "prettier";
import { Schemas } from "./Swagger";

export interface ProgramConfig {
  destination: string;
  source: string;
  exitOnInvalidType: boolean;
  type: "Flow" | "TypeScript" | "CodecIoTs";
  parser: BuiltInParserName;
  patchSource: string | Partial<Schemas> | undefined;
}
