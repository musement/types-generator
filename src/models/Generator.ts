export interface Generator<T = string> {
  getTypeString: () => string;
  getTypeNumber: () => string;
  getTypeInteger: () => string;
  getTypeBoolean: () => string;
  getTypeEnum: (enumValues: string[]) => string;
  getTypeArray: (itemType: string) => string;
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
