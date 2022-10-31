"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProcedureTypeByOpName = exports.getInputTypeByOpName = exports.generateProcedure = exports.generateProcedureSchemaImports = exports.generateRouterImport = exports.generateProcedureImports = exports.generatetRPCProcedureImport = exports.generatetRPCRouterImport = void 0;
const uncapitalizeFirstLetter_1 = require("./utils/uncapitalizeFirstLetter");
const generatetRPCRouterImport = (sourceFile, trpcPath) => {
    sourceFile.addImportDeclaration({
        moduleSpecifier: trpcPath,
        namedImports: ['router'],
    });
};
exports.generatetRPCRouterImport = generatetRPCRouterImport;
const generatetRPCProcedureImport = (sourceFile, trpcPath) => {
    sourceFile.addImportDeclaration({
        moduleSpecifier: trpcPath,
        namedImports: ['procedure'],
    });
};
exports.generatetRPCProcedureImport = generatetRPCProcedureImport;
const generateProcedureImports = (sourceFile, name, hasCreateMany, provider) => {
    let statements = [
        `import { findUnique${name}Procedure } from "./findUnique${name}.procedure";`,
        `import { findFirst${name}Procedure } from "./findFirst${name}.procedure";`,
        `import { findMany${name}Procedure } from "./findMany${name}.procedure";`,
        `import { createOne${name}Procedure } from "./createOne${name}.procedure";`,
    ];
    if (hasCreateMany) {
        statements.push(`import { createMany${name}Procedure } from "./createMany${name}.procedure";`);
    }
    statements = statements.concat([
        `import { deleteOne${name}Procedure } from "./deleteOne${name}.procedure";`,
        `import { updateOne${name}Procedure } from "./updateOne${name}.procedure";`,
        `import { deleteMany${name}Procedure } from "./deleteMany${name}.procedure";`,
        `import { updateMany${name}Procedure } from "./updateMany${name}.procedure";`,
        `import { upsertOne${name}Procedure } from "./upsertOne${name}.procedure";`,
        `import { aggregate${name}Procedure } from "./aggregate${name}.procedure";`,
        `import { groupBy${name}Procedure } from "./groupBy${name}.procedure";`,
    ]);
    if (provider === 'mongodb') {
        statements = statements.concat([
            `import { findRaw${name}Procedure } from "./${name}FindRaw.procedure";`,
            `import { aggregateRaw${name}Procedure } from "./${name}AggregateRaw.procedure";`,
        ]);
    }
    sourceFile.addStatements(/* ts */ statements.join('\n'));
};
exports.generateProcedureImports = generateProcedureImports;
const generateRouterImport = (sourceFile, modelNamePlural, modelNameCamelCase) => {
    sourceFile.addImportDeclaration({
        moduleSpecifier: `./${modelNameCamelCase}Router`,
        namedImports: [`${modelNamePlural}Router`],
    });
};
exports.generateRouterImport = generateRouterImport;
const generateProcedureSchemaImports = (sourceFile, opName, modelName) => {
    if (opName === 'aggregateRaw' || opName === 'findRaw') {
        sourceFile.addImportDeclaration({
            moduleSpecifier: `../../schemas/${opName}${modelName}${(0, uncapitalizeFirstLetter_1.capitalizeFirstLetter)(opName)}.schema`,
            namedImports: [
                `${modelName}${(0, uncapitalizeFirstLetter_1.capitalizeFirstLetter)(opName)}ObjectSchema`,
            ],
        });
        return;
    }
    sourceFile.addImportDeclaration({
        moduleSpecifier: `../../schemas/${opName}${modelName}.schema`,
        namedImports: [(0, exports.getInputTypeByOpName)(opName, modelName)],
    });
};
exports.generateProcedureSchemaImports = generateProcedureSchemaImports;
function generateProcedure(sourceFile, name, modelName, opType) {
    let input = 'input';
    switch (opType) {
        case 'findUnique':
            input = '{ where: input.where }';
            break;
        case 'findFirst':
        case 'findMany':
            break;
        case 'deleteOne':
            input = '{ where: input.where }';
            break;
        case 'deleteMany':
        case 'updateMany':
        case 'aggregate':
            break;
        case 'groupBy':
            input =
                '{ where: input.where, orderBy: input.orderBy, by: input.by, having: input.having, take: input.take, skip: input.skip }';
            break;
        case 'createOne':
        case 'createMany':
            input = '{ data: input.data }';
            break;
        case 'updateOne':
            input = '{ where: input.where, data: input.data }';
            break;
        case 'upsertOne':
            input =
                '{ where: input.where, create: input.create, update: input.update }';
            break;
    }
    sourceFile.addStatements(/* ts */ `
export const ${name}Procedure = procedure
  .input(${(0, exports.getInputTypeByOpName)(opType, modelName)})
  .${(0, exports.getProcedureTypeByOpName)(opType)}(async ({ ctx, input }) => {
    const ${name} = await ctx.prisma.${(0, uncapitalizeFirstLetter_1.uncapitalizeFirstLetter)(modelName)}.${opType.replace('One', '')}(${input});
    return ${name};
  })`);
}
exports.generateProcedure = generateProcedure;
const getInputTypeByOpName = (opName, modelName) => {
    let inputType;
    switch (opName) {
        case 'findUnique':
            inputType = `${modelName}FindUniqueSchema`;
            break;
        case 'findFirst':
            inputType = `${modelName}FindFirstSchema`;
            break;
        case 'findMany':
            inputType = `${modelName}FindManySchema`;
            break;
        case 'findRaw':
            inputType = `${modelName}FindRawObjectSchema`;
            break;
        case 'createOne':
            inputType = `${modelName}CreateOneSchema`;
            break;
        case 'createMany':
            inputType = `${modelName}CreateManySchema`;
            break;
        case 'deleteOne':
            inputType = `${modelName}DeleteOneSchema`;
            break;
        case 'updateOne':
            inputType = `${modelName}UpdateOneSchema`;
            break;
        case 'deleteMany':
            inputType = `${modelName}DeleteManySchema`;
            break;
        case 'updateMany':
            inputType = `${modelName}UpdateManySchema`;
            break;
        case 'upsertOne':
            inputType = `${modelName}UpsertSchema`;
            break;
        case 'aggregate':
            inputType = `${modelName}AggregateSchema`;
            break;
        case 'aggregateRaw':
            inputType = `${modelName}AggregateRawObjectSchema`;
            break;
        case 'groupBy':
            inputType = `${modelName}GroupBySchema`;
            break;
        default:
            console.log('getInputTypeByOpName: ', { opName, modelName });
    }
    return inputType;
};
exports.getInputTypeByOpName = getInputTypeByOpName;
const getProcedureTypeByOpName = (opName) => {
    let procType;
    switch (opName) {
        case 'findUnique':
        case 'findFirst':
        case 'findMany':
        case 'findRaw':
        case 'aggregate':
        case 'aggregateRaw':
        case 'groupBy':
            procType = 'query';
            break;
        case 'createOne':
        case 'createMany':
        case 'deleteOne':
        case 'updateOne':
        case 'deleteMany':
        case 'updateMany':
        case 'upsertOne':
            procType = 'mutation';
            break;
        default:
            console.log('getProcedureTypeByOpName: ', { opName });
    }
    return procType;
};
exports.getProcedureTypeByOpName = getProcedureTypeByOpName;
//# sourceMappingURL=helpers.js.map