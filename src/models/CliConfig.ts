export interface CliConfig {
  destination: string;
  url: string;
  exitOnInvalidType: boolean;
  type: "Flow" | "TypeScript";
}
