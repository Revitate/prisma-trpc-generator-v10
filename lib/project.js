"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.project = void 0;
const ts_morph_1 = require("ts-morph");
const compilerOptions = {
    target: ts_morph_1.ScriptTarget.ES2019,
    module: ts_morph_1.ModuleKind.CommonJS,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    esModuleInterop: true,
};
exports.project = new ts_morph_1.Project({
    compilerOptions: {
        ...compilerOptions,
    },
});
//# sourceMappingURL=project.js.map