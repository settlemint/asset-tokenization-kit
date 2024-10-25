import { client } from "@/lib/settlemint/minio";
import { NextResponse } from "next/server";

type ActionResponse<T = unknown> = {
  data?: T;
  error?: string;
};

async function getPresignedUploadUrl(bucketName: string, objectName: string, expirySeconds: number): Promise<string> {
  return new Promise((resolve, reject) => {
    client.presignedPutObject(bucketName, objectName, expirySeconds, (err, presignedUrl) => {
      if (err) {
        reject(err);
      } else {
        resolve(presignedUrl);
      }
    });
  });
}

export async function POST(request: Request): Promise<NextResponse<ActionResponse>> {
  try {
    const { fileName, fileType, storage, bucket } = await request.json();

    const uploadUrl = await getPresignedUploadUrl(
      bucket ?? process.env.SETTLEMINT_MINIO_BUCKET_NAME ?? "",
      fileName,
      3600,
    ); // URL expires in 1 hour

    return NextResponse.json({ success: true, data: { uploadUrl } });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ success: false, error: "Failed to generate upload URL" }, { status: 500 });
  }
}
