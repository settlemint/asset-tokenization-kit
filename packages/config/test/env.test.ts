import { describe, expect, it, beforeEach, afterEach } from "bun:test";

describe("env", () => {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    // Save the original environment
    originalEnv = { ...process.env };
    // Clear module cache to get fresh import
    delete require.cache[require.resolve("../src/env")];
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it("should create env with all required server variables", () => {
    // Set up all required environment variables
    process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
    process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
      "https://example.com/rpc";
    process.env.SKIP_ENV_VALIDATION = "";

    const { env } = require("../src/env");

    expect(env.SETTLEMINT_HASURA_ADMIN_SECRET).toBe("test-secret");
    expect(env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT).toBe(
      "https://example.com/rpc"
    );
  });

  it("should use default values when optional variables are not provided", () => {
    process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
    process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
      "https://example.com/rpc";
    process.env.SKIP_ENV_VALIDATION = "";

    const { env } = require("../src/env");

    expect(env.APP_URL).toBe("http://localhost:3000");
    expect(env.SETTLEMINT_HD_PRIVATE_KEY).toBe("atk-hd-private-key");
    expect(env.SETTLEMINT_LOG_LEVEL).toBe("info");
    expect(env.DISABLE_MIGRATIONS_ON_STARTUP).toBe(false);
    expect(env.VITE_APP_URL).toBe("http://localhost:3000");
    expect(env.VITE_SETTLEMINT_LOG_LEVEL).toBe("info");
  });

  it("should use VITE_APP_URL for APP_URL when provided", () => {
    process.env.VITE_APP_URL = "https://app.example.com";
    process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
    process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
      "https://example.com/rpc";
    process.env.SKIP_ENV_VALIDATION = "";

    const { env } = require("../src/env");

    expect(env.APP_URL).toBe("https://app.example.com");
    expect(env.VITE_APP_URL).toBe("https://app.example.com");
  });

  it("should use BETTER_AUTH_URL for APP_URL when VITE_APP_URL is not provided", () => {
    process.env.BETTER_AUTH_URL = "https://auth.example.com";
    process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
    process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
      "https://example.com/rpc";
    process.env.SKIP_ENV_VALIDATION = "";

    const { env } = require("../src/env");

    expect(env.APP_URL).toBe("https://auth.example.com");
    expect(env.VITE_APP_URL).toBe("https://auth.example.com");
  });

  it("should use NEXTAUTH_URL for APP_URL when VITE_APP_URL and BETTER_AUTH_URL are not provided", () => {
    process.env.NEXTAUTH_URL = "https://nextauth.example.com";
    process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
    process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
      "https://example.com/rpc";
    process.env.SKIP_ENV_VALIDATION = "";

    const { env } = require("../src/env");

    expect(env.APP_URL).toBe("https://nextauth.example.com");
    expect(env.VITE_APP_URL).toBe("https://nextauth.example.com");
  });

  it("should validate HD private key format", () => {
    process.env.SETTLEMINT_HD_PRIVATE_KEY = "valid-key-123";
    process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
    process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
      "https://example.com/rpc";
    process.env.SKIP_ENV_VALIDATION = "";

    const { env } = require("../src/env");

    expect(env.SETTLEMINT_HD_PRIVATE_KEY).toBe("valid-key-123");
  });

  it("should handle different log levels", () => {
    process.env.SETTLEMINT_LOG_LEVEL = "debug";
    process.env.VITE_SETTLEMINT_LOG_LEVEL = "error";
    process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
    process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
      "https://example.com/rpc";
    process.env.SKIP_ENV_VALIDATION = "";

    const { env } = require("../src/env");

    expect(env.SETTLEMINT_LOG_LEVEL).toBe("debug");
    expect(env.VITE_SETTLEMINT_LOG_LEVEL).toBe("error");
  });

  it("should handle DISABLE_MIGRATIONS_ON_STARTUP as boolean", () => {
    process.env.DISABLE_MIGRATIONS_ON_STARTUP = "true";
    process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
    process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
      "https://example.com/rpc";
    process.env.SKIP_ENV_VALIDATION = "";

    const { env } = require("../src/env");

    expect(env.DISABLE_MIGRATIONS_ON_STARTUP).toBe(true);
  });

  it("should handle SETTLEMINT_INSTANCE when provided", () => {
    process.env.SETTLEMINT_INSTANCE = "test-instance";
    process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
    process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
      "https://example.com/rpc";
    process.env.SKIP_ENV_VALIDATION = "";

    const { env } = require("../src/env");

    expect(env.SETTLEMINT_INSTANCE).toBe("test-instance");
  });

  it("should handle VITE_EXPLORER_URL when provided", () => {
    process.env.VITE_EXPLORER_URL = "https://explorer.example.com";
    process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
    process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
      "https://example.com/rpc";
    process.env.SKIP_ENV_VALIDATION = "";

    const { env } = require("../src/env");

    expect(env.VITE_EXPLORER_URL).toBe("https://explorer.example.com");
  });

  it("should skip validation when SKIP_ENV_VALIDATION is set", () => {
    process.env.SKIP_ENV_VALIDATION = "true";
    // Don't set required variables - validation should be skipped

    const { env } = require("../src/env");

    // Should not throw even though required variables are missing
    expect(env).toBeDefined();
  });

  it("should handle empty strings as undefined", () => {
    process.env.SETTLEMINT_INSTANCE = "";
    process.env.VITE_EXPLORER_URL = "";
    process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
    process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
      "https://example.com/rpc";
    process.env.SKIP_ENV_VALIDATION = "";

    const { env } = require("../src/env");

    expect(env.SETTLEMINT_INSTANCE).toBeUndefined();
    expect(env.VITE_EXPLORER_URL).toBeUndefined();
  });

  it("should handle all valid log levels", () => {
    const logLevels = ["debug", "info", "warn", "error"];

    for (const level of logLevels) {
      process.env.SETTLEMINT_LOG_LEVEL = level;
      process.env.VITE_SETTLEMINT_LOG_LEVEL = level;
      process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
      process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
        "https://example.com/rpc";
      process.env.SKIP_ENV_VALIDATION = "";

      delete require.cache[require.resolve("../src/env")];
      const { env } = require("../src/env");

      expect(env.SETTLEMINT_LOG_LEVEL).toBe(level);
      expect(env.VITE_SETTLEMINT_LOG_LEVEL).toBe(level);
    }
  });

  it("should handle DISABLE_MIGRATIONS_ON_STARTUP coercion", () => {
    // z.coerce.boolean() treats any non-empty string as true, only empty string as false
    // Test "true" string -> true boolean
    process.env.DISABLE_MIGRATIONS_ON_STARTUP = "true";
    process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
    process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
      "https://example.com/rpc";
    process.env.SKIP_ENV_VALIDATION = "";

    delete require.cache[require.resolve("../src/env")];
    let { env } = require("../src/env");
    expect(env.DISABLE_MIGRATIONS_ON_STARTUP).toBe(true);

    // Test "false" string -> true boolean (z.coerce.boolean treats any non-empty string as true)
    process.env.DISABLE_MIGRATIONS_ON_STARTUP = "false";
    delete require.cache[require.resolve("../src/env")];
    ({ env } = require("../src/env"));
    expect(env.DISABLE_MIGRATIONS_ON_STARTUP).toBe(true);

    // Test "1" string -> true boolean
    process.env.DISABLE_MIGRATIONS_ON_STARTUP = "1";
    delete require.cache[require.resolve("../src/env")];
    ({ env } = require("../src/env"));
    expect(env.DISABLE_MIGRATIONS_ON_STARTUP).toBe(true);

    // Test "0" string -> true boolean (z.coerce.boolean treats any non-empty string as true)
    process.env.DISABLE_MIGRATIONS_ON_STARTUP = "0";
    delete require.cache[require.resolve("../src/env")];
    ({ env } = require("../src/env"));
    expect(env.DISABLE_MIGRATIONS_ON_STARTUP).toBe(true);

    // Test empty string -> false boolean (only empty string is false)
    process.env.DISABLE_MIGRATIONS_ON_STARTUP = "";
    delete require.cache[require.resolve("../src/env")];
    ({ env } = require("../src/env"));
    expect(env.DISABLE_MIGRATIONS_ON_STARTUP).toBe(false);

    // Test undefined -> false (default value)
    delete process.env.DISABLE_MIGRATIONS_ON_STARTUP;
    delete require.cache[require.resolve("../src/env")];
    ({ env } = require("../src/env"));
    expect(env.DISABLE_MIGRATIONS_ON_STARTUP).toBe(false);
  });
});
