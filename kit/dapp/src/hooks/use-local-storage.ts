import { useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Server-side rendering does not have `window`
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error reading or parsing, return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Persist state changes back to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  // Return a wrapped version of useState's setter function
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function for useState-like API
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // Persistence is handled by the useEffect above
    } catch (error) {
      // Optional: More robust error handling
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
