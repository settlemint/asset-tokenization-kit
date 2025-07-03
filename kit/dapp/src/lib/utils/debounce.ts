/**
 * Debounce Utility
 *
 * Provides a robust debouncing mechanism with proper cleanup and cancellation support.
 * This implementation prevents race conditions and ensures predictable behavior
 * under rapid state changes.
 */

/**
 * Debounced function interface with cancellation support
 */
export interface DebouncedFunction<T extends readonly unknown[]> {
  (...args: T): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
}

/**
 * Creates a debounced version of the provided function.
 *
 * The debounced function delays invoking the original function until after
 * the specified delay has elapsed since the last time it was invoked.
 * Includes methods for cancellation, immediate execution, and status checking.
 *
 * @example
 * ```typescript
 * const debouncedSave = debounce((data: string) => {
 *   console.log('Saving:', data);
 * }, 1000);
 *
 * // Rapid calls - only the last one executes after 1 second
 * debouncedSave('draft 1');
 * debouncedSave('draft 2');
 * debouncedSave('draft 3'); // Only this executes
 *
 * // Cancel pending execution
 * debouncedSave.cancel();
 *
 * // Execute immediately without waiting
 * debouncedSave.flush();
 *
 * // Check if execution is pending
 * if (debouncedSave.pending()) {
 *   console.log('Save in progress...');
 * }
 * ```
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function with control methods
 */
export function debounce<T extends readonly unknown[]>(
  fn: (...args: T) => void,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: T | null = null;

  const debounced = (...args: T) => {
    lastArgs = args;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (lastArgs !== null) {
        fn(...lastArgs);
        lastArgs = null;
      }
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (lastArgs !== null) {
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  debounced.pending = () => {
    return timeoutId !== null;
  };

  return debounced;
}

/**
 * Creates a debounced function with leading edge execution.
 *
 * This variant executes the function immediately on the first call,
 * then debounces subsequent calls within the delay period.
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounceLeading((query: string) => {
 *   console.log('Searching:', query);
 * }, 1000);
 *
 * debouncedSearch('a');    // Executes immediately
 * debouncedSearch('ab');   // Debounced
 * debouncedSearch('abc');  // Debounced, executes after 1 second
 * ```
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced function with leading edge execution
 */
export function debounceLeading<T extends readonly unknown[]>(
  fn: (...args: T) => void,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastArgs: T | null = null;

  const debounced = (...args: T) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    lastArgs = args;

    if (timeSinceLastCall >= delay && timeoutId === null) {
      // Leading edge execution
      lastCallTime = now;
      fn(...args);
    } else {
      // Trailing edge execution
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        timeoutId = null;
        lastCallTime = Date.now();
        if (lastArgs !== null) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, delay - timeSinceLastCall);
    }
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (lastArgs !== null) {
      lastCallTime = Date.now();
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  debounced.pending = () => {
    return timeoutId !== null;
  };

  return debounced;
}
