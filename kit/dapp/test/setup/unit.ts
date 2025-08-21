/**
 * Unit test environment setup and global mocking configuration.
 *
 * TESTING STRATEGY: Configures comprehensive test environment for React/Node.js hybrid testing.
 * Handles both DOM-based component tests and server-side API route testing with appropriate
 * mocking strategies for external dependencies.
 *
 * ARCHITECTURE: Lazy-loads DOM testing utilities only when needed to support headless
 * API testing without DOM overhead. Uses conditional imports to maintain performance.
 */

import { afterEach, vi } from "vitest";
import "../mocks/recharts";

// TESTING: Expose Vitest mocking utilities globally for module-level mocks in import statements
// WHY: Enables mocking at module scope, required for intercepting imports before they load
(globalThis as any).vi = vi;

// PERF: Lazy-load DOM testing utilities only when DOM environment is available
// WHY: Enables headless API testing without DOM overhead while supporting component tests
const hasDOM = typeof document !== "undefined";
let rtl: typeof import("@testing-library/react") | null = null;
if (hasDOM) {
  await import("@testing-library/jest-dom/vitest");
  rtl = await import("@testing-library/react");
  // TESTING: Configure React Testing Library for better test reliability
  rtl.configure({
    asyncUtilTimeout: 2000, // Longer timeout for async operations in 2FA flows
    reactStrictMode: false, // Disable strict mode to avoid double-effect execution in tests
  });
}

// TESTING: Configure React act() environment for happy-dom compatibility
// WHY: Prevents "not wrapped in act" warnings during async state updates in component tests
(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// TESTING: Configure test environment variables for service integrations
// WHY: Provides consistent test configuration that matches development environment patterns
process.env.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS =
  '["http://localhost:8000/subgraphs/name/kit"]'; // Mock subgraph endpoints
process.env.SETTLEMINT_ACCESS_TOKEN = "sm_aat_test_token"; // Portal access token for API calls
process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT =
  "http://localhost:4000/graphql"; // Portal GraphQL endpoint for 2FA operations
process.env.SETTLEMINT_HASURA_ENDPOINT = "http://localhost:8080"; // Hasura GraphQL endpoint
process.env.SETTLEMINT_HASURA_ADMIN_SECRET = "test_secret"; // Hasura admin access
process.env.SETTLEMINT_POSTGRES_URL =
  "postgres://user:pass@localhost:5432/testdb"; // Database connection for ORM operations

// TESTING: jest-dom matchers automatically extended via import above when DOM is available

// TESTING: Clean up React Testing Library state after each test to prevent test pollution
// WHY: Ensures isolated test execution by removing rendered components between tests
afterEach(() => {
  if (rtl) {
    rtl.cleanup();
  }
});

// TESTING: Mock window.matchMedia for CSS media query support in components
// WHY: JSDOM doesn't implement matchMedia, but components may use it for responsive behavior
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false, // Default to no matches for consistent test behavior
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated but still used by some libraries
      removeListener: vi.fn(), // deprecated but still used by some libraries
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// TESTING: Mock IntersectionObserver for components with scroll-based interactions
// WHY: JSDOM doesn't implement IntersectionObserver but components may use it for lazy loading
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// TESTING: Mock ResizeObserver for components that respond to size changes
// WHY: JSDOM doesn't implement ResizeObserver but components may use it for responsive behavior
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// TESTING: Mock Better Auth logger for testing auth-related operations
// WHY: Provides spy-able logger instance used by auth helpers and middleware
vi.mock("better-auth", () => {
  const logger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
  return { logger };
});

// TESTING: Mock auth client for testing permission middleware without authentication flows
// WHY: Enables testing of protected routes without complex auth setup
vi.mock("@/lib/auth/auth.client", () => ({
  authClient: {
    admin: {
      checkRolePermission: vi.fn(() => true), // Default to authorized for most tests
    },
    useSignIn: () => ({ email: vi.fn() }),
    useSignOut: () => ({ signOut: vi.fn() }),
    getSession: vi.fn(async () => ({ data: { user: { id: "test" } } })), // Mock authenticated user
  },
}));

// TESTING: Mock server-side auth config to avoid database dependencies in unit tests
// WHY: Prevents database imports in test environment while maintaining API surface
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(async () => null), // Default to no session for isolation
    },
  },
}));

// TESTING: Mock settings.read route to prevent database middleware loading in test imports
// WHY: Breaks circular dependency chain that would pull database connections into test graph
vi.mock("@/orpc/routes/settings/routes/settings.read", () => ({
  read: {}, // Empty mock prevents middleware cascade
}));
