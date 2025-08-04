import { createLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger();

class LocalStorageService {
  getLocalStorage(): Storage | null {
    if (globalThis.window === undefined) return null;
    return globalThis.window.localStorage;
  }

  get<T>(key: string, fallback: T): T {
    const storage = this.getLocalStorage();
    if (storage === null) return fallback;

    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      logger.error(`Failed to parse localStorage item: ${key}`);
      return fallback;
    }
  }

  set(key: string, value: unknown): boolean {
    const storage = this.getLocalStorage();
    if (storage === null) return false;

    try {
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      logger.warn(`Failed to save to localStorage: ${key}`);
      return false;
    }
  }
}

export const localStorageService = new LocalStorageService();
