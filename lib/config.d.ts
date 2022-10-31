import { z } from 'zod';
export declare const configSchema: z.ZodObject<{
    trpcPath: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    trpcPath?: string;
}, {
    trpcPath?: string;
}>;
export declare type Config = z.infer<typeof configSchema>;
