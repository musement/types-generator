import { Schemas } from "./Swagger";

export interface ProgramConfig {
  destination: string;
  source: string;
  exitOnInvalidType: boolean;
  type: "Flow" | "TypeScript" | "CodecIoTs";
  patchSource: string | Partial<Schemas> | undefined;
}
