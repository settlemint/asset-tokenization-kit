import { vi } from "vitest";

export const auth = {
  api: {
    getSession: vi.fn(async () => null),
  },
} as const;

export type Session = unknown;
export type SessionUser = { id: string };

// Mock plugin client exports that are imported by test fixtures
export const pincodeClient = vi.fn(() => ({}));
export const secretCodesClient = vi.fn(() => ({}));
export const twoFactorClient = vi.fn(() => ({}));

// Mock permissions utilities
export const accessControl = {} as const;
export const adminRole = {} as const;
export const investorRole = {} as const;
export const issuerRole = {} as const;
