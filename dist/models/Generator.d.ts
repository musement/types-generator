export interface StringOpt {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
}
export interface ArrayOpt {
    minItems?: number;
    maxItems?: number;
}
export interface Generator<T = string> {
    getTypeString: (options: StringOpt) => string;
    getTypeNumber: () => string;
    getTypeInteger: () => string;
    getTypeBoolean: () => string;
    getTypeEnum: (enumValues: string[]) => string;
    getTypeArray: (itemType: string, options: ArrayOpt) => string;
    getTypeAnyOf: (values: string[]) => string;
    getTypeOneOf: (values: string[]) => string;
    getTypeAllOf: (array: string[]) => string;
    getTypeObject: (properties: T[]) => string;
    getTypeReference: (name: string) => string;
    getProperty: (key: string, isRequired: boolean) => (type: string) => T;
    getTypeUnknown: () => string;
    addHeader: (content: string) => string;
    combineTypes: (types: string[]) => string;
    getTypeDefinition: (name: string) => (type: string) => string;
    makeTypeNullable: (type: string) => string;
}
