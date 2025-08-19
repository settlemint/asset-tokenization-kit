import { jest, mock } from "bun:test";
import type { Mock } from "bun:test";

export type OrpcHandler<Input = unknown, Output = unknown> = (args: {
  input: Input;
  context: any;
  errors: any;
}) => Promise<Output>;

/**
 * Creates a minimal `errors` object compatible with ORPC error helpers used in routes.
 * Each method throws an Error augmented with `code`, `message`, and optional `data` and `cause`.
 */
export function createMockErrors() {
  const make =
    (code: string) =>
    (params: { message?: string; data?: unknown; cause?: unknown } = {}) => {
      const err = new Error(params.message || code);
      (err as unknown as { code: string }).code = code;
      if (params.data) {
        (err as unknown as { data: unknown }).data = params.data;
      }
      if (params.cause) {
        (err as unknown as { cause: unknown }).cause = params.cause;
      }
      throw err;
    };

  return {
    INTERNAL_SERVER_ERROR: make("INTERNAL_SERVER_ERROR"),
    NOT_FOUND: make("NOT_FOUND"),
    UNAUTHORIZED: make("UNAUTHORIZED"),
    USER_NOT_AUTHORIZED: make("USER_NOT_AUTHORIZED"),
    INPUT_VALIDATION_FAILED: make("INPUT_VALIDATION_FAILED"),
    PORTAL_ERROR: make("PORTAL_ERROR"),
    THE_GRAPH_ERROR: make("THE_GRAPH_ERROR"),
  };
}

// Handler capture state for different router types
interface HandlerCapture {
  handler?: OrpcHandler;
}

const captureStates = {
  public: { handler: undefined } as HandlerCapture,
  portal: { handler: undefined } as HandlerCapture,
  auth: { handler: undefined } as HandlerCapture,
  onboarded: { handler: undefined } as HandlerCapture,
};

/**
 * Creates a mock router builder that captures the handler function.
 * This allows us to test route handlers in isolation.
 */
function createRouterCapture(captureState: HandlerCapture) {
  const builderTarget: Record<string, unknown> = {} as any;
  const builderProxy: unknown = new Proxy(builderTarget, {
    get(_t, _prop: string): unknown {
      const chain = new Proxy(
        {},
        {
          get(_t2, prop2: string): unknown {
            if (prop2 === "use") return () => chain;
            if (prop2 === "handler")
              return (fn: OrpcHandler) => {
                captureState.handler = fn;
                return chain;
              };
            return chain;
          },
        },
      );
      return chain;
    },
  });
  return builderProxy as Record<string, unknown>;
}

/**
 * Mock @orpc/server module with a spy on the call function
 */
export const mockCall = jest.fn();

// Create a mock router with middleware support
const createMockRouterWithMiddleware = (captureState: HandlerCapture) => {
  const router = createRouterCapture(captureState);
  return {
    ...router,
    middleware: jest.fn().mockReturnValue(router),
  };
};

mock.module("@orpc/server", () => ({
  call: mockCall,
  implement: () => ({
    $context: () => createMockRouterWithMiddleware(captureStates.public),
  }),
}));

/**
 * Mock portal router
 */
mock.module("@/procedures/portal.router", () => ({
  portalRouter: createRouterCapture(captureStates.portal),
}));

/**
 * Mock base router
 */
mock.module("@/procedures/base.router", () => ({
  baseRouter: createMockRouterWithMiddleware(captureStates.public),
}));

/**
 * Mock public router
 */
mock.module("@/procedures/public.router", () => ({
  publicRouter: createRouterCapture(captureStates.public),
}));

/**
 * Mock auth router
 */
mock.module("@/procedures/auth.router", () => ({
  authRouter: createRouterCapture(captureStates.auth),
}));

/**
 * Mock onboarded router
 */
mock.module("@/procedures/onboarded.router", () => ({
  onboardedRouter: createRouterCapture(captureStates.onboarded),
}));

/**
 * Mock TheGraph module to avoid server-only init
 */
mock.module("@atk/settlemint/the-graph", () => ({
  theGraphClient: { query: jest.fn() },
  theGraphGraphql: jest.fn(() => ({}) as unknown),
}));

/**
 * Mock middleware modules to avoid heavy dependencies
 */
mock.module("@/middlewares/services/the-graph.middleware", () => ({
  theGraphMiddleware: () => undefined,
}));

mock.module("@/middlewares/auth/offchain-permissions.middleware", () => ({
  offChainPermissionsMiddleware: () => undefined,
}));

mock.module("@/middlewares/auth/blockchain-permissions.middleware", () => ({
  blockchainPermissionsMiddleware: () => undefined,
}));

mock.module("@/middlewares/auth/session.middleware", () => ({
  sessionMiddleware: () => undefined,
}));

