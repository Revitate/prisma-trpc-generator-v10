import { z } from 'zod';

export const configSchema = z.object({
  trpcPath: z.string().default("../../../../src/trpc")
});

export type Config = z.infer<typeof configSchema>;
