import { Schemas } from "./Swagger";
export interface ProgramConfig {
    destination: string;
    source: string;
    exitOnInvalidType: boolean;
    type: "Flow" | "TypeScript";
    patchSource: string | Partial<Schemas> | undefined;
}
