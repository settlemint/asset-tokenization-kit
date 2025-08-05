import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Make vi globally available for module-level mocking
(globalThis as any).vi = vi;

// Configure React Testing Library to work properly with act
configure({
  // This ensures act() warnings are properly handled
  asyncUtilTimeout: 2000,
  // Note: reactStrictMode causes double-mounting in tests which can break
  // tests that count function calls. Keeping it false for test stability.
  reactStrictMode: false,
});

// Make React's act available globally for happy-dom compatibility
// This prevents "not wrapped in act" warnings
(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// Set up environment variables for tests
process.env.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS =
  '["http://localhost:8000/subgraphs/name/kit"]';
process.env.SETTLEMINT_ACCESS_TOKEN = "sm_aat_test_token";

// jest-dom matchers already extended via import

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
