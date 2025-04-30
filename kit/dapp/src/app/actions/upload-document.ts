"use server";

import type { User } from "@/lib/auth/types";
import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";

// Define a simple schema for FormData - actual validation will be manual
const UploadFormSchema = () => t.Any();

// Define the output schema for the upload response
const UploadResponseSchema = t.Object({
  id: t.String(),
  name: t.String(),
  url: t.String(),
  title: t.String(),
  description: t.Optional(t.String()),
  type: t.String(),
});

// Define the upload action function separately
const uploadDocumentFunction = async ({
  parsedInput: formData,
  ctx: { user: _user },
}: {
  parsedInput: FormData;
  ctx: { user: User };
}) => {
  console.log("Server Action: Received FormData");

  // --- Manual Validation ---
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const type = formData.get("type") as string | null;

  if (!file || typeof file === "string") {
    console.error("Server Action Error: No file provided or invalid file type");
    throw new Error("No file provided or invalid file type.");
  }
  if (!title) {
    console.error("Server Action Error: Title is required");
    throw new Error("Title is required.");
  }
  if (!type) {
    console.error("Server Action Error: Type is required");
    throw new Error("Type is required.");
  }

  console.log("Server Action: File details:", {
    name: file.name,
    size: file.size,
    type: file.type,
  });
  console.log("Server Action: Metadata:", { title, description, type });

  // --- Placeholder Upload Logic ---
  // Replace this with your actual file storage logic (e.g., upload to S3, GCS, etc.)
  // Simulate some async work
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simulate a successful upload and return a mock URL
  const mockFileId = crypto.randomUUID();
  const mockUrl = `/uploads/mock/${mockFileId}/${file.name}`; // Example URL

  console.log("Server Action: Upload simulation complete. Mock URL:", mockUrl);

  return {
    id: mockFileId,
    name: file.name,
    url: mockUrl,
    title: title,
    description: description || undefined,
    type: type,
  };
};

// Define the upload document action
export const uploadDocumentAction = action
  .schema(UploadFormSchema())
  .outputSchema(UploadResponseSchema)
  .action(uploadDocumentFunction);
