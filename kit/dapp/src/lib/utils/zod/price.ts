import { z } from "zod/v4";

export const price = () =>
  z
    .number()
    .positive("Price must be positive")
    .finite("Price must be a finite number")
    .refine((value) => {
      const decimalPlaces = (value.toString().split(".")[1] || "").length;
      return decimalPlaces <= 4;
    }, "Price must have at most 4 decimal places")
    .describe("Asset price")
    .brand<"Price">();

export type Price = z.infer<ReturnType<typeof price>>;

/**
 * Type guard to check if a value is a valid price
 * @param value - The value to check
 * @returns true if the value is a valid price
 */
export function isPrice(value: unknown): value is Price {
  return price().safeParse(value).success;
}

/**
 * Safely parse and return a price or throw an error
 * @param value - The value to parse
 * @returns The price if valid, throws when not
 */
export function getPrice(value: unknown): Price {
  if (!isPrice(value)) {
    throw new Error(`Invalid price: ${value}`);
  }
  return value;
}
