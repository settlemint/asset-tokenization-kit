import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import {
  forceFlushThemeDomUpdates,
  queueThemeDomUpdates,
  resetThemeDomUpdateQueue,
} from "./theme-dom-updater";

describe("theme-dom-updater", () => {
  let originalRequestAnimationFrame: typeof globalThis.requestAnimationFrame;

  beforeEach(() => {
    originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    resetThemeDomUpdateQueue();
    document.documentElement.style.cssText = "";
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    resetThemeDomUpdateQueue();
    vi.restoreAllMocks();
  });

  it("batches updates via requestAnimationFrame and normalizes variable names", () => {
    const requestAnimationFrameMock = vi
      .spyOn(globalThis, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      });

    const setPropertySpy = vi.spyOn(
      document.documentElement.style,
      "setProperty"
    );

    queueThemeDomUpdates({
      "--sm-accent": "oklch(0.57 0.2 263.15)",
      "sm-border": "oklch(0.22 0 87 / 12%)",
    });

    expect(setPropertySpy).toHaveBeenCalledWith(
      "--sm-accent",
      "oklch(0.57 0.2 263.15)"
    );
    expect(setPropertySpy).toHaveBeenCalledWith(
      "--sm-border",
      "oklch(0.22 0 87 / 12%)"
    );
    expect(requestAnimationFrameMock).toHaveBeenCalledTimes(1);
  });

  it("skips DOM writes when values are unchanged", () => {
    const setPropertySpy = vi.spyOn(
      document.documentElement.style,
      "setProperty"
    );

    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
      (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      }
    );

    queueThemeDomUpdates({ "--sm-text": "oklch(0.22 0 87)" });
    expect(setPropertySpy).toHaveBeenCalledTimes(1);

    setPropertySpy.mockClear();
    queueThemeDomUpdates({ "--sm-text": "oklch(0.22 0 87)" });
    expect(setPropertySpy).not.toHaveBeenCalled();
  });

  it("flushes immediately when requestAnimationFrame is unavailable", () => {
    // @ts-expect-error - simulate missing requestAnimationFrame
    globalThis.requestAnimationFrame = undefined;
    const setPropertySpy = vi.spyOn(
      document.documentElement.style,
      "setProperty"
    );

    queueThemeDomUpdates({ "--sm-text-contrast": "oklch(1 0 87)" });
    forceFlushThemeDomUpdates();

    expect(setPropertySpy).toHaveBeenCalledWith(
      "--sm-text-contrast",
      "oklch(1 0 87)"
    );
  });
});
