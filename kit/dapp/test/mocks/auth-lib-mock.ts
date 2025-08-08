import { vi } from "vitest";

export const auth = {
  api: {
    getSession: vi.fn(async () => null),
  },
} as const;

export type Session = unknown;
export type SessionUser = { id: string };
