import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Create a mock storage
const mockStorage = new Map<string, unknown>();

// Mock the localStorage service
vi.mock("@/lib/utils/local-storage", () => ({
  localStorageService: {
    get: vi.fn((key: string, fallback: unknown) => {
      return mockStorage.get(key) ?? fallback;
    }),
    set: vi.fn((key: string, value: unknown) => {
      mockStorage.set(key, value);
      return true;
    }),
  },
}));

import { localStorageService } from "@/lib/utils/local-storage";
import { useRecentCache } from "./use-recent-cache";

// Get reference to the mocked service
const mockLocalStorageService = vi.mocked(localStorageService);

describe("useRecentCache", () => {
  it("should initialize with empty array when no stored data", () => {
    const storageKey = "test-empty-initialize-key";
    const { result } = renderHook(() =>
      useRecentCache<string>({
        storageKey,
        maxItems: 5,
      })
    );

    expect(result.current.recentItems).toEqual([]);
    expect(mockLocalStorageService.get).toHaveBeenCalledWith(storageKey, []);
  });

  it("should initialize with stored data", () => {
    const storageKey = "test-non-empty-initialize-key";
    const storedItems = ["item1", "item2", "item3"];
    mockStorage.set(storageKey, storedItems);

    const { result } = renderHook(() =>
      useRecentCache<string>({
        storageKey,
        maxItems: 5,
      })
    );

    expect(result.current.recentItems).toEqual(storedItems);
  });

  it("should limit stored items to maxItems on initialization", () => {
    const storageKey = "test-limit-initialization-key";
    const storedItems = ["item1", "item2", "item3", "item4", "item5", "item6"];
    mockStorage.set(storageKey, storedItems);

    const { result } = renderHook(() =>
      useRecentCache<string>({
        storageKey,
        maxItems: 3,
      })
    );

    expect(result.current.recentItems).toEqual(["item1", "item2", "item3"]);
  });

  it("should add new item to the front", () => {
    const storageKey = "add-new-item-test";
    const { result } = renderHook(() =>
      useRecentCache<string>({
        storageKey,
        maxItems: 5,
      })
    );

    act(() => {
      result.current.addItem("newItem");
    });

    expect(result.current.recentItems).toEqual(["newItem"]);
    expect(mockLocalStorageService.set).toHaveBeenCalledWith(storageKey, [
      "newItem",
    ]);
  });

  it("should move existing item to front when added again", () => {
    const storageKey = "test-move-existing-to-front-key";
    mockStorage.set(storageKey, ["item1", "item2", "item3"]);
    const { result } = renderHook(() =>
      useRecentCache<string>({
        storageKey,
        maxItems: 5,
      })
    );

    act(() => {
      result.current.addItem("item2");
    });

    expect(result.current.recentItems).toEqual(["item2", "item1", "item3"]);
    expect(mockLocalStorageService.set).toHaveBeenLastCalledWith(storageKey, [
      "item2",
      "item1",
      "item3",
    ]);
  });

  it("should remove oldest item when maxItems is exceeded", () => {
    const storageKey = "test-remove-oldest-key";
    mockStorage.set(storageKey, ["item1", "item2", "item3"]);

    const { result } = renderHook(() =>
      useRecentCache<string>({
        storageKey,
        maxItems: 3,
      })
    );

    act(() => {
      result.current.addItem("item4");
    });

    expect(result.current.recentItems).toEqual(["item4", "item1", "item2"]);
    expect(result.current.recentItems).toHaveLength(3);
    expect(mockLocalStorageService.set).toHaveBeenLastCalledWith(storageKey, [
      "item4",
      "item1",
      "item2",
    ]);
  });

  it("should work with number items", () => {
    const storageKey = "number-items-test";
    const { result } = renderHook(() =>
      useRecentCache<number>({
        storageKey,
        maxItems: 5,
      })
    );

    act(() => {
      result.current.addItem(123);
    });

    act(() => {
      result.current.addItem(456);
    });

    expect(result.current.recentItems).toEqual([456, 123]);
  });

  it("should handle duplicate items correctly", () => {
    const storageKey = "duplicate-items-test";
    const { result } = renderHook(() =>
      useRecentCache<string>({
        storageKey,
        maxItems: 5,
      })
    );

    act(() => {
      result.current.addItem("item1");
    });

    act(() => {
      result.current.addItem("item1");
    });

    // Should only have one item since they're identical
    expect(result.current.recentItems).toHaveLength(1);
    expect(result.current.recentItems).toEqual(["item1"]);
  });

  it("should persist changes to localStorage", () => {
    const storageKey = "persist-changes-test-isolated";
    const { result } = renderHook(() =>
      useRecentCache<string>({
        storageKey,
        maxItems: 3,
      })
    );

    // Clear previous calls before this test
    vi.clearAllMocks();

    act(() => {
      result.current.addItem("item1");
    });

    act(() => {
      result.current.addItem("item2");
    });

    expect(mockLocalStorageService.set).toHaveBeenCalledTimes(2);
    expect(mockLocalStorageService.set).toHaveBeenLastCalledWith(storageKey, [
      "item2",
      "item1",
    ]);
  });

  it("should use custom maxItems", () => {
    const storageKey = "custom-max-items-test";
    const { result } = renderHook(() =>
      useRecentCache<number>({
        storageKey,
        maxItems: 2,
      })
    );

    act(() => {
      result.current.addItem(1);
    });
    act(() => {
      result.current.addItem(2);
    });
    act(() => {
      result.current.addItem(3);
    });

    expect(result.current.recentItems).toEqual([3, 2]);
    expect(result.current.recentItems).toHaveLength(2);
  });

  it("should default to maxItems of 5", () => {
    const storageKey = "default-max-items-test";
    const { result } = renderHook(() =>
      useRecentCache<string>({
        storageKey,
      })
    );

    // Add 6 items
    act(() => {
      for (let i = 1; i <= 6; i++) {
        result.current.addItem(`item${i}`);
      }
    });

    expect(result.current.recentItems).toHaveLength(5);
    // Last item added (item6) should be first, followed by the previous 4 items in reverse order of addition
    expect(result.current.recentItems).toEqual([
      "item6",
      "item5",
      "item4",
      "item3",
      "item2",
    ]);
  });
});
