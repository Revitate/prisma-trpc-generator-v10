import { EnvValue, GeneratorOptions } from '@prisma/generator-helper';
import { getDMMF, parseEnvValue } from '@prisma/internals';
import { promises as fs } from 'fs';
import path from 'path';
import pluralize from 'pluralize';
import { generate as PrismaZodGenerator } from 'prisma-zod-generator/lib/prisma-generator';
import { configSchema } from './config';
import {
  generateProcedure,
  generateProcedureImports,
  generateProcedureSchemaImports,
  generateRouterImport,
  generatetRPCProcedureImport,
  generatetRPCRouterImport,
} from './helpers';
import { project } from './project';
import removeDir from './utils/removeDir';

export async function generate(options: GeneratorOptions) {
  const outputDir = parseEnvValue(options.generator.output as EnvValue);
  const results = configSchema.safeParse(options.generator.config);
  if (!results.success) throw new Error('Invalid options passed');
  const config = results.data;

  await fs.mkdir(outputDir, { recursive: true });
  await removeDir(outputDir, true);

  options.generator.config['isGenerateSelect'] = 'true';
  options.generator.config['isGenerateInclude'] = 'true';
  await PrismaZodGenerator(options);

  const prismaClientProvider = options.otherGenerators.find(
    (it) => parseEnvValue(it.provider) === 'prisma-client-js',
  );

  const dataSource = options.datasources?.[0];

  const prismaClientDmmf = await getDMMF({
    datamodel: options.datamodel,
    previewFeatures: prismaClientProvider.previewFeatures,
  });

  const appRouter = project.createSourceFile(
    path.resolve(outputDir, 'routers', `index.ts`),
    undefined,
    { overwrite: true },
  );

  generatetRPCRouterImport(appRouter, config.trpcPath);

  const routers: string[] = [];

  prismaClientDmmf.mappings.modelOperations.forEach((modelOperation) => {
    const { model, ...operations } = modelOperation;
    const plural = pluralize(model.toLowerCase());
    const hasCreateMany = Boolean(operations.createMany);
    generateRouterImport(appRouter, plural, model);
    const modelRouter = project.createSourceFile(
      path.resolve(outputDir, 'routers', `${model}Router`, `index.ts`),
      undefined,
      { overwrite: true },
    );

    generatetRPCRouterImport(modelRouter, path.join('..', config.trpcPath));

    generateProcedureImports(
      modelRouter,
      model,
      hasCreateMany,
      dataSource.provider,
    );

    const procedures: string[] = [];

    for (const [opType, opNameWithModel] of Object.entries(operations)) {
      const modelProcedure = project.createSourceFile(
        path.resolve(
          outputDir,
          'routers',
          `${model}Router`,
          `${opNameWithModel}.procedure.ts`,
        ),
        undefined,
        { overwrite: true },
      );
      generatetRPCProcedureImport(
        modelProcedure,
        path.join('..', config.trpcPath),
      );
      generateProcedureSchemaImports(modelProcedure, opType, model);
      generateProcedure(modelProcedure, opNameWithModel, model, opType);
      procedures.push(`${opNameWithModel}: ${opNameWithModel}Procedure`);
    }
    modelRouter.addStatements(/* ts */ `
    export const ${plural}Router =  router({${procedures.join(',\n')}})`);
    modelRouter.formatText({ indentSize: 2 });
    routers.push(`${model.toLowerCase()}: ${plural}Router`);
  });

  appRouter.addStatements(/* ts */ `
  export const appRouter = router({${routers.join(',\n')}})`);

  appRouter.formatText({ indentSize: 2 });
  await project.save();
}
