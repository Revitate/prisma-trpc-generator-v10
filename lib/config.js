"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configSchema = void 0;
const zod_1 = require("zod");
exports.configSchema = zod_1.z.object({
    trpcPath: zod_1.z.string().default("../../../../src/trpc")
});
//# sourceMappingURL=config.js.map