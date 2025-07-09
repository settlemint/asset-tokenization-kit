import { debounce, type DebouncedFunction } from "@/lib/utils/debounce";
import { useCallback, useEffect, useRef } from "react";

/**
 * React hook that returns a debounced version of the provided callback.
 * The debounced function is automatically cleaned up on unmount.
 *
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A stable debounced version of the callback
 */
export function useDebouncedCallback<T extends readonly unknown[]>(
  callback: (...args: T) => void,
  delay: number
): (...args: T) => void {
  const callbackRef = useRef(callback);
  const debouncedRef = useRef<DebouncedFunction<T> | null>(null);

  // Update the callback ref on each render
  callbackRef.current = callback;

  // Create the debounced function
  debouncedRef.current ??= debounce((...args: T) => {
    callbackRef.current(...args);
  }, delay);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedRef.current?.cancel();
    };
  }, []);

  // Update debounce delay if it changes
  useEffect(() => {
    if (debouncedRef.current) {
      debouncedRef.current.cancel();
      debouncedRef.current = debounce((...args: T) => {
        callbackRef.current(...args);
      }, delay);
    }
  }, [delay]);

  return useCallback((...args: T) => {
    debouncedRef.current?.(...args);
  }, []);
}
