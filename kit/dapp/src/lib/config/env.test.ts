import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { z } from "zod";

/**
 * Test suite for environment configuration using t3-env.
 * Tests environment variable validation, type safety, and error handling.
 */
describe("Environment Configuration", () => {
  // Store original env vars to restore after tests
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save current environment
    originalEnv = { ...process.env };
    
    // Clear all env vars to test from clean state
    for (const key in process.env) {
      delete process.env[key];
    }
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
    
    // Clear module cache to force re-evaluation of env
    delete require.cache[require.resolve("./env")];
  });

  describe("Server Environment Variables", () => {
    it("should validate required SETTLEMINT_HASURA_ADMIN_SECRET", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      
      const { env } = require("./env");
      expect(env.SETTLEMINT_HASURA_ADMIN_SECRET).toBe("test-secret");
    });

    it("should throw error when SETTLEMINT_HASURA_ADMIN_SECRET is missing", () => {
      expect(() => {
        require("./env");
      }).toThrow();
    });

    it("should provide default value for SETTLEMINT_HD_PRIVATE_KEY", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      
      const { env } = require("./env");
      expect(env.SETTLEMINT_HD_PRIVATE_KEY).toBe("atk-hd-private-key");
    });

    it("should validate SETTLEMINT_HD_PRIVATE_KEY format", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.SETTLEMINT_HD_PRIVATE_KEY = "invalid key with spaces";
      
      expect(() => {
        require("./env");
      }).toThrow();
    });

    it("should accept valid SETTLEMINT_HD_PRIVATE_KEY format", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.SETTLEMINT_HD_PRIVATE_KEY = "valid-key-123";
      
      const { env } = require("./env");
      expect(env.SETTLEMINT_HD_PRIVATE_KEY).toBe("valid-key-123");
    });

    it("should validate URL format for BETTER_AUTH_URL", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.BETTER_AUTH_URL = "not-a-url";
      
      expect(() => {
        require("./env");
      }).toThrow();
    });

    it("should accept valid URL for BETTER_AUTH_URL", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.BETTER_AUTH_URL = "https://example.com";
      
      const { env } = require("./env");
      expect(env.BETTER_AUTH_URL).toBe("https://example.com");
    });

    it("should use fallback values for APP_URL", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      
      const { env } = require("./env");
      expect(env.APP_URL).toBe("http://localhost:3000");
    });

    it("should prioritize NEXT_PUBLIC_APP_URL for APP_URL", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
      
      const { env } = require("./env");
      expect(env.APP_URL).toBe("https://app.example.com");
    });

    it("should prioritize BETTER_AUTH_URL over NEXTAUTH_URL for APP_URL", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.BETTER_AUTH_URL = "https://better.example.com";
      process.env.NEXTAUTH_URL = "https://nextauth.example.com";
      
      const { env } = require("./env");
      expect(env.APP_URL).toBe("https://better.example.com");
    });
  });

  describe("Client Environment Variables", () => {
    it("should accept optional client env vars", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
      process.env.NEXT_PUBLIC_EXPLORER_URL = "https://explorer.example.com";
      
      const { env } = require("./env");
      expect(env.NEXT_PUBLIC_APP_URL).toBe("https://app.example.com");
      expect(env.NEXT_PUBLIC_EXPLORER_URL).toBe("https://explorer.example.com");
    });

    it("should allow undefined client env vars", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      
      const { env } = require("./env");
      expect(env.NEXT_PUBLIC_APP_URL).toBeUndefined();
      expect(env.NEXT_PUBLIC_EXPLORER_URL).toBeUndefined();
    });
  });

  describe("OAuth Provider Variables", () => {
    it("should accept optional OAuth credentials", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.GOOGLE_CLIENT_ID = "google-id";
      process.env.GOOGLE_CLIENT_SECRET = "google-secret";
      process.env.GITHUB_CLIENT_ID = "github-id";
      process.env.GITHUB_CLIENT_SECRET = "github-secret";
      
      const { env } = require("./env");
      expect(env.GOOGLE_CLIENT_ID).toBe("google-id");
      expect(env.GOOGLE_CLIENT_SECRET).toBe("google-secret");
      expect(env.GITHUB_CLIENT_ID).toBe("github-id");
      expect(env.GITHUB_CLIENT_SECRET).toBe("github-secret");
    });
  });

  describe("Skip Validation", () => {
    it("should skip validation when SKIP_ENV_VALIDATION is set", () => {
      process.env.SKIP_ENV_VALIDATION = "true";
      // Don't set required vars - should not throw
      
      expect(() => {
        require("./env");
      }).not.toThrow();
    });
  });

  describe("Empty String Handling", () => {
    it("should treat empty strings as undefined", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.RESEND_API_KEY = "";
      
      const { env } = require("./env");
      expect(env.RESEND_API_KEY).toBeUndefined();
    });
  });

  describe("Legacy Functions", () => {
    it("should support getServerEnvironment function", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      
      const { getServerEnvironment } = require("./env");
      const serverEnv = getServerEnvironment();
      
      expect(serverEnv.SETTLEMINT_HASURA_ADMIN_SECRET).toBe("test-secret");
    });

    it("should support getClientEnvironment function", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
      process.env.NEXT_PUBLIC_EXPLORER_URL = "https://explorer.example.com";
      
      const { getClientEnvironment } = require("./env");
      const clientEnv = getClientEnvironment();
      
      expect(clientEnv.NEXT_PUBLIC_APP_URL).toBe("https://app.example.com");
      expect(clientEnv.NEXT_PUBLIC_EXPLORER_URL).toBe("https://explorer.example.com");
      // Should not include server vars
      expect((clientEnv as any).SETTLEMINT_HASURA_ADMIN_SECRET).toBeUndefined();
    });
  });

  describe("Type Exports", () => {
    it("should export ServerEnvironment type", () => {
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      
      const { env } = require("./env");
      // Type test - this is more for compilation checking
      const serverEnv: typeof env = env;
      expect(serverEnv).toBeDefined();
    });
  });
});