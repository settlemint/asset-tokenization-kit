import { vi } from "vitest";

// Mock portal client and graphql
export const portalClient = {
  query: vi.fn(),
  mutation: vi.fn(),
  request: vi.fn(),
};

export const portalGraphql = vi.fn((query: unknown) => query);

// Mock createPortalClient for cases where the original file is imported
export const createPortalClient = vi.fn(() => ({
  client: portalClient,
  graphql: portalGraphql,
}));
