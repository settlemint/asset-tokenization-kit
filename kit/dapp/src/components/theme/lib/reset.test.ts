import { describe, expect, it, vi, beforeEach } from "vitest";

import { compileThemeCSS } from "./compile-css";
import { DEFAULT_THEME } from "./schema";
import {
  DEFAULT_BUCKET,
  extractObjectKey,
  resetThemeToDefaults,
} from "./reset";

const { deleteFileMock, getThemeMock, resetThemeMock } = vi.hoisted(() => ({
  deleteFileMock: vi.fn(),
  getThemeMock: vi.fn(),
  resetThemeMock: vi.fn(),
}));

vi.mock("@/lib/settlemint/minio", () => ({
  client: Symbol("minio-client"),
}));

vi.mock("@settlemint/sdk-minio", () => ({
  deleteFile: deleteFileMock,
}));

vi.mock("@/components/theme/lib/repository", () => ({
  getTheme: getThemeMock,
  resetTheme: resetThemeMock,
}));

describe("theme reset utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts object key from URL containing bucket prefix", () => {
    expect(
      extractObjectKey(
        `https://assets.example.com/${DEFAULT_BUCKET}/logos/light/custom.svg`,
        DEFAULT_BUCKET
      )
    ).toBe("logos/light/custom.svg");

    expect(
      extractObjectKey(
        `/${DEFAULT_BUCKET}/logos/dark/custom.svg`,
        DEFAULT_BUCKET
      )
    ).toBe("logos/dark/custom.svg");

    expect(
      extractObjectKey("/logos/dark/custom.svg", DEFAULT_BUCKET)
    ).toBeNull();
  });

  it("deletes branding assets and resets theme to defaults", async () => {
    deleteFileMock.mockResolvedValue(true);
    getThemeMock.mockResolvedValue({
      ...DEFAULT_THEME,
      logo: {
        ...DEFAULT_THEME.logo,
        lightUrl: `https://cdn.example.com/${DEFAULT_BUCKET}/logos/light/custom.svg`,
        darkUrl: `/${DEFAULT_BUCKET}/logos/dark/custom.svg`,
      },
    });
    resetThemeMock.mockResolvedValue(undefined);

    const result = await resetThemeToDefaults();

    expect(deleteFileMock).toHaveBeenCalledTimes(2);
    expect(deleteFileMock).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      "logos/light/custom.svg",
      DEFAULT_BUCKET
    );
    expect(deleteFileMock).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      "logos/dark/custom.svg",
      DEFAULT_BUCKET
    );

    expect(resetThemeMock).toHaveBeenCalled();
    expect(result.theme).toEqual(DEFAULT_THEME);
    expect(result.css).toBe(compileThemeCSS(DEFAULT_THEME));
    expect(result.removedObjects).toEqual([
      "logos/light/custom.svg",
      "logos/dark/custom.svg",
    ]);
  });
});
