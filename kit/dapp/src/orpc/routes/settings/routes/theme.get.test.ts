/**
 * @vitest-environment node
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_THEME, type ThemeConfig } from "@/components/theme/lib/schema";
import {
  createBaseContext,
  createMockErrors,
  getCapturedAuthHandler,
  installAuthRouterCaptureMock,
  type OrpcHandler,
} from "@/test/orpc-route-helpers";

const { getThemeMock, updateThemeMock } = vi.hoisted(() => ({
  getThemeMock: vi.fn(),
  updateThemeMock: vi.fn(),
}));

vi.mock("@/lib/settlemint/postgres", () => ({
  postgresPool: vi.fn(),
}));
vi.mock("@atk/config/env", () => ({
  env: {},
}));
vi.mock("@/components/theme/lib/repository", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/components/theme/lib/repository")>();
  return {
    // Preserve original exports like ThemeVersionConflictError
    // so route handler logic stays consistent in tests.
    ...actual,
    getTheme: getThemeMock,
    updateTheme: updateThemeMock,
  };
});

vi.mock("@/orpc/middlewares/auth/offchain-permissions.middleware", () => ({
  offChainPermissionsMiddleware: vi.fn(() => undefined),
}));

installAuthRouterCaptureMock();

import "./theme.update";

type ThemeUpdateOutput = { theme: ThemeConfig; success: boolean };

function getHandler(): OrpcHandler<ThemeConfig, ThemeUpdateOutput> {
  const handler = getCapturedAuthHandler();
  if (!handler) throw new Error("theme.update handler not captured");
  return handler as OrpcHandler<ThemeConfig, ThemeUpdateOutput>;
}

function captureError(factory: () => never): Error {
  try {
    factory();
  } catch (error) {
    return error as Error;
  }
}

describe("settings.theme routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getThemeMock.mockReset();
    updateThemeMock.mockReset();
    getThemeMock.mockResolvedValue(DEFAULT_THEME);
  });

  it("updates theme when authorized context provided", async () => {
    const handler = getHandler();
    const context = createBaseContext();
    const errors = createMockErrors();

    const updatedTheme: ThemeConfig = {
      ...DEFAULT_THEME,
      metadata: {
        ...DEFAULT_THEME.metadata,
        version: DEFAULT_THEME.metadata.version + 1,
        updatedBy: context.auth.user.id,
      },
    };

    getThemeMock.mockResolvedValueOnce(DEFAULT_THEME);
    updateThemeMock.mockResolvedValueOnce(updatedTheme);

    const result = await handler({
      input: DEFAULT_THEME,
      context,
      errors,
    });

    expect(updateThemeMock).toHaveBeenCalledWith(
      DEFAULT_THEME,
      context.auth.user.id
    );
    expect(result).toEqual({ theme: updatedTheme, success: true });
  });

  it("propagates validation errors from repository", async () => {
    const handler = getHandler();
    const context = createBaseContext();
    const errors = createMockErrors();
    const validationError = captureError(() =>
      errors.INPUT_VALIDATION_FAILED({ message: "Invalid theme payload" })
    );

    getThemeMock.mockResolvedValueOnce(DEFAULT_THEME);
    updateThemeMock.mockRejectedValueOnce(validationError);

    await expect(
      handler({
        input: DEFAULT_THEME,
        context,
        errors,
      })
    ).rejects.toBe(validationError);
  });

  it("propagates version mismatch errors", async () => {
    const handler = getHandler();
    const context = createBaseContext();
    const errors = createMockErrors();
    const versionError = new Error("VERSION_MISMATCH");

    getThemeMock.mockResolvedValueOnce(DEFAULT_THEME);
    updateThemeMock.mockRejectedValueOnce(versionError);

    await expect(
      handler({
        input: DEFAULT_THEME,
        context,
        errors,
      })
    ).rejects.toBe(versionError);
  });

  it("rejects update when auth context missing", async () => {
    const handler = getHandler();
    const baseContext = createBaseContext();
    const context = { ...baseContext, auth: undefined };
    const errors = createMockErrors();

    await expect(
      handler({
        input: DEFAULT_THEME,
        context,
        errors,
      })
    ).rejects.toMatchObject({
      code: "USER_NOT_AUTHORIZED",
    });

    expect(updateThemeMock).not.toHaveBeenCalled();
    expect(getThemeMock).not.toHaveBeenCalled();
  });
});
