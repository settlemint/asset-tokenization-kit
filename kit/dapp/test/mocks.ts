import { vi } from "vitest";

// Mock logger factory
export const mockLogger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  fatal: vi.fn(),
  child: vi.fn(() => mockLogger),
};

export const createLogger = vi.fn(() => mockLogger);

// Mock requestLogger
export const requestLogger = vi.fn(() => (fetch: any) => fetch);
