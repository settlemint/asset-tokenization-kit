import { mock } from "bun:test";

// Mock database operations
export const mockInsert = mock(() => ({
  values: mock(() => Promise.resolve()),
}));

export const mockUpdate = mock(() => ({
  set: mock(() => ({
    where: mock(() => Promise.resolve()),
  })),
}));

export const mockSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => ({
      execute: mock(() => []),
    })),
  })),
}));

// Mock the db module
mock.module("@/lib/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  },
}));
