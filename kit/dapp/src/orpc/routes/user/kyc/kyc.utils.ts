import { env } from "@/lib/env";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  // Use Bun's native crypto for key derivation - much faster than scrypt
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  // Combine password and salt
  const combined = Buffer.concat([passwordBytes, salt]);

  // Use Web Crypto API for SHA-256 (available in Bun)
  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);

  return Buffer.from(hashBuffer);
}

export async function encryptData(plaintext: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await deriveKey(env.SETTLEMINT_HASURA_ADMIN_SECRET, salt);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
}

export async function decryptData(encryptedData: string): Promise<string> {
  const buffer = Buffer.from(encryptedData, "base64");

  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + TAG_LENGTH
  );
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = await deriveKey(env.SETTLEMINT_HASURA_ADMIN_SECRET, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = decipher.update(encrypted);
  return decrypted.toString("utf8") + decipher.final("utf8");
}
