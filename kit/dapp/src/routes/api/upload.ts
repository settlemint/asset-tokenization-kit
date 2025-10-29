/**
 * Better Upload API Endpoint
 *
 * Handles file uploads using better-upload.com for the theme logo uploads.
 * Provides a simple, secure way to handle file uploads with validation.
 *
 * Features:
 * - Validates file types (SVG, PNG, WebP)
 * - Enforces max file size (5MB)
 * - Stores files locally in public/uploads/logos
 *
 * Method: POST /api/upload
 */

import { json } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { createBetterUpload } from "@better-upload/server";
import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "logos");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/svg+xml", "image/png", "image/webp"];

// Ensure upload directory exists
await fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(() => {});

const betterUpload = createBetterUpload({
  storage: {
    provider: "local",
    basePath: UPLOAD_DIR,
    baseUrl: "/uploads/logos",
  },
  maxFileSize: MAX_FILE_SIZE,
  allowedFileTypes: ALLOWED_TYPES,
});

export const Route = createFileRoute("/api/upload")({
  beforeLoad: async () => {
    // Ensure upload directory exists on each request
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
  },
});

/**
 * Handle file upload POST requests
 */
export async function POST({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return json(
        { error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
    const unique = randomUUID().slice(0, 8);
    const ext = path.extname(file.name);
    const sanitizedName = file.name
      .replace(ext, "")
      .trim()
      .toLowerCase()
      .replaceAll(/\s+/g, "-")
      .replaceAll(/[^a-z0-9._-]/g, "_");
    const filename = `${timestamp}-${unique}-${sanitizedName}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    // Return success response
    return json({
      success: true,
      url: `/uploads/logos/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return json(
      { error: "Upload failed", message: String(error) },
      { status: 500 }
    );
  }
}
