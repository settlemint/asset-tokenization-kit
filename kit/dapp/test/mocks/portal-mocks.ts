/**
 * Portal service mocks for unit testing.
 *
 * TESTING STRATEGY: Provides comprehensive mocks for Portal GraphQL client and WebSocket
 * connections. Enables isolated testing of 2FA routes without external Portal dependencies.
 *
 * ARCHITECTURE: Mirrors actual Portal client API surface to catch integration issues early.
 * Mocks support both query/mutation patterns and the newer unified request() method.
 */

import { vi } from "vitest";

/**
 * Mock Portal GraphQL client for testing route handlers.
 *
 * WHY: Mocks the complete Portal client API surface used by 2FA routes:
 * - query/mutation for legacy patterns
 * - request() for modern unified GraphQL operations
 *
 * TESTING: Enables verification of GraphQL operation calls without external dependencies.
 */
export const portalClient = {
  query: vi.fn(),
  mutation: vi.fn(),
  request: vi.fn(), // Primary method used by inlined 2FA route handlers
};

/**
 * Mock GraphQL template tag function.
 *
 * WHY: Portal uses tagged template literals for GraphQL operations. Mock passes through
 * queries unchanged to enable inspection of GraphQL strings in tests.
 */
export const portalGraphql = vi.fn((query: unknown) => query);

/**
 * Mock Portal client factory for compatibility with different import patterns.
 *
 * WHY: Some modules may import createPortalClient factory instead of direct client.
 * Provides consistent mocking regardless of import style.
 */
export const createPortalClient = vi.fn(() => ({
  client: portalClient,
  graphql: portalGraphql,
}));

/**
 * Mock Portal WebSocket client for real-time features.
 *
 * WHY: Portal supports WebSocket subscriptions for real-time updates. Mock provides
 * standard WebSocket lifecycle methods for testing subscription-based features.
 *
 * TESTING: Enables verification of subscription setup/teardown without live connections.
 */
export const portalWebsocketClient = {
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  close: vi.fn(),
};
