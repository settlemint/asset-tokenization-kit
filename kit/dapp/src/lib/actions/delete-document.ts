"use server";

import { deleteFile } from "@/lib/actions/delete-file";
import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";

// Define a simple schema for the delete document input
const DeleteDocumentSchema = t.Object({
  objectName: t.String({
    description: "The object name/path to delete",
    minLength: 1,
    error: "Document path is required",
  }),
  // Optional field to specify the document type for special handling
  documentType: t.Optional(
    t.String({
      description: "The type of document (e.g., 'mica', 'regulations', etc.)",
    })
  ),
  // Optional field for the filename in case we need to reconstruct the path
  fileName: t.Optional(
    t.String({
      description: "The original file name, needed for some special cases",
    })
  ),
});

// Define the output schema for the delete response
const DeleteResponseSchema = t.Object({
  success: t.Boolean(),
  message: t.String(),
  objectName: t.String(),
  error: t.Optional(t.Any()),
});

/**
 * Direct server action for document deletion
 * This is the main entry point for direct deletion requests
 */
export async function deleteDocument(
  objectName: string,
  documentType?: string,
  fileName?: string
) {
  try {
    return await deleteDocumentImplementation(
      objectName,
      documentType,
      fileName
    );
  } catch (error) {
    console.error("Error in direct delete document call:", error);
    throw error;
  }
}

/**
 * Implementation of document deletion that ensures reliable deletion
 * with proper error handling and logging
 */
async function deleteDocumentImplementation(
  objectName: string,
  documentType?: string,
  fileName?: string
) {
  try {
    if (!objectName) {
      throw new Error("Document path is required");
    }

    console.log(
      `Deleting document with path: ${objectName}, type: ${documentType || "unknown"}, fileName: ${fileName || "not provided"}`
    );

    // Handle special cases for document paths
    let effectivePath = objectName;

    // Special handling for MiCA/regulations documents
    // If the path doesn't already include the regulations/mica prefix but we know it's a mica document
    if (
      (documentType === "mica" || documentType === "regulations") &&
      !objectName.includes("regulations/mica") &&
      fileName
    ) {
      effectivePath = `regulations/mica/${fileName}`;
      console.log(`Converted path for MiCA document: ${effectivePath}`);
    }

    // Use the enhanced deleteFile function with the effective path
    let result = await deleteFile(effectivePath);

    // If the first attempt failed and we have a special case, try the original path
    if (!result.success && effectivePath !== objectName) {
      console.log(
        `First deletion attempt failed, trying original path: ${objectName}`
      );
      result = await deleteFile(objectName);
    }

    // Log detailed information for debugging
    console.log(`Document deletion result:`, {
      success: result.success,
      path: effectivePath,
      originalPath: objectName,
      message: result.message,
    });

    return {
      success: result.success,
      message: result.message,
      objectName: objectName,
      error: result.error,
    };
  } catch (error) {
    console.error("Error in deleteDocumentImplementation:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      objectName: objectName,
      error: error,
    };
  }
}

/**
 * Safe action wrapper for the document deletion implementation
 * This handles the safe-action integration
 */
export const deleteDocumentAction = action
  .schema(DeleteDocumentSchema)
  .outputSchema(DeleteResponseSchema)
  .action(async ({ parsedInput }) => {
    console.log("Processing document deletion via safe-action");
    return await deleteDocumentImplementation(
      parsedInput.objectName,
      parsedInput.documentType,
      parsedInput.fileName
    );
  });
