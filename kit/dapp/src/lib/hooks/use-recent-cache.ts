import { localStorageService } from "@/lib/utils/local-storage";
import { useCallback, useState } from "react";

interface UseRecentCacheOptions {
  storageKey: string;
  maxItems?: number;
}

interface UseRecentCacheReturn<T extends string | number> {
  recentItems: T[];
  addItem: (item: T) => void;
}

/**
 * LRU cache hook with localStorage persistence for primitive types (string, number)
 */
export function useRecentCache<T extends string | number>({
  storageKey,
  maxItems = 5,
}: UseRecentCacheOptions): UseRecentCacheReturn<T> {
  // Initialize state from localStorage
  const [items, setItems] = useState<T[]>(() => {
    const stored = localStorageService.get<T[]>(storageKey, []);
    return stored.slice(0, maxItems);
  });

  const addItem = useCallback(
    (item: T) => {
      setItems((current) => {
        // Remove existing item if it exists (simple equality for primitives)
        const filtered = current.filter(
          (existingItem) => existingItem !== item
        );

        // Add new item to front and limit to maxItems
        const updated = [item, ...filtered].slice(0, maxItems);
        localStorageService.set(storageKey, updated);

        return updated;
      });
    },
    [maxItems, storageKey]
  );

  return {
    recentItems: items,
    addItem,
  };
}
