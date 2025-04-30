"use server";

import { minioBucketName, minioClient } from "@/lib/minio/minio-client"; // Assuming MinIO client setup exists
import { randomUUID } from "crypto";
import { Readable } from "stream";

export async function uploadToStorage(
  formData: FormData,
  path: string
): Promise<{ id: string; url: string }> {
  const file = formData.get("file") as File | null;

  if (!file) {
    throw new Error("No file found in FormData");
  }

  // Basic validation (could add more)
  if (file.size === 0) {
    throw new Error("File is empty");
  }

  // Convert file to buffer or stream
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileStream = Readable.from(fileBuffer);

  // Generate a unique filename to prevent collisions
  const uniqueSuffix = randomUUID();
  const originalFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_"); // Sanitize filename
  const objectName = `${path}/${uniqueSuffix}-${originalFilename}`;

  try {
    // Upload to MinIO
    await minioClient.putObject(
      minioBucketName,
      objectName,
      fileStream,
      file.size,
      { "Content-Type": file.type } // Set content type
    );

    console.log(
      `Successfully uploaded ${objectName} to bucket ${minioBucketName}`
    );

    // Construct the URL (adjust endpoint as necessary)
    // This assumes public access or pre-signed URLs are handled appropriately
    // You might need MINIO_ENDPOINT from env vars
    const fileUrl = `${process.env.MINIO_ENDPOINT || "http://localhost:9000"}/${minioBucketName}/${objectName}`;

    return { id: objectName, url: fileUrl };
  } catch (error) {
    console.error("Error uploading to MinIO:", error);
    throw new Error("Failed to upload file to storage.");
  }
}
