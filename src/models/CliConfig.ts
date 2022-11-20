import { BuiltInParserName } from "prettier";

export interface CliConfig {
  destination: string;
  source: string;
  exitOnInvalidType: boolean;
  type: "Flow" | "TypeScript" | "CodecIoTs";
  patchSource: string | undefined;
  parser: BuiltInParserName;
}
