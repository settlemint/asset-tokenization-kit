import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the singular or plural form of a word based on amount
 * @param amount - The quantity to determine plurality
 * @param word - The singular form of the word
 * @param pluralForm - Optional custom plural form (e.g., "equity" -> "equities")
 * @returns The appropriate form of the word based on amount
 */
export function pluralize(amount: number, word: string, pluralForm?: string): string {
  if (amount === 1) {
    return word;
  }
  return pluralForm ?? `${word}s`;
}
