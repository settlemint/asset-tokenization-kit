"use server";

import { auth } from "@/lib/auth/auth";
import { actionClient } from "@/lib/safe-action";
import { client } from "@/lib/settlemint/minio";
import { CreatePresignedUrlSchema } from "./create-presigned-url.schema";

type MinioClient = typeof client & {
  presignedPutObject: (
    bucketName: string,
    objectName: string,
    expirySeconds: number,
    callback: (err: Error | null, presignedUrl: string) => void,
  ) => void;
};

export const createPresignedUrlAction = actionClient
  .schema(CreatePresignedUrlSchema)
  .action(async ({ parsedInput }) => {
    const { bucketName, objectName, expirySeconds } = parsedInput;
    const session = await auth();

    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const uploadUrl = await getPresignedUploadUrl(
      bucketName ?? process.env.SETTLEMINT_MINIO_BUCKET_NAME ?? "",
      objectName,
      expirySeconds ?? 3600,
    );

    if (!uploadUrl) {
      return { success: false, error: "Failed to generate upload URL" };
    }
    return { success: true, data: { uploadUrl } };
  });

async function getPresignedUploadUrl(bucketName: string, objectName: string, expirySeconds: number): Promise<string> {
  return new Promise((resolve, reject) => {
    (client as MinioClient).presignedPutObject(bucketName, objectName, expirySeconds, (err, presignedUrl) => {
      if (err) {
        reject(err);
      } else {
        resolve(presignedUrl);
      }
    });
  });
}
