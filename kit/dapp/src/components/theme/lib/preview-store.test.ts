import { describe, expect, it, vi, afterEach } from "vitest";

vi.mock("@/lib/observability/theme.metrics", () => {
  const recordThemePreviewMetric = vi.fn();
  return {
    startThemeMetricTimer: () => () => 0,
    recordThemePreviewMetric,
  };
});

import { DEFAULT_THEME } from "./schema";
import {
  clearThemePreview,
  getThemePreview,
  setThemePreview,
} from "./preview-store";
import { recordThemePreviewMetric } from "@/lib/observability/theme.metrics";

const recordMetricMock = vi.mocked(recordThemePreviewMetric);

afterEach(() => {
  recordMetricMock.mockClear();
});

describe("theme preview store", () => {
  it("stores and retrieves preview until expiry", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const key = "user-1";
    const expiresAt = setThemePreview(key, DEFAULT_THEME, 2);
    expect(getThemePreview(key)).toEqual(DEFAULT_THEME);
    vi.setSystemTime(expiresAt + 1000);
    expect(getThemePreview(key)).toBeUndefined();
    expect(recordMetricMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "set" })
    );
    expect(recordMetricMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "get", hit: true })
    );
    expect(recordMetricMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "get", expired: true })
    );
    vi.useRealTimers();
  });

  it("clears preview", () => {
    const key = "user-2";
    setThemePreview(key, DEFAULT_THEME, 2);
    clearThemePreview(key);
    expect(getThemePreview(key)).toBeUndefined();
    expect(recordMetricMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "clear" })
    );
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
    expect(recordMetricMock).toHaveBeenCalled();
  });
});
