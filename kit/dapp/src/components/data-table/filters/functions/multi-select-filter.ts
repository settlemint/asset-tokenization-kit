/**
 * @fileoverview Re-export for backward compatibility with legacy code.
 * This file maintains the old `multiSelectFilterFn` naming convention
 * while the actual implementation has been renamed to `multiOptionFilterFn`.
 *
 * @deprecated Use `multiOptionFilterFn` directly from "./multi-option-filter" instead
 *
 * @example
 * ```ts
 * // Old usage (deprecated)
 * import { multiSelectFilterFn } from './multi-select-filter';
 *
 * // New usage (preferred)
 * import { multiOptionFilterFn } from './multi-option-filter';
 * ```
 */

// Re-export multiOptionFilterFn as multiSelectFilterFn for backward compatibility
export { multiOptionFilterFn as multiSelectFilterFn } from "./multi-option-filter";
