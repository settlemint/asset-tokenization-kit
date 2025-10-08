import crypto from "node:crypto";

const DEFAULT_PREFIX = "sm_atk_";
const DEFAULT_KEY_BYTES = 24;

export interface ApiKeyMetadata {
  impersonatedUserId?: string;
  description?: string;
  createdByUserId?: string;
}

export interface GeneratedApiKeySecret {
  secret: string;
  prefix: string;
  start: string;
  hashed: string;
}

export function generateApiKeySecret(options?: {
  prefix?: string;
  byteLength?: number;
}): GeneratedApiKeySecret {
  const prefix = options?.prefix ?? DEFAULT_PREFIX;
  const byteLength = options?.byteLength ?? DEFAULT_KEY_BYTES;
  const random = crypto.randomBytes(byteLength).toString("base64url");
  const secret = `${prefix}${random}`;
  const start = secret.slice(prefix.length, prefix.length + 6);
  const hashed = hashApiKey(secret);
  return {
    secret,
    prefix,
    start,
    hashed,
  };
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

export function serializeApiKeyMetadata(metadata: ApiKeyMetadata): string {
  return JSON.stringify(metadata);
}
