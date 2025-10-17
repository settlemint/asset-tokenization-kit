import { describe, it, beforeEach, expect, vi } from "vitest";
import {
  clearThemeCssCache,
  getThemeCssFromCache,
  registerThemeCssCacheBackend,
  setThemeCssCache,
} from "./theme-css-cache";

describe("theme-css-cache", () => {
  beforeEach(async () => {
    await clearThemeCssCache();
    registerThemeCssCacheBackend(null);
  });

  it("stores and retrieves values using local LRU cache", async () => {
    await setThemeCssCache("hash-a", "css-a");
    await setThemeCssCache("hash-b", "css-b");

    await expect(getThemeCssFromCache("hash-a")).resolves.toBe("css-a");
    await expect(getThemeCssFromCache("hash-b")).resolves.toBe("css-b");
  });

  it("evicts oldest entries when exceeding capacity", async () => {
    for (let index = 0; index < 40; index += 1) {
      await setThemeCssCache(`hash-${index}`, `css-${index}`);
    }

    await expect(getThemeCssFromCache("hash-0")).resolves.toBeUndefined();
    await expect(getThemeCssFromCache("hash-39")).resolves.toBe("css-39");
  });

  it("prefers external backend when registered", async () => {
    const getSpy = vi.fn().mockResolvedValue("external-css");
    const setSpy = vi.fn();
    registerThemeCssCacheBackend({
      get: getSpy,
      set: setSpy,
    });

    await setThemeCssCache("external-hash", "local-css");
    await expect(getThemeCssFromCache("external-hash")).resolves.toBe(
      "external-css"
    );

    expect(setSpy).toHaveBeenCalledWith("external-hash", "local-css");
    expect(getSpy).toHaveBeenCalledWith("external-hash");
  });
});
