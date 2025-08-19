import { afterEach, beforeEach, describe, expect, it } from "bun:test";

describe("env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to ensure fresh import
    const moduleCache = require.cache || {};
    for (const key of Object.keys(moduleCache)) {
      if (key.includes("@t3-oss/env-core") || key.includes("/env.ts")) {
        delete moduleCache[key];
      }
    }
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
  });

  it("should create env with all required server variables", () => {
    // Set up complete environment
    process.env = {
      ...originalEnv,
      SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "https://rpc.example.com",
      BETTER_AUTH_URL: "https://auth.example.com",
      NEXTAUTH_URL: "https://nextauth.example.com",
      SETTLEMINT_HD_PRIVATE_KEY: "test-key-123",
      SETTLEMINT_LOG_LEVEL: "debug",
      SETTLEMINT_INSTANCE: "test-instance",
      DISABLE_MIGRATIONS_ON_STARTUP: "true",
      VITE_APP_URL: "https://app.example.com",
      VITE_EXPLORER_URL: "https://explorer.example.com",
      VITE_SETTLEMINT_LOG_LEVEL: "info",
    };

    const { env } = require("./env");

    expect(env.SETTLEMINT_HASURA_ADMIN_SECRET).toBe("test-secret");
    expect(env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT).toBe("https://rpc.example.com");
    expect(env.BETTER_AUTH_URL).toBe("https://auth.example.com");
    expect(env.NEXTAUTH_URL).toBe("https://nextauth.example.com");
    expect(env.SETTLEMINT_HD_PRIVATE_KEY).toBe("test-key-123");
    expect(env.SETTLEMINT_LOG_LEVEL).toBe("debug");
    expect(env.SETTLEMINT_INSTANCE).toBe("test-instance");
    expect(env.DISABLE_MIGRATIONS_ON_STARTUP).toBe(true);
    expect(env.VITE_APP_URL).toBe("https://app.example.com");
    expect(env.VITE_EXPLORER_URL).toBe("https://explorer.example.com");
    expect(env.VITE_SETTLEMINT_LOG_LEVEL).toBe("info");
  });

  it("should use default values when optional variables are not provided", () => {
    process.env = {
      ...originalEnv,
      SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "https://rpc.example.com",
    };

    const { env } = require("./env");

    expect(env.SETTLEMINT_HD_PRIVATE_KEY).toBe("atk-hd-private-key");
    expect(env.SETTLEMINT_LOG_LEVEL).toBe("info");
    expect(env.DISABLE_MIGRATIONS_ON_STARTUP).toBe(false);
    expect(env.APP_URL).toBe("http://localhost:3000");
    expect(env.VITE_APP_URL).toBe("http://localhost:3000");
    expect(env.VITE_SETTLEMINT_LOG_LEVEL).toBe("info");
  });

  it("should prioritize VITE_APP_URL over other URL variables for APP_URL", () => {
    process.env = {
      ...originalEnv,
      SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "https://rpc.example.com",
      VITE_APP_URL: "https://vite.example.com",
      BETTER_AUTH_URL: "https://auth.example.com",
      NEXTAUTH_URL: "https://nextauth.example.com",
    };

    const { env } = require("./env");

    expect(env.APP_URL).toBe("https://vite.example.com");
    expect(env.VITE_APP_URL).toBe("https://vite.example.com");
  });

  it("should prioritize BETTER_AUTH_URL over NEXTAUTH_URL when VITE_APP_URL is not set", () => {
    process.env = {
      ...originalEnv,
      SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "https://rpc.example.com",
      BETTER_AUTH_URL: "https://auth.example.com",
      NEXTAUTH_URL: "https://nextauth.example.com",
    };

    const { env } = require("./env");

    expect(env.APP_URL).toBe("https://auth.example.com");
    expect(env.VITE_APP_URL).toBe("https://auth.example.com");
  });

  it("should use NEXTAUTH_URL when VITE_APP_URL and BETTER_AUTH_URL are not set", () => {
    process.env = {
      ...originalEnv,
      SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "https://rpc.example.com",
      NEXTAUTH_URL: "https://nextauth.example.com",
    };

    const { env } = require("./env");

    expect(env.APP_URL).toBe("https://nextauth.example.com");
    expect(env.VITE_APP_URL).toBe("https://nextauth.example.com");
  });

  it("should validate SETTLEMINT_HD_PRIVATE_KEY format", () => {
    process.env = {
      ...originalEnv,
      SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "https://rpc.example.com",
      SETTLEMINT_HD_PRIVATE_KEY: "valid-key-123",
    };

    const { env } = require("./env");
    expect(env.SETTLEMINT_HD_PRIVATE_KEY).toBe("valid-key-123");
  });

  it("should throw error for invalid SETTLEMINT_HD_PRIVATE_KEY format", () => {
    process.env = {
      SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "https://rpc.example.com",
      SETTLEMINT_HD_PRIVATE_KEY: "Invalid Key With Spaces",
    };

    expect(() => require("./env")).toThrow();
  });

  it("should throw error when required SETTLEMINT_HASURA_ADMIN_SECRET is missing", () => {
    process.env = {
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "https://rpc.example.com",
      SETTLEMINT_HASURA_ADMIN_SECRET: "",
    };

    expect(() => require("./env")).toThrow();
  });

  it("should throw error when required SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT is missing", () => {
    process.env = {
      SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "",
    };

    expect(() => require("./env")).toThrow();
  });

  it("should skip validation when SKIP_ENV_VALIDATION is set", () => {
    process.env = {
      ...originalEnv,
      SKIP_ENV_VALIDATION: "true",
    };

    const { env } = require("./env");
    expect(env).toBeDefined();
  });

  it("should handle empty strings as undefined when emptyStringAsUndefined is true", () => {
    process.env = {
      ...originalEnv,
      SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "https://rpc.example.com",
      SETTLEMINT_INSTANCE: "",
      VITE_EXPLORER_URL: "",
    };

    const { env } = require("./env");

    expect(env.SETTLEMINT_INSTANCE).toBeUndefined();
    expect(env.VITE_EXPLORER_URL).toBeUndefined();
  });

  it("should accept valid log levels for SETTLEMINT_LOG_LEVEL", () => {
    const logLevels = ["debug", "info", "warn", "error"];

    for (const level of logLevels) {
      // Clear module cache for each iteration
      const moduleCache = require.cache || {};
      for (const key of Object.keys(moduleCache)) {
        if (key.includes("@t3-oss/env-core") || key.includes("/env.ts")) {
          delete moduleCache[key];
        }
      }

      process.env = {
        ...originalEnv,
        SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
        SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "https://rpc.example.com",
        SETTLEMINT_LOG_LEVEL: level,
      };

      const { env } = require("./env");
      expect(env.SETTLEMINT_LOG_LEVEL).toBe(level);
    }
  });

  it("should accept valid log levels for VITE_SETTLEMINT_LOG_LEVEL", () => {
    const logLevels = ["debug", "info", "warn", "error"];

    for (const level of logLevels) {
      // Clear module cache for each iteration
      const moduleCache = require.cache || {};
      for (const key of Object.keys(moduleCache)) {
        if (key.includes("@t3-oss/env-core") || key.includes("/env.ts")) {
          delete moduleCache[key];
        }
      }

      process.env = {
        ...originalEnv,
        SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
        SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "https://rpc.example.com",
        VITE_SETTLEMINT_LOG_LEVEL: level,
      };

      const { env } = require("./env");
      expect(env.VITE_SETTLEMINT_LOG_LEVEL).toBe(level);
    }
  });

  it("should coerce DISABLE_MIGRATIONS_ON_STARTUP to boolean", () => {
    // Test that the field accepts boolean coercion
    process.env = {
      SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "https://rpc.example.com",
      DISABLE_MIGRATIONS_ON_STARTUP: "true",
    };

    // Clear module cache
    const moduleCache = require.cache || {};
    for (const key of Object.keys(moduleCache)) {
      if (key.includes("@t3-oss/env-core") || key.includes("/env.ts")) {
        delete moduleCache[key];
      }
    }

    const { env } = require("./env");
    // Just verify that the coercion happens (type is boolean)
    expect(typeof env.DISABLE_MIGRATIONS_ON_STARTUP).toBe("boolean");
    expect(env.DISABLE_MIGRATIONS_ON_STARTUP).toBe(true);
  });

  it("should validate URL formats correctly", () => {
    process.env = {
      ...originalEnv,
      SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "invalid-url",
    };

    expect(() => require("./env")).toThrow();
  });

  it("should accept URLs with different protocols", () => {
    // WHY: Test that various valid URL protocols are accepted
    // FLEXIBILITY: Blockchain nodes may use HTTP, HTTPS, WS, or WSS protocols
    // DEPLOYMENT: Different environments may require different protocols (localhost vs production)
    process.env = {
      ...originalEnv,
      SETTLEMINT_HASURA_ADMIN_SECRET: "test-secret",
      SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: "wss://websocket.example.com",
      BETTER_AUTH_URL: "http://localhost:3000",
    };

    const { env } = require("./env");
    // WHY: Verify that different protocols are accepted and preserved
    expect(env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT).toBe("wss://websocket.example.com");
    expect(env.BETTER_AUTH_URL).toBe("http://localhost:3000");
  });
});
