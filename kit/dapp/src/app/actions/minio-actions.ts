"use server"; // Mark this file as containing Server Actions

import { type StaticDecode, t } from "@/lib/utils/typebox";
import { Client as MinioClient } from "minio"; // Correct package name
import { Buffer } from "node:buffer";

// --- Configuration Reading ---
const MINIO_ENDPOINT_RAW = process.env.SETTLEMINT_MINIO_ENDPOINT;
const MINIO_ACCESS_KEY = process.env.SETTLEMINT_MINIO_ACCESS_KEY;
const MINIO_SECRET_KEY = process.env.SETTLEMINT_MINIO_SECRET_KEY;
const DEFAULT_BUCKET_NAME = "uploads";
const EXPLICIT_PUBLIC_URL =
  process.env.NEXT_PUBLIC_SETTLEMINT_MINIO_PUBLIC_URL ||
  process.env.SETTLEMINT_MINIO_PUBLIC_URL;

const MAX_FILE_SIZE_MB = 5;

// --- Derive Public URL if not explicitly set ---
let MINIO_PUBLIC_URL: string | undefined = EXPLICIT_PUBLIC_URL;
let derivationWarning = false;

if (!MINIO_PUBLIC_URL && MINIO_ENDPOINT_RAW?.startsWith("s3://")) {
  try {
    const hostname = MINIO_ENDPOINT_RAW.substring(5).replace(/\/$/, "");
    if (hostname) {
      MINIO_PUBLIC_URL = `https://${hostname}`;
      derivationWarning = true;
    }
  } catch (e) {
    console.error("Error deriving Minio public URL from endpoint", e);
  }
}

// --- Validation ---
if (!MINIO_ACCESS_KEY || !MINIO_SECRET_KEY || !MINIO_ENDPOINT_RAW) {
  console.error(
    "Missing required Minio environment variables for direct client: SETTLEMINT_MINIO_ENDPOINT, SETTLEMINT_MINIO_ACCESS_KEY, SETTLEMINT_MINIO_SECRET_KEY"
  );
}
if (!MINIO_PUBLIC_URL) {
  console.error(
    "Minio public URL could not be determined. Please set SETTLEMINT_MINIO_PUBLIC_URL or NEXT_PUBLIC_SETTLEMINT_MINIO_PUBLIC_URL in .env or .env.local, or ensure SETTLEMINT_MINIO_ENDPOINT is a valid s3:// URL for derivation."
  );
} else if (derivationWarning) {
  console.warn(
    `Minio public URL was derived as ${MINIO_PUBLIC_URL} from the endpoint. This assumes path-style access and might be incorrect. Explicitly set SETTLEMINT_MINIO_PUBLIC_URL for reliability.`
  );
}

// --- Helper to create Minio Client directly --- << RESTORED
const getMinioClient = (): MinioClient => {
  if (!MINIO_ENDPOINT_RAW || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
    throw new Error(
      "Cannot create Minio client due to missing environment variables."
    );
  }

  let host: string;
  let useSSL = true;
  let port: number | undefined = undefined;

  try {
    const urlString = MINIO_ENDPOINT_RAW.startsWith("s3://")
      ? `https://${MINIO_ENDPOINT_RAW.substring(5)}`
      : MINIO_ENDPOINT_RAW;

    const parsedUrl = new URL(urlString.replace(/\/$/, ""));

    host = parsedUrl.hostname;
    if (parsedUrl.protocol === "http:") {
      useSSL = false;
      port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 80;
    } else {
      useSSL = true;
      port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 443;
    }

    if (!host) throw new Error("Extracted host is empty");
  } catch (e) {
    console.error(
      `Invalid Minio instance URL format: ${MINIO_ENDPOINT_RAW}`,
      e
    );
    throw new Error(`Invalid Minio instance URL format: ${MINIO_ENDPOINT_RAW}`);
  }

  console.log(
    `Creating Minio Client: Endpoint='${host}', Port=${port || (useSSL ? 443 : 80)}, UseSSL=${useSSL}, PathStyle=true`
  );

  return new MinioClient({
    endPoint: host,
    port: port,
    useSSL: useSSL,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
    pathStyle: true,
  });
};
// --- End Helper ---

