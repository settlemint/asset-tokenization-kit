import { env } from "@/lib/env";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  // Use Bun's native crypto for key derivation - much faster than scrypt
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  // Combine password and salt
  const combined = new Uint8Array(passwordBytes.length + salt.length);
  combined.set(passwordBytes, 0);
  combined.set(salt, passwordBytes.length);

  // Use Web Crypto API for SHA-256 (available in Bun)
  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);

  return new Uint8Array(hashBuffer);
}

export async function encryptData(plaintext: string): Promise<string> {
  const salt = new Uint8Array(randomBytes(SALT_LENGTH));
  const key = await deriveKey(env.SETTLEMINT_HASURA_ADMIN_SECRET, salt);
  const iv = new Uint8Array(randomBytes(IV_LENGTH));
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const update = cipher.update(plaintext, "utf8");
  const final = cipher.final();
  const encrypted = new Uint8Array(update.length + final.length);
  encrypted.set(update, 0);
  encrypted.set(final, update.length);

  const tag = new Uint8Array(cipher.getAuthTag());

  // Concatenate all parts
  const result = new Uint8Array(
    salt.length + iv.length + tag.length + encrypted.length
  );
  let offset = 0;
  result.set(salt, offset);
  offset += salt.length;
  result.set(iv, offset);
  offset += iv.length;
  result.set(tag, offset);
  offset += tag.length;
  result.set(encrypted, offset);

  return Buffer.from(result).toString("base64");
}

export async function decryptData(encryptedData: string): Promise<string> {
  const buffer = Buffer.from(encryptedData, "base64");
  const data = new Uint8Array(buffer);

  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = data.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + TAG_LENGTH
  );
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = await deriveKey(env.SETTLEMINT_HASURA_ADMIN_SECRET, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = decipher.update(encrypted);
  return decrypted.toString("utf8") + decipher.final("utf8");
}
