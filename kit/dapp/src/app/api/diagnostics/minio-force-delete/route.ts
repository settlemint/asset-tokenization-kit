import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";
import * as Minio from "minio";
import { NextRequest, NextResponse } from "next/server";

/**
 * Special diagnostic API to force delete a file using raw Minio client commands
 * Only for use when the regular deletion method fails due to permissions
 *
 * DELETE /api/diagnostics/minio-force-delete?path=regulations/mica/test1.pdf
 */
export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing path parameter",
      },
      { status: 400 }
    );
  }

  console.log(`Force delete: Attempting to delete file at path: ${path}`);

  const results = {
    path,
    attempts: [] as { method: string; success: boolean; error?: string }[],
  };

  // Attempt 1: Use the existing client
  try {
    console.log("Attempt 1: Using existing MinIO client");
    await minioClient.removeObject(DEFAULT_BUCKET, path);
    results.attempts.push({
      method: "existing-client",
      success: true,
    });
  } catch (error: any) {
    console.error("Attempt 1 failed:", error.message);
    results.attempts.push({
      method: "existing-client",
      success: false,
      error: error.message,
    });

    // Attempt 2: Try with a new client instance
    try {
      console.log("Attempt 2: Creating new MinIO client");
      // Get environment variables
      const endpoint = process.env.SETTLEMINT_MINIO_ENDPOINT || "";
      const accessKey = process.env.SETTLEMINT_MINIO_ACCESS_KEY || "";
      const secretKey = process.env.SETTLEMINT_MINIO_SECRET_KEY || "";

      // Format the endpoint properly
      let formattedEndpoint = endpoint.trim().replace(/\/+$/, "");
      if (formattedEndpoint.startsWith("s3://")) {
        formattedEndpoint = formattedEndpoint.replace("s3://", "");
      }

      if (
        !formattedEndpoint.startsWith("http://") &&
        !formattedEndpoint.startsWith("https://")
      ) {
        formattedEndpoint = "https://" + formattedEndpoint;
      }

      const endpointUrl = new URL(formattedEndpoint);

      console.log(`Using endpoint: ${endpointUrl.hostname}`);

      // Create a new MinIO client
      const newClient = new Minio.Client({
        endPoint: endpointUrl.hostname,
        port: endpointUrl.port ? parseInt(endpointUrl.port) : 443,
        useSSL: endpointUrl.protocol === "https:",
        accessKey,
        secretKey,
      });

      await newClient.removeObject(DEFAULT_BUCKET, path);
      results.attempts.push({
        method: "new-client",
        success: true,
      });
    } catch (error2: any) {
      console.error("Attempt 2 failed:", error2.message);
      results.attempts.push({
        method: "new-client",
        success: false,
        error: error2.message,
      });

      // Attempt 3: Try raw HTTP request for S3-compatible APIs
      try {
        console.log("Attempt 3: Using raw S3 HTTP request");
        const endpoint = process.env.SETTLEMINT_MINIO_ENDPOINT || "";
        const accessKey = process.env.SETTLEMINT_MINIO_ACCESS_KEY || "";
        const secretKey = process.env.SETTLEMINT_MINIO_SECRET_KEY || "";

        let formattedEndpoint = endpoint.trim().replace(/\/+$/, "");
        if (formattedEndpoint.startsWith("s3://")) {
          formattedEndpoint = formattedEndpoint.replace("s3://", "https://");
        }

        if (
          !formattedEndpoint.startsWith("http://") &&
          !formattedEndpoint.startsWith("https://")
        ) {
          formattedEndpoint = "https://" + formattedEndpoint;
        }

        // Build the URL
        const deleteUrl = `${formattedEndpoint}/${DEFAULT_BUCKET}/${encodeURIComponent(path)}`;

        // Create authorization header
        const date = new Date().toUTCString();
        const stringToSign = `DELETE\n\n\n${date}\n/${DEFAULT_BUCKET}/${path}`;

        // Note: In a real implementation, you'd need to properly sign the request
        // This is a simplified version

        const response = await fetch(deleteUrl, {
          method: "DELETE",
          headers: {
            Date: date,
            Authorization: `AWS ${accessKey}:${secretKey}`,
            "Content-Type": "application/octet-stream",
          },
        });

        if (response.ok) {
          results.attempts.push({
            method: "raw-http",
            success: true,
          });
        } else {
          const responseText = await response.text();
          results.attempts.push({
            method: "raw-http",
            success: false,
            error: `Status ${response.status}: ${responseText}`,
          });
        }
      } catch (error3: any) {
        console.error("Attempt 3 failed:", error3.message);
        results.attempts.push({
          method: "raw-http",
          success: false,
          error: error3.message,
        });
      }
    }
  }

  // Check if any attempt succeeded
  const success = results.attempts.some((attempt) => attempt.success);

  // Verify if the file is still there
  let stillExists = false;
  try {
    await minioClient.statObject(DEFAULT_BUCKET, path);
    stillExists = true;
  } catch (error) {
    // This is expected behavior - the file should be gone
    stillExists = false;
  }

  return NextResponse.json({
    success: success,
    fileStillExists: stillExists,
    message: success ? "File successfully deleted" : "Failed to delete file",
    results,
  });
}
