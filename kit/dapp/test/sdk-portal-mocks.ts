import { vi } from "vitest";

// Mock handleWalletVerificationChallenge
export const handleWalletVerificationChallenge = vi.fn(() =>
  Promise.resolve({
    challengeResponse: "mocked-response",
    verificationId: "mocked-verification-id",
  })
);

// Mock createPortalClient
export const createPortalClient = vi.fn(() => ({
  client: {
    query: vi.fn(),
    mutation: vi.fn(),
    request: vi.fn(),
  },
  graphql: vi.fn((query: unknown) => query),
}));

// Mock getWebsocketClient
export const getWebsocketClient = vi.fn(() => ({
  subscribe: vi.fn(),
  close: vi.fn(),
}));