mock.module("@/middlewares/services/portal.middleware", () => ({
  portalMiddleware: () => undefined,
}));

mock.module("@/middlewares/system/system.middleware", () => ({
  systemMiddleware: () => undefined,
}));

/**
 * Mock portal GraphQL to avoid server dependencies
 */
mock.module("@atk/settlemint/portal", () => ({
  portalGraphql: jest.fn(() => "mock-query"),
}));

/**
 * Mock challenge response helper
 */
mock.module("@/helpers/challenge-response", () => ({
  handleChallenge: jest.fn(() =>
    Promise.resolve({ challengeId: "verif_1", challengeResponse: "signed" }),
  ),
}));

/**
 * Mock role constants
 */
mock.module("@atk/auth/constants/roles", () => ({
  getRoleByFieldName: jest.fn((role: string) => {
    const roleMap: Record<string, { fieldName: string; bytes: string }> = {
      tokenManager: { fieldName: "tokenManager", bytes: "0x" + "1".repeat(64) },
      complianceManager: {
        fieldName: "complianceManager",
        bytes: "0x" + "2".repeat(64),
      },
      systemManager: {
        fieldName: "systemManager",
        bytes: "0x" + "3".repeat(64),
      },
    };
    return roleMap[role] || null;
  }),
}));

/**
 * Mock system permissions
 */
mock.module("@/routes/system/system.permissions", () => ({
  SYSTEM_PERMISSIONS: {
    grantRole: ["systemManager"],
    revokeRole: ["systemManager"],
    listRoles: ["systemManager", "admin"],
  },
}));

/**
 * Mock database module to avoid migrations
 */
mock.module("@atk/db", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn(),
  },
  schema: {},
}));

// Handler capture functions for different router types
export function getPublicHandler(): OrpcHandler | undefined {
  return captureStates.public.handler;
}

export function getPortalHandler(): OrpcHandler | undefined {
  return captureStates.portal.handler;
}

export function getAuthHandler(): OrpcHandler | undefined {
  return captureStates.auth.handler;
}

export function getOnboardedHandler(): OrpcHandler | undefined {
  return captureStates.onboarded.handler;
}

// Legacy compatibility functions
export function installAuthRouterCaptureMock() {
  // No-op - mocking is done via mock.module
}

export function getCapturedAuthHandler(): OrpcHandler | undefined {
  return getAuthHandler();
}

export function resetCapturedAuthHandler() {
  captureStates.auth.handler = undefined;
}

export function installPortalRouterCaptureMock() {
  // No-op - mocking is done via mock.module
}

export function getCapturedHandler(): OrpcHandler | undefined {
  return getPortalHandler();
}

export function resetCapturedHandler() {
  captureStates.portal.handler = undefined;
}

export function installOnboardedRouterCaptureMock() {
  // No-op - mocking is done via mock.module
}

export function getCapturedOnboardedHandler(): OrpcHandler | undefined {
  return getOnboardedHandler();
}

export function resetCapturedOnboardedHandler() {
  captureStates.onboarded.handler = undefined;
}

/**
 * Reset all captured handlers - useful for test cleanup
 */
export function resetAllHandlers() {
  Object.values(captureStates).forEach((state) => {
    state.handler = undefined;
  });
}

/**
 * Reset all mocks - useful for test cleanup
 */
export function resetAllMocks() {
  jest.clearAllMocks();
  mockCall.mockClear();
  resetAllHandlers();
}

/**
 * Builds a minimal valid context required by routes.
 */
export function createBaseContext(
  overrides: Partial<Record<string, unknown>> = {},
) {
  const context = {
    auth: {
      user: {
        id: "user_1",
        wallet: "0x1111111111111111111111111111111111111111",
        pincodeVerificationId: "pin_1",
        secretCodeVerificationId: "sec_1",
        twoFactorVerificationId: "otp_1",
      },
      session: {
        id: "sess_1",
      },
    },
    system: {
      systemAccessManager: {
        id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
        accessControl: {
          roles: [],
        },
      },
    },
    portalClient: {
      mutate: jest.fn() as Mock<any>,
      query: jest.fn() as Mock<any>,
    },
    theGraphClient: {
      query: jest.fn() as Mock<any>,
    },
  };
  return { ...context, ...overrides };
}

/**
 * Creates a context without authentication - useful for testing unauthorized access
 */
export function createUnauthenticatedContext(
  overrides: Partial<Record<string, unknown>> = {},
) {
  const context = {
    auth: undefined,
    system: {
      systemAccessManager: {
        id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
        accessControl: {
          roles: [],
        },
      },
    },
    portalClient: {
      mutate: jest.fn() as Mock<any>,
      query: jest.fn() as Mock<any>,
    },
    theGraphClient: {
      query: jest.fn() as Mock<any>,
    },
  };
  return { ...context, ...overrides };
}
