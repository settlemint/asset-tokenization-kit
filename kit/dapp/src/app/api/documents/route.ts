import {
  createPresignedUrlOperation,
  createUploadOperation,
  executeMinioOperation,
} from "@/lib/storage/minio-client";
import { NextRequest, NextResponse } from "next/server";

// Get the bucket name from the environment variables or use a default
const DEFAULT_BUCKET = process.env.MINIO_BUCKET_NAME || "assets";

export const maxDuration = 60; // 60 seconds max function execution

/**
 * POST handler for uploading documents
 *
 * Uploads a file to MinIO storage
 */
export async function POST(request: NextRequest) {
  try {
    // For authentication, you would use the appropriate method from better-auth
    // This is a placeholder for the user ID
    const userId = "example-user-id"; // In a real app, you'd get this from the session

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string | null;

    if (!file || !title || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique ID for the document
    const documentId = crypto.randomUUID();

    // Create a clean filename (remove special chars)
    const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    // Create object name with user ID and document ID for better organization
    const objectName = `documents/${userId}/${documentId}/${fileName}`;

    // Add file metadata
    const metadata: Record<string, string> = {
      "content-type": file.type,
      "original-name": file.name,
      "upload-time": new Date().toISOString(),
      "document-id": documentId,
      "document-title": title,
      "document-type": type,
      "user-id": userId,
    };

    if (description) {
      metadata["document-description"] = description;
    }

    // Upload the file to MinIO
    const uploadOperation = createUploadOperation(
      DEFAULT_BUCKET,
      objectName,
      file,
      metadata
    );

    const result = await executeMinioOperation(uploadOperation);

    // Generate a presigned URL for accessing the file
    const presignedUrlOperation = createPresignedUrlOperation(
      DEFAULT_BUCKET,
      objectName,
      3600 * 24 * 7 // URL valid for 7 days
    );

    const downloadUrl = await executeMinioOperation(presignedUrlOperation);

    // In a real application, you would save the metadata to your database here
    // For example, using Hasura GraphQL or a direct database query

    // Return success response with file details
    return NextResponse.json({
      success: true,
      file: {
        id: documentId,
        name: file.name,
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        etag: result.etag,
        url: downloadUrl,
        type,
        title,
        description,
      },
      message: "Document uploaded successfully",
    });
  } catch (error) {
    console.error("Document upload API error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

/**
 * GET handler for retrieving documents for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // For authentication, you would use the appropriate method from better-auth
    // This is a placeholder for the user ID
    const userId = "example-user-id"; // In a real app, you'd get this from the session

    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get("id");

    // In a real implementation, you would query your database here
    // For example, using Hasura GraphQL or a direct database query

    return NextResponse.json({
      success: true,
      documents: [], // This would be populated from your database query
    });
  } catch (error) {
    console.error("Document retrieval API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve documents" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a document
 */
export async function DELETE(request: NextRequest) {
  try {
    // For authentication, you would use the appropriate method from better-auth
    // This is a placeholder for the user ID
    const userId = "example-user-id"; // In a real app, you'd get this from the session

    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // In a real implementation, you would delete the document from your database here
    // For example, using Hasura GraphQL or a direct database query

    return NextResponse.json({
      success: true,
      deletedCount: 1,
    });
  } catch (error) {
    console.error("Document deletion API error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