const uploadArgsSchema = t.Object({
  file: t.Any({ description: "File object" }),
  maxSizeMB: t.Optional(t.Number({ minimum: 0 })),
  uploadPathPrefix: t.Optional(t.String()),
});
type UploadArgs = StaticDecode<typeof uploadArgsSchema>;

export async function uploadFileToMinio({
  file,
  maxSizeMB,
  uploadPathPrefix,
}: UploadArgs): Promise<
  | { success: true; fileUrl: string; objectName: string }
  | { success: false; error: string }
> {
  if (!(file instanceof File)) {
    return { success: false, error: "Invalid file input." };
  }
  const bucketName = DEFAULT_BUCKET_NAME;
  if (!MINIO_PUBLIC_URL)
    return {
      success: false,
      error: "Minio public URL could not be determined.",
    };

  const effectiveMaxSizeMB = maxSizeMB ?? MAX_FILE_SIZE_MB;
  if (Number.isNaN(effectiveMaxSizeMB) || effectiveMaxSizeMB <= 0)
    return { success: false, error: "Invalid max file size." };
  if (file.size === 0) return { success: false, error: "File is empty." };
  if (file.size > effectiveMaxSizeMB * 1024 * 1024)
    return {
      success: false,
      error: `File size exceeds the limit of ${effectiveMaxSizeMB}MB.`,
    };

  const filename = encodeURIComponent(file.name.replace(/\s+/g, "_"));
  const pathPrefix = uploadPathPrefix
    ? `${uploadPathPrefix.replace(/\/$/, "")}/`
    : "";
  const objectName = `${pathPrefix}${Date.now()}-${filename}`;

  let minioClient: MinioClient | undefined;

  try {
    minioClient = getMinioClient(); // Use the restored helper
    const buffer = Buffer.from(await file.arrayBuffer());

    const metadata = {
      "Content-Type": file.type || "application/octet-stream",
    };

    // Use putObject with buffer, size, and metadata
    const result = await minioClient.putObject(
      bucketName,
      objectName,
      buffer,
      file.size, // Provide size
      metadata // Include metadata with Content-Type
    );

    console.log(
      "Direct Minio client upload successful (putObject, with metadata):",
      {
        objectName,
        result,
      }
    );

    const publicUrlBase = MINIO_PUBLIC_URL.endsWith("/")
      ? MINIO_PUBLIC_URL
      : `${MINIO_PUBLIC_URL}/`;
    const fileUrl = `${publicUrlBase}${bucketName}/${objectName}`;

    return { success: true, fileUrl, objectName };
  } catch (error) {
    console.error(
      `Raw error during direct Minio client upload (putObject) for ${objectName}:`,
      JSON.stringify(error, null, 2)
    );
    console.error(
      "Direct Minio client upload action failed (putObject):",
      error
    );
    const message =
      error instanceof Error ? error.message : "Unknown upload error.";
    return { success: false, error: `Upload failed: ${message}` };
  }
}

const deleteArgsSchema = t.Object({
  objectName: t.String({ minLength: 1 }),
});
type DeleteArgs = StaticDecode<typeof deleteArgsSchema>;

export async function deleteFileFromMinio({
  objectName,
}: DeleteArgs): Promise<
  { success: true; message: string } | { success: false; error: string }
> {
  const bucketName = DEFAULT_BUCKET_NAME;
  let minioClient: MinioClient | undefined;

  try {
    minioClient = getMinioClient(); // Use the restored helper
    await minioClient.removeObject(bucketName, objectName);
    console.log("Direct Minio client delete successful:", { objectName });
    return { success: true, message: "File deleted successfully." };
  } catch (error) {
    console.error("Direct Minio client delete action failed:", error);
    const message =
      error instanceof Error ? error.message : "Unknown delete error.";
    return { success: false, error: `Delete failed: ${message}` };
  }
}
