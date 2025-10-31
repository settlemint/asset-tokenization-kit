/**
 * OpenAPI Schema Generation Tests
 *
 * These tests verify that the OpenAPI schema can be generated successfully
 * from the router without errors. This is critical for ensuring our API
 * documentation and client SDK generation work correctly.
 *
 * @vitest-environment node
 */

import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { beforeAll, describe, expect, it, vi } from "vitest";

// Mock all server-side dependencies before importing router
vi.mock("@/lib/settlemint/the-graph", () => ({
  theGraphClient: {},
  theGraphGraphql: vi.fn(),
  theGraphClientKit: {},
  theGraphGraphqlKit: vi.fn(),
}));

vi.mock("@/lib/settlemint/postgres", () => ({
  getPostgresConnectionString: vi.fn(() => "postgresql://mock"),
}));

vi.mock("@/lib/db/index", () => ({
  db: {},
  migrateDatabase: vi.fn(),
}));

vi.mock("@/lib/settlemint/portal", () => ({
  portalClient: {},
  portalGraphql: vi.fn(),
}));

// Set required environment variables
process.env.SETTLEMINT_HASURA_DATABASE_URL = "postgresql://mock:5432/mock";
process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "mock-admin-secret";
process.env.SETTLEMINT_THEGRAPH_ENDPOINT =
  "http://localhost:8000/subgraphs/name/test";
process.env.SETTLEMINT_PORTAL_URL = "http://localhost:8080";
process.env.SETTLEMINT_MINIO_ENDPOINT = "http://localhost:9000";
process.env.SETTLEMINT_MINIO_ACCESS_KEY = "mock";
process.env.SETTLEMINT_MINIO_SECRET_KEY = "mocksecret";
process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT =
  "http://localhost:8545";

// Dynamically import router after mocks are set up
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let router: any;
beforeAll(async () => {
  const module = await import("./routes/router");
  router = module.router;
});

describe("OpenAPI Schema Generation", () => {
  it("should generate OpenAPI spec without throwing errors", async () => {
    const generator = new OpenAPIGenerator({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    });

    // This test verifies that the generator doesn't throw
    // The original error showed generation errors for specific routes
    const spec = await generator.generate(router, {
      info: {
        title: "Asset Tokenization Kit API",
        version: "1.0.0",
        description: "API for the SettleMint Asset Tokenization Kit",
      },
    });

    expect(spec).toBeDefined();
    expect(spec.openapi).toMatch(/^3\.1\./);
    expect(spec.info.title).toBe("Asset Tokenization Kit API");
  });

  it("should generate paths for all major route groups", async () => {
    const generator = new OpenAPIGenerator({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    });

    const spec = await generator.generate(router, {
      info: {
        title: "Asset Tokenization Kit API",
        version: "1.0.0",
      },
    });

    expect(spec.paths).toBeDefined();
    const paths = Object.keys(spec.paths || {});

    // Verify we have paths for major route groups
    const hasSystemPaths = paths.some((path) => path.startsWith("/system"));
    const hasUserPaths = paths.some((path) => path.startsWith("/user"));
    const hasTokenPaths = paths.some((path) => path.startsWith("/token"));

    expect(hasSystemPaths).toBe(true);
    expect(hasUserPaths).toBe(true);
    expect(hasTokenPaths).toBe(true);
  });

  it("should include security schemes in the spec", async () => {
    const generator = new OpenAPIGenerator({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    });

    const spec = await generator.generate(router, {
      info: {
        title: "Asset Tokenization Kit API",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: "apiKey",
            in: "header",
            name: "X-Api-Key",
            description: "API key for authentication",
          },
        },
      },
    });

    expect(spec.components?.securitySchemes).toBeDefined();
    expect(spec.components?.securitySchemes?.apiKey).toBeDefined();
  });

  it("should generate specs for routes with path parameters", async () => {
    const generator = new OpenAPIGenerator({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    });

    const spec = await generator.generate(router, {
      info: {
        title: "Test API",
        version: "1.0.0",
      },
    });

    // Check if routes with path params are included
    const paths = Object.keys(spec.paths || {});
    const pathsWithParams = paths.filter((path) => path.includes("{"));
    expect(pathsWithParams.length).toBeGreaterThan(0);
  });

  it("should generate specs for GET routes", async () => {
    const generator = new OpenAPIGenerator({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    });

    const spec = await generator.generate(router, {
      info: {
        title: "Test API",
        version: "1.0.0",
      },
    });

    // Find GET routes in the spec
    const getPaths = Object.entries(spec.paths || {}).filter(
      ([, pathItem]) => pathItem?.get
    );

    expect(getPaths.length).toBeGreaterThan(0);
  });
});
