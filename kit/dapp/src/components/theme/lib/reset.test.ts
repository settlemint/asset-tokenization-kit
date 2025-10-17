import { describe, expect, it, vi, beforeEach } from "vitest";

import { compileThemeCSS } from "./compile-css";
import { DEFAULT_THEME } from "./schema";
import { extractObjectKey, resetThemeToDefaults } from "./reset";

const deleteFileMock = vi.fn();
const getThemeMock = vi.fn();
const resetThemeMock = vi.fn();

vi.mock("@/lib/settlemint/minio", () => ({
  client: Symbol("minio-client"),
}));

vi.mock("@settlemint/sdk-minio", () => ({
  deleteFile: (...args: unknown[]) => deleteFileMock(...args),
}));

vi.mock("@/components/theme/lib/repository", async () => {
  const actual = await vi.importActual<
    typeof import("@/components/theme/lib/repository")
  >("@/components/theme/lib/repository");
  return {
    ...actual,
    getTheme: (...args: unknown[]) => getThemeMock(...args),
    resetTheme: (...args: unknown[]) => resetThemeMock(...args),
  };
});

describe("theme reset utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts object key from URL containing bucket prefix", () => {
    expect(
      extractObjectKey(
        "https://assets.example.com/branding/logos/light/custom.svg",
        "branding"
      )
    ).toBe("logos/light/custom.svg");

    expect(
      extractObjectKey("/branding/logos/dark/custom.svg", "branding")
    ).toBe("logos/dark/custom.svg");

    expect(extractObjectKey("/logos/dark/custom.svg", "branding")).toBeNull();
  });

  it("deletes branding assets and resets theme to defaults", async () => {
    deleteFileMock.mockResolvedValue(true);
    getThemeMock.mockResolvedValue({
      ...DEFAULT_THEME,
      logo: {
        ...DEFAULT_THEME.logo,
        lightUrl: "https://cdn.example.com/branding/logos/light/custom.svg",
        darkUrl: "/branding/logos/dark/custom.svg",
      },
    });
    resetThemeMock.mockResolvedValue(undefined);

    const result = await resetThemeToDefaults();

    expect(deleteFileMock).toHaveBeenCalledTimes(2);
    expect(deleteFileMock).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      "logos/light/custom.svg",
      "branding"
    );
    expect(deleteFileMock).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      "logos/dark/custom.svg",
      "branding"
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
