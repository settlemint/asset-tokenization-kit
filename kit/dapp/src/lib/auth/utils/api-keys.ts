import crypto from "node:crypto";

export interface ApiKeyMetadata {
  description?: string;
  createdByUserId?: string;
}

export function hashApiKey(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export function parseApiKeyMetadata(
  metadata: string | null
): ApiKeyMetadata {
  if (!metadata) {
    return {};
  }

  try {
    const parsed = JSON.parse(metadata);
    if (parsed && typeof parsed === "object") {
      return parsed as ApiKeyMetadata;
    }
    return {};
  } catch (error) {
    console.warn("Failed to parse API key metadata", error);
    return {};
  }
}
