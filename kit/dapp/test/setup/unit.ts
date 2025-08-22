import { afterEach, vi } from "vitest";
import "../mocks/recharts";

// Make vi globally available for module-level mocking
(globalThis as any).vi = vi;

// Conditionally load DOM testing utilities only when a DOM is available
const hasDOM = typeof document !== "undefined";
let rtl: typeof import("@testing-library/react") | null = null;
if (hasDOM) {
  await import("@testing-library/jest-dom/vitest");
  rtl = await import("@testing-library/react");
  rtl.configure({
    asyncUtilTimeout: 2000,
    reactStrictMode: false,
  });
}

// Make React's act available globally for happy-dom compatibility
// This prevents "not wrapped in act" warnings
(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// Set up environment variables for tests
process.env.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS =
  '["http://localhost:8000/subgraphs/name/kit"]';
process.env.SETTLEMINT_ACCESS_TOKEN = "sm_aat_test_token";
process.env.SETTLEMINT_HASURA_ENDPOINT = "http://localhost:8080";
process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test_secret";
process.env.SETTLEMINT_POSTGRES_URL =
  "postgres://user:pass@localhost:5432/testdb";
process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT =
  "http://localhost:7701/graphql";

// jest-dom matchers already extended via import

// Cleanup after each test case (only in DOM env)
afterEach(() => {
  if (rtl) {
    rtl.cleanup();
  }
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

// Mock Better Auth root export to provide a spy-able logger used by helpers
vi.mock("better-auth", () => {
  const logger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
  return { logger };
});

// Mock the auth client module used by offchain permissions middleware
vi.mock("@/lib/auth/auth.client", () => ({
  authClient: {
    admin: {
      checkRolePermission: vi.fn(() => true),
    },
    useSignIn: () => ({ email: vi.fn() }),
    useSignOut: () => ({ signOut: vi.fn() }),
    getSession: vi.fn(async () => ({ data: { user: { id: "test" } } })),
  },
}));

// Mock the server-side auth config to avoid DB imports
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(async () => null),
    },
  },
}));

// Prevent importing settings.read which pulls DB middleware (and DB) into graph
vi.mock("@/orpc/routes/settings/routes/settings.read", () => ({
  read: {},
}));
