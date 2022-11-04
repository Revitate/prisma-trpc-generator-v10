"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const internals_1 = require("@prisma/internals");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const pluralize_1 = __importDefault(require("pluralize"));
const prisma_generator_1 = require("prisma-zod-generator/lib/prisma-generator");
const config_1 = require("./config");
const helpers_1 = require("./helpers");
const project_1 = require("./project");
const removeDir_1 = __importDefault(require("./utils/removeDir"));
async function generate(options) {
    var _a;
    const outputDir = (0, internals_1.parseEnvValue)(options.generator.output);
    const results = config_1.configSchema.safeParse(options.generator.config);
    if (!results.success)
        throw new Error('Invalid options passed');
    const config = results.data;
    await fs_1.promises.mkdir(outputDir, { recursive: true });
    await (0, removeDir_1.default)(outputDir, true);
    options.generator.config["isGenerateSelect"] = "true";
    await (0, prisma_generator_1.generate)(options);
    const prismaClientProvider = options.otherGenerators.find((it) => (0, internals_1.parseEnvValue)(it.provider) === 'prisma-client-js');
    const dataSource = (_a = options.datasources) === null || _a === void 0 ? void 0 : _a[0];
    const prismaClientDmmf = await (0, internals_1.getDMMF)({
        datamodel: options.datamodel,
        previewFeatures: prismaClientProvider.previewFeatures,
    });
    const appRouter = project_1.project.createSourceFile(path_1.default.resolve(outputDir, 'routers', `index.ts`), undefined, { overwrite: true });
    (0, helpers_1.generatetRPCRouterImport)(appRouter, config.trpcPath);
    const routers = [];
    prismaClientDmmf.mappings.modelOperations.forEach((modelOperation) => {
        const { model, ...operations } = modelOperation;
        const plural = (0, pluralize_1.default)(model.toLowerCase());
        const hasCreateMany = Boolean(operations.createMany);
        (0, helpers_1.generateRouterImport)(appRouter, plural, model);
        const modelRouter = project_1.project.createSourceFile(path_1.default.resolve(outputDir, 'routers', `${model}Router`, `index.ts`), undefined, { overwrite: true });
        (0, helpers_1.generatetRPCRouterImport)(modelRouter, path_1.default.join('..', config.trpcPath));
        (0, helpers_1.generateProcedureImports)(modelRouter, model, hasCreateMany, dataSource.provider);
        const procedures = [];
        for (const [opType, opNameWithModel] of Object.entries(operations)) {
            const modelProcedure = project_1.project.createSourceFile(path_1.default.resolve(outputDir, 'routers', `${model}Router`, `${opNameWithModel}.procedure.ts`), undefined, { overwrite: true });
            (0, helpers_1.generatetRPCProcedureImport)(modelProcedure, path_1.default.join('..', config.trpcPath));
            (0, helpers_1.generateProcedureSchemaImports)(modelProcedure, opType, model);
            (0, helpers_1.generateProcedure)(modelProcedure, opNameWithModel, model, opType);
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
    await project_1.project.save();
}
exports.generate = generate;
//# sourceMappingURL=prisma-generator.js.map