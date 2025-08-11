import { vi } from "vitest";

// Mock implementations for better-auth/client/plugins
export const adminClient = vi.fn(() => ({}));
export const apiKeyClient = vi.fn(() => ({}));
export const customSessionClient = vi.fn(() => ({}));
export const inferAdditionalFields = vi.fn(() => ({}));
export const passkeyClient = vi.fn(() => ({}));

// Mock implementation for better-auth/react
export const createAuthClient = vi.fn((_config?: unknown) => {
  return {
    useSignIn: () => ({ email: vi.fn() }),
    useSignOut: () => ({ signOut: vi.fn() }),
    getSession: vi.fn(async () => ({
      data: { user: { id: "test", wallet: "0x0" } },
    })),
  } as const;
});

// Mock permissions plugin APIs used by src/lib/auth/permissions.ts
export const createAccessControl = vi.fn(
  (statements: Record<string, unknown>) => {
    return {
      newRole: (roleStatements: Record<string, unknown>) => ({
        ...roleStatements,
      }),
      statements,
    } as const;
  }
);

export const adminAc = { statements: {} } as const;
export const defaultStatements = {} as const;

// Types used in code are erased at runtime; provide minimal placeholders
export type Subset<_K, _T> = unknown;
