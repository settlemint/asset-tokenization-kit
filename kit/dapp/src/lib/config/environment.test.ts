import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getClientEnvironment, getServerEnvironment } from "./environment";

describe("environment configuration", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Clear environment
    Object.keys(process.env).forEach((key) => {
      delete process.env[key];
    });
  });

  afterEach(() => {
    // Restore original environment
    Object.keys(process.env).forEach((key) => {
      delete process.env[key];
    });
    Object.assign(process.env, originalEnv);
  });

  describe("getServerEnvironment", () => {
    it("should validate valid server environment", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.SETTLEMINT_HD_PRIVATE_KEY =
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

      const env = getServerEnvironment();

      expect(env.SETTLEMINT_HASURA_ADMIN_SECRET).toBe("test-secret");
      expect(env.SETTLEMINT_HD_PRIVATE_KEY).toBe(
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      expect(env.APP_URL).toBe("https://example.com");
    });

    it("should use fallback APP_URL when NEXT_PUBLIC_APP_URL is not set", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.SETTLEMINT_HD_PRIVATE_KEY =
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      process.env.BETTER_AUTH_URL = "https://auth.example.com";

      const env = getServerEnvironment();

      expect(env.APP_URL).toBe("https://auth.example.com");
    });

    it("should use default localhost URL when no URL env vars are set", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.SETTLEMINT_HD_PRIVATE_KEY =
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

      const env = getServerEnvironment();

      expect(env.APP_URL).toBe("http://localhost:3000");
    });

    it("should throw on missing required SETTLEMINT_HASURA_ADMIN_SECRET", () => {
      process.env.SETTLEMINT_HD_PRIVATE_KEY =
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

      expect(() => getServerEnvironment()).toThrow();
    });

    it("should throw on missing required SETTLEMINT_HD_PRIVATE_KEY", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";

      expect(() => getServerEnvironment()).toThrow();
    });

    it("should validate HD private key format", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";

      // Valid formats - hex private key
      process.env.SETTLEMINT_HD_PRIVATE_KEY =
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      expect(() => getServerEnvironment()).not.toThrow();

      // Valid formats - BIP39 mnemonic phrase (12 words)
      process.env.SETTLEMINT_HD_PRIVATE_KEY =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      expect(() => getServerEnvironment()).not.toThrow();

      // Invalid formats
      process.env.SETTLEMINT_HD_PRIVATE_KEY = "UPPERCASE";
      expect(() => getServerEnvironment()).toThrow();

      process.env.SETTLEMINT_HD_PRIVATE_KEY = "has spaces";
      expect(() => getServerEnvironment()).toThrow();

      process.env.SETTLEMINT_HD_PRIVATE_KEY = "special@chars";
      expect(() => getServerEnvironment()).toThrow();
    });

    it("should validate URL formats", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.SETTLEMINT_HD_PRIVATE_KEY =
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

      // Invalid URL
      process.env.NEXT_PUBLIC_APP_URL = "not-a-url";
      expect(() => getServerEnvironment()).toThrow();

      // Valid URL
      process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
      expect(() => getServerEnvironment()).not.toThrow();
    });

    it("should handle optional OAuth configs", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.SETTLEMINT_HD_PRIVATE_KEY =
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      process.env.GOOGLE_CLIENT_ID = "google-id";
      process.env.GOOGLE_CLIENT_SECRET = "google-secret";
      process.env.GITHUB_CLIENT_ID = "github-id";
      process.env.GITHUB_CLIENT_SECRET = "github-secret";

      const env = getServerEnvironment();

      expect(env.GOOGLE_CLIENT_ID).toBe("google-id");
      expect(env.GOOGLE_CLIENT_SECRET).toBe("google-secret");
      expect(env.GITHUB_CLIENT_ID).toBe("github-id");
      expect(env.GITHUB_CLIENT_SECRET).toBe("github-secret");
    });

    it("should handle optional RESEND_API_KEY", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.SETTLEMINT_HD_PRIVATE_KEY =
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      process.env.RESEND_API_KEY = "resend-key";

      const env = getServerEnvironment();

      expect(env.RESEND_API_KEY).toBe("resend-key");
    });
  });

  describe("getClientEnvironment", () => {
    it("should validate valid client environment", () => {
      process.env.NEXT_PUBLIC_EXPLORER_URL = "https://explorer.example.com";

      const env = getClientEnvironment();

      expect(env.NEXT_PUBLIC_EXPLORER_URL).toBe("https://explorer.example.com");
    });

    it("should allow missing optional explorer URL", () => {
      const env = getClientEnvironment();

      expect(env.NEXT_PUBLIC_EXPLORER_URL).toBeUndefined();
    });

    it("should validate explorer URL format", () => {
      process.env.NEXT_PUBLIC_EXPLORER_URL = "not-a-url";

      expect(() => getClientEnvironment()).toThrow();
    });
  });
});
