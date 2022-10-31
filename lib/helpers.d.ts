import { SourceFile } from 'ts-morph';
export declare const generatetRPCRouterImport: (sourceFile: SourceFile, trpcPath: string) => void;
export declare const generatetRPCProcedureImport: (sourceFile: SourceFile, trpcPath: string) => void;
export declare const generateProcedureImports: (sourceFile: SourceFile, name: string, hasCreateMany: boolean, provider: string) => void;
export declare const generateRouterImport: (sourceFile: SourceFile, modelNamePlural: string, modelNameCamelCase: string) => void;
export declare const generateProcedureSchemaImports: (sourceFile: SourceFile, opName: string, modelName: string) => void;
export declare function generateProcedure(sourceFile: SourceFile, name: string, modelName: string, opType: string): void;
export declare const getInputTypeByOpName: (opName: string, modelName: string) => string;
export declare const getProcedureTypeByOpName: (opName: string) => string;
