/**
 * General Utility Functions
 *
 * This module provides common utility functions used throughout the application.
 * Currently focused on CSS class name management for Tailwind CSS, but can be
 * extended with other general-purpose utilities as needed.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges CSS class names with proper Tailwind CSS precedence.
 *
 * This utility function combines the functionality of:
 * - `clsx`: For conditional class name construction and filtering
 * - `tailwind-merge`: For intelligent merging of Tailwind utility classes
 *
 * The function ensures that when conflicting Tailwind utility classes are
 * provided, the last one takes precedence, matching Tailwind's behavior.
 * This is crucial for component composition and conditional styling.
 * @example
 * ```typescript
 * // Basic usage - conflicting padding classes
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4' (px-4 overrides px-2)
 *
 * // Conditional classes
 * cn(
 *   'base-btn',
 *   isActive && 'bg-blue-500',
 *   isDisabled && 'opacity-50 cursor-not-allowed'
 * )
 *
 * // Object syntax for multiple conditions
 * cn('card', {
 *   'border-red-500': hasError,
 *   'border-green-500': isSuccess,
 *   'animate-pulse': isLoading
 * })
 *
 * // Component composition
 * interface ButtonProps {
 *   className?: string;
 *   variant?: 'primary' | 'secondary';
 * }
 *
 * function Button({ className, variant = 'primary', ...props }: ButtonProps) {
 *   return (
 *     <button
 *       className={cn(
 *         'px-4 py-2 rounded font-medium transition-colors',
 *         variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
 *         variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
 *         className // User-provided classes can override defaults
 *       )}
 *       {...props}
 *     />
 *   );
 * }
 * ```
 * @see {@link https://github.com/lukeed/clsx} - clsx documentation
 * @see {@link https://github.com/dcastil/tailwind-merge} - tailwind-merge documentation
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
