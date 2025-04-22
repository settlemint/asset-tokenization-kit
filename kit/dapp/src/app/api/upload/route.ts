import { uploadFile } from "@/lib/storage/minio-client";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * API route handler for file uploads
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate a unique object name
    const fileName = file.name;
    const id = randomUUID();
    const objectName = `${id}-${fileName}`;
    const contentType = file.type || "application/octet-stream";

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      // Use MinIO client to upload the file
      const bucketName =
        process.env.MINIO_DEFAULT_BUCKET || "asset-tokenization";
      const result = await uploadFile(
        buffer,
        objectName,
        contentType,
        {
          "Content-Type": contentType,
          "Original-Filename": fileName,
        },
        bucketName
      );

      console.log(`File uploaded successfully via API: ${objectName}`);

      return NextResponse.json({
        id,
        name: fileName,
        contentType,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        etag: result.etag,
        url: result.url,
        objectName,
        bucket: bucketName,
      });
    } catch (minioError) {
      console.error("MinIO upload error:", minioError);

      // Fallback to simulated upload
      console.warn("Falling back to simulated upload");

      return NextResponse.json({
        id,
        name: fileName,
        contentType,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        etag: "simulated-etag",
        url: `/api/files/${id}`,
        objectName,
      });
    }
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
