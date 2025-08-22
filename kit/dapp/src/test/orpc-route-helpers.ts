import { vi } from "vitest";

// Captured handler type used by ORPC procedures in this codebase

export type OrpcHandler<Input = unknown, Output = unknown> = (args: {
  input: Input;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}) => Promise<Output>;

// Use hoisted storage to be accessible inside vi.mock factory (which is hoisted)
const systemMockState = vi.hoisted(() => ({
  handler: undefined as OrpcHandler | undefined,
}));
const onboardedMockState = vi.hoisted(() => ({
  handler: undefined as OrpcHandler | undefined,
}));
const authMockState = vi.hoisted(() => ({
  handler: undefined as OrpcHandler | undefined,
}));

/**
 * Installs a vi.mock for `@/orpc/procedures/system.router` that captures the handler
 * passed via `.handler(fn)` for any nested path like `systemRouter.system.revokeRole`.
 * Call this before importing the route module under test.
 */
export function installSystemRouterCaptureMock() {
  vi.mock("@/orpc/procedures/system.router", () => {
    // Chainable builder proxy: any property access returns the same proxy,
    // and it exposes .use() and .handler(fn) methods.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builderTarget: Record<string, unknown> = {} as any;

    const builderProxy: unknown = new Proxy(builderTarget, {
      get(_t, prop: string): unknown {
        if (prop === "use") return vi.fn(() => builderProxy);
        if (prop === "handler")
          return vi.fn((fn: OrpcHandler) => {
            systemMockState.handler = fn;
            return builderProxy;
          });
        return builderProxy;
      },
    });

    return {
      systemRouter: builderProxy as Record<string, unknown>,
    };
  });
}

export function getCapturedHandler() {
  return systemMockState.handler;
}

export function resetCapturedHandler() {
  systemMockState.handler = undefined;
}

/**
 * Installs a vi.mock for `@/orpc/procedures/onboarded.router` to capture handlers
 * registered via onboardedRouter.*.*.handler(fn)
 */
export function installOnboardedRouterCaptureMock() {
  vi.mock("@/orpc/procedures/onboarded.router", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builderTarget: Record<string, unknown> = {} as any;

    const builderProxy: unknown = new Proxy(builderTarget, {
      get(_t, prop: string): unknown {
        if (prop === "use") return vi.fn(() => builderProxy);
        if (prop === "handler")
          return vi.fn((fn: OrpcHandler) => {
            onboardedMockState.handler = fn;
            return builderProxy;
          });
        return builderProxy;
      },
    });
    return { onboardedRouter: builderProxy as Record<string, unknown> };
  });
}

export function getCapturedOnboardedHandler() {
  return onboardedMockState.handler;
}

export function resetCapturedOnboardedHandler() {
  onboardedMockState.handler = undefined;
}

// Auth router capture
export function installAuthRouterCaptureMock() {
  vi.mock("@/orpc/procedures/auth.router", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builderTarget: Record<string, unknown> = {} as any;

    const builderProxy: unknown = new Proxy(builderTarget, {
      get(_t, _prop: string): unknown {
        // Return a chainable builder for any nested property access
        const chain = new Proxy(
          {},
          {
            get(_t2, prop2: string): unknown {
              if (prop2 === "use") return () => chain;
              if (prop2 === "handler")
                return (fn: OrpcHandler) => {
                  authMockState.handler = fn;
                  return chain;
                };
              return chain;
            },
          }
        );
        return chain;
      },
    });
    return { authRouter: builderProxy as Record<string, unknown> };
  });
}
export function getCapturedAuthHandler(): OrpcHandler | undefined {
  return authMockState.handler;
}
export function resetCapturedAuthHandler() {
  authMockState.handler = undefined;
}

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
      if (params.data) (err as unknown as { data: unknown }).data = params.data;
      if (params.cause)
        (err as unknown as { cause: unknown }).cause = params.cause;
      throw err;
    };

  return {
    INTERNAL_SERVER_ERROR: make("INTERNAL_SERVER_ERROR"),
    NOT_FOUND: make("NOT_FOUND"),
    USER_NOT_AUTHORIZED: make("USER_NOT_AUTHORIZED"),
    INPUT_VALIDATION_FAILED: make("INPUT_VALIDATION_FAILED"),
    PORTAL_ERROR: make("PORTAL_ERROR"),
  };
}

/**
 * Builds a minimal valid context required by access-manager routes.
 */

export function createBaseContext(
  overrides: Partial<Record<string, unknown>> = {}
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
      mutate: vi.fn() as unknown as (
        doc: unknown,
        vars: Record<string, unknown>
      ) => unknown,
      query: vi.fn() as unknown as (
        doc: unknown,
        vars: Record<string, unknown>
      ) => unknown,
    },
    theGraphClient: undefined,
  };
  return { ...context, ...overrides };
}
