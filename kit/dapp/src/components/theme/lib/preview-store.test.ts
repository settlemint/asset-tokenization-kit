import { describe, expect, it, vi } from "vitest";

import { DEFAULT_THEME } from "./schema";
import {
  clearThemePreview,
  getThemePreview,
  setThemePreview,
} from "./preview-store";

describe("theme preview store", () => {
  it("stores and retrieves preview until expiry", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const key = "user-1";
    const expiresAt = setThemePreview(key, DEFAULT_THEME, 2);
    expect(getThemePreview(key)).toEqual(DEFAULT_THEME);
    vi.setSystemTime(expiresAt + 1000);
    expect(getThemePreview(key)).toBeUndefined();
    vi.useRealTimers();
  });

  it("clears preview", () => {
    const key = "user-2";
    setThemePreview(key, DEFAULT_THEME, 2);
    clearThemePreview(key);
    expect(getThemePreview(key)).toBeUndefined();
  });

  it("returns cloned theme instances to protect source data", () => {
    const key = "user-3";
    const mutable = { ...DEFAULT_THEME, logo: { ...DEFAULT_THEME.logo } };

    setThemePreview(key, mutable, 2);
    mutable.logo.alt = "mutated";

    const fetched = getThemePreview(key);
    expect(fetched?.logo.alt).toBe(DEFAULT_THEME.logo.alt);

    if (fetched) {
      fetched.logo.alt = "changed";
    }

    const fetchedAgain = getThemePreview(key);
    expect(fetchedAgain?.logo.alt).toBe(DEFAULT_THEME.logo.alt);
  });
});
