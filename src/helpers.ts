import { SourceFile } from 'ts-morph';
import {
  capitalizeFirstLetter,
  uncapitalizeFirstLetter,
} from './utils/uncapitalizeFirstLetter';

export const generatetRPCRouterImport = (
  sourceFile: SourceFile,
  trpcPath: string,
) => {
  sourceFile.addImportDeclaration({
    moduleSpecifier: trpcPath,
    namedImports: ['router'],
  });
};

export const generatetRPCProcedureImport = (
  sourceFile: SourceFile,
  trpcPath: string,
) => {
  sourceFile.addImportDeclaration({
    moduleSpecifier: trpcPath,
    namedImports: ['procedure'],
  });
};

export const generateProcedureImports = (
  sourceFile: SourceFile,
  name: string,
  hasCreateMany: boolean,
  provider: string,
) => {
  let statements = [
    `import { findUnique${name}Procedure } from "./findUnique${name}.procedure";`,
    `import { findFirst${name}Procedure } from "./findFirst${name}.procedure";`,
    `import { findMany${name}Procedure } from "./findMany${name}.procedure";`,
    `import { createOne${name}Procedure } from "./createOne${name}.procedure";`,
  ];

  if (hasCreateMany) {
    statements.push(
      `import { createMany${name}Procedure } from "./createMany${name}.procedure";`,
    );
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

export const generateRouterImport = (
  sourceFile: SourceFile,
  modelNamePlural: string,
  modelNameCamelCase: string,
) => {
  sourceFile.addImportDeclaration({
    moduleSpecifier: `./${modelNameCamelCase}Router`,
    namedImports: [`${modelNamePlural}Router`],
  });
};

export const generateProcedureSchemaImports = (
  sourceFile: SourceFile,
  opName: string,
  modelName: string,
) => {
  if (opName === 'aggregateRaw' || opName === 'findRaw') {
    sourceFile.addImportDeclaration({
      moduleSpecifier: `../../schemas/${opName}${modelName}${capitalizeFirstLetter(
        opName,
      )}.schema`,
      namedImports: [
        `${modelName}${capitalizeFirstLetter(opName)}ObjectSchema`,
      ],
    });
    return;
  }

  sourceFile.addImportDeclaration({
    moduleSpecifier: `../../schemas/${opName}${modelName}.schema`,
    namedImports: [getInputTypeByOpName(opName, modelName)],
  });
};

export function generateProcedure(
  sourceFile: SourceFile,
  name: string,
  modelName: string,
  opType: string,
) {
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
  .input(${getInputTypeByOpName(opType, modelName)})
  .${getProcedureTypeByOpName(opType)}(async ({ ctx, input }) => {
    const ${name} = await ctx.prisma.${uncapitalizeFirstLetter(
    modelName,
    )}.${opType.replace('One', '')}(${input});
    return ${name};
  })`);
}

export const getInputTypeByOpName = (opName: string, modelName: string) => {
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

export const getProcedureTypeByOpName = (opName: string) => {
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
