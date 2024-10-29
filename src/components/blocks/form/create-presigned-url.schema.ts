import { z } from "zod";

export const CreatePresignedUrlSchema = z.object({
  bucketName: z.string(),
  objectName: z.string(),
  expirySeconds: z.number(),
});

export type CreatePresignedUrlSchemaType = z.infer<typeof CreatePresignedUrlSchema>;
