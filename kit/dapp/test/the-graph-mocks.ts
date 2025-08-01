import { vi } from "vitest";

// Prevent module initialization by mocking environment
if (
  typeof process !== "undefined" &&
  !process.env.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS
) {
  process.env.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS = "[]";
}

// Mock theGraphClientKit with proper structure
export const theGraphClientKit = {
  request: vi.fn(),
  query: vi.fn(),
};

// Mock theGraphGraphqlKit
export const theGraphGraphqlKit = vi.fn();

// Export aliases used by the actual module
export const theGraphClient = theGraphClientKit;
export const theGraphGraphql = theGraphGraphqlKit;

// Mock the creation function to prevent initialization errors
export const client = theGraphClientKit;
export const graphql = theGraphGraphqlKit;
