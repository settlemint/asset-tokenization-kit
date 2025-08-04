import { beforeEach, describe, expect, it, vi } from "vitest";
import { localStorageService } from "./local-storage";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock globalThis.window
Object.defineProperty(globalThis, "window", {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
});

describe("LocalStorageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get", () => {
    it("should return fallback when localStorage is unavailable", () => {
      // Temporarily remove window
      const originalWindow = globalThis.window;
      // @ts-expect-error - Testing undefined window
      globalThis.window = undefined;

      const result = localStorageService.get("test-key", "fallback");
      expect(result).toBe("fallback");

      // Restore window
      globalThis.window = originalWindow;
    });

    it("should return parsed value from localStorage", () => {
      const testData = { foo: "bar" };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(testData));

      const result = localStorageService.get("test-key", {});
      expect(result).toEqual(testData);
      expect(localStorageMock.getItem).toHaveBeenCalledWith("test-key");
    });

    it("should return fallback when item is null", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = localStorageService.get("test-key", "fallback");
      expect(result).toBe("fallback");
    });

    it("should return fallback when JSON parsing fails", () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");

      const result = localStorageService.get("test-key", "fallback");
      expect(result).toBe("fallback");
    });
  });

  describe("set", () => {
    it("should return false when localStorage is unavailable", () => {
      // Temporarily remove window
      const originalWindow = globalThis.window;
      // @ts-expect-error - Testing undefined window
      globalThis.window = undefined;

      const result = localStorageService.set("test-key", "value");
      expect(result).toBe(false);

      // Restore window
      globalThis.window = originalWindow;
    });

    it("should store stringified value in localStorage", () => {
      const testData = { foo: "bar" };
      localStorageMock.setItem.mockImplementation(() => {});

      const result = localStorageService.set("test-key", testData);
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "test-key",
        JSON.stringify(testData)
      );
    });

    it("should return false when setItem throws error", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage full");
      });

      const result = localStorageService.set("test-key", "value");
      expect(result).toBe(false);
    });
  });

  describe("integration", () => {
    it("should store and retrieve complex data", () => {
      const testData = {
        users: ["user1", "user2"],
        count: 42,
        active: true,
      };

      // Mock successful storage
      let storedValue: string | null = null;
      localStorageMock.setItem.mockImplementation((_key, value) => {
        storedValue = value;
      });
      localStorageMock.getItem.mockImplementation(() => storedValue);

      // Store data
      const setResult = localStorageService.set("complex-data", testData);
      expect(setResult).toBe(true);

      // Retrieve data
      const retrievedData = localStorageService.get("complex-data", {});
      expect(retrievedData).toEqual(testData);
    });

    it("should handle array data for LRU cache", () => {
      const addresses = [
        "0x1234567890123456789012345678901234567890",
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      ];

      // Mock successful storage
      let storedValue: string | null = null;
      localStorageMock.setItem.mockImplementation((_key, value) => {
        storedValue = value;
      });
      localStorageMock.getItem.mockImplementation(() => storedValue);

      // Store addresses
      localStorageService.set("recent-addresses", addresses);

      // Retrieve addresses
      const retrieved = localStorageService.get<string[]>(
        "recent-addresses",
        []
      );
      expect(retrieved).toEqual(addresses);
      expect(Array.isArray(retrieved)).toBe(true);
    });
  });
});
