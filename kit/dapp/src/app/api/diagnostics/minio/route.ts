import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";
import { NextResponse } from "next/server";

// This endpoint is for diagnostic purposes only
// It should be disabled or protected in production
export async function GET() {
  try {
    // Check MinIO connection
    const endpoint = process.env.SETTLEMINT_MINIO_ENDPOINT || "";
    const accessKey = process.env.SETTLEMINT_MINIO_ACCESS_KEY || "";
    const hasSecretKey = !!process.env.SETTLEMINT_MINIO_SECRET_KEY;

    const diagnosticInfo: {
      minioConfig: {
        endpoint: string;
        accessKey: string;
        secretKey: string;
        bucket: string;
      };
      bucketInfo: { exists: boolean } | null;
      filesList: { name: string; size: number; lastModified: Date }[];
      error: { type: string; message: string; stack?: string } | null;
    } = {
      minioConfig: {
        endpoint: endpoint ? endpoint : "Not set",
        accessKey: accessKey ? "Set" : "Not set",
        secretKey: hasSecretKey ? "Set (hidden)" : "Not set",
        bucket: DEFAULT_BUCKET,
      },
      bucketInfo: null,
      filesList: [],
      error: null,
    };

    // Check if bucket exists
    try {
      const bucketExists = await minioClient.bucketExists(DEFAULT_BUCKET);
      diagnosticInfo.bucketInfo = { exists: bucketExists };

      if (bucketExists) {
        // List objects in the bucket
        const objectsStream = minioClient.listObjects(DEFAULT_BUCKET, "", true);
        const objects: { name: string; size: number; lastModified: Date }[] =
          [];

        for await (const obj of objectsStream) {
          objects.push({
            name: obj.name,
            size: obj.size || 0,
            lastModified: obj.lastModified,
          });
        }

        diagnosticInfo.filesList = objects;
      }
    } catch (error: unknown) {
      const bucketError = error as Error;
      diagnosticInfo.error = {
        type: "bucket_check_failed",
        message: bucketError.message || "Unknown error",
        stack: bucketError.stack,
      };
    }

    return NextResponse.json(diagnosticInfo);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        error: {
          type: "minio_diagnostic_failed",
          message: err.message || "Unknown error",
          stack: err.stack,
        },
      },
      { status: 500 }
    );
  }
}
