import { vi } from "vitest";

export const authClient = {
  admin: {
    checkRolePermission: vi.fn(() => true),
  },
  useSignIn: () => ({ email: vi.fn() }),
  useSignOut: () => ({ signOut: vi.fn() }),
  getSession: vi.fn(async () => ({ data: { user: { id: "test" } } })),
} as const;
