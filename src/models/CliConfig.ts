export interface CliConfig {
  destination: string;
  source: string;
  exitOnInvalidType: boolean;
  type: "Flow" | "TypeScript";
  patchSource: string | undefined;
}
