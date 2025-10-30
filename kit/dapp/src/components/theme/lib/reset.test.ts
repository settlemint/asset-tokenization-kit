import { describe, expect, it, vi, beforeEach } from "vitest";

import { compileThemeCSS } from "./compile-css";
import { DEFAULT_THEME } from "./schema";
import { extractObjectKey, resetThemeToDefaults } from "./reset";

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
  const TEST_BUCKET = "atk";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts object key from URL containing bucket prefix", () => {
    expect(
      extractObjectKey(
        `https://assets.example.com/${TEST_BUCKET}/logos/light/custom.svg`,
        TEST_BUCKET
      )
    ).toBe("logos/light/custom.svg");

    expect(
      extractObjectKey(`/${TEST_BUCKET}/logos/dark/custom.svg`, TEST_BUCKET)
    ).toBe("logos/dark/custom.svg");

    expect(extractObjectKey("/logos/dark/custom.svg", TEST_BUCKET)).toBeNull();
  });

  it("deletes branding assets and resets theme to defaults", async () => {
    deleteFileMock.mockResolvedValue(true);
    getThemeMock.mockResolvedValue({
      ...DEFAULT_THEME,
      logo: {
        ...DEFAULT_THEME.logo,
        lightUrl: `https://cdn.example.com/${TEST_BUCKET}/logos/light/custom.svg`,
        darkUrl: `/${TEST_BUCKET}/logos/dark/custom.svg`,
      },
    });
    resetThemeMock.mockResolvedValue(undefined);

    const result = await resetThemeToDefaults({ bucket: TEST_BUCKET });

    expect(deleteFileMock).toHaveBeenCalledTimes(2);
    expect(deleteFileMock).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      "logos/light/custom.svg",
      TEST_BUCKET
    );
    expect(deleteFileMock).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      "logos/dark/custom.svg",
      TEST_BUCKET
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
