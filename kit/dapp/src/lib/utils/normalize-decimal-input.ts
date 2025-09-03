/**
 * Detects the thousands and decimal separators for a given locale
 * 
 * @param locale - The locale to use for separator detection (e.g., 'en-US', 'de-DE')
 * @returns Object containing the thousands and decimal separators for the locale
 */
function detectLocaleSeparators(locale: string): {
  thousandsSeparator: string;
  decimalSeparator: string;
} {
  const formatter = new Intl.NumberFormat(locale);
  
  // Format a number with both thousands and decimal parts to detect separators
  const parts = formatter.formatToParts(11_111.11);
  
  let thousandsSeparator = '';
  let decimalSeparator = '.';
  
  // Extract separators from the formatted parts
  for (const part of parts) {
    if (part.type === 'group') {
      thousandsSeparator = part.value;
    } else if (part.type === 'decimal') {
      decimalSeparator = part.value;
    }
  }
  
  return { thousandsSeparator, decimalSeparator };
}

/**
 * Normalizes decimal input from any locale format to standard format (period as decimal separator)
 * 
 * This utility detects the locale's thousands and decimal separators using Intl.NumberFormat,
 * converts non-ASCII numerals to ASCII digits, then converts the input to a normalized format 
 * that can be parsed by dnum.from()
 * 
 * @param value - The input string in locale-specific format
 * @param locale - The locale to use for separator detection (e.g., 'en-US', 'de-DE')
 * @returns Normalized string with ASCII numerals, period as decimal separator, and no thousands separators
 * 
 * @example
 * normalizeDecimalInput('1,234.56', 'en-US') // returns '1234.56'
 * normalizeDecimalInput('1.234,56', 'de-DE') // returns '1234.56'
 * normalizeDecimalInput('1 234,56', 'fr-FR') // returns '1234.56'
 * normalizeDecimalInput('١٬٢٣٤٫٥٦', 'ar-SA') // returns '1234.56'
 */
export function normalizeDecimalInput(value: string, locale: string): string {
  if (!value) return '';
  
  // Detect locale separators
  const { thousandsSeparator, decimalSeparator } = detectLocaleSeparators(locale);
  
  let normalized = value;
  
  // Convert Arabic-Indic numerals to ASCII numerals
  const arabicIndicMap: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  for (const [arabicDigit, asciiDigit] of Object.entries(arabicIndicMap)) {
    normalized = normalized.replaceAll(arabicDigit, asciiDigit);
  }
  
  // Remove all thousands separators
  if (thousandsSeparator) {
    // Escape regex special characters
    const escaped = thousandsSeparator.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    normalized = normalized.replaceAll(new RegExp(escaped, 'g'), '');
  }
  
  // Replace decimal separator with period
  if (decimalSeparator !== '.') {
    const escaped = decimalSeparator.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    normalized = normalized.replaceAll(new RegExp(escaped, 'g'), '.');
  }
  
  return normalized;
}