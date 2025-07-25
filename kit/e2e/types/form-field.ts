import type { Locator } from "@playwright/test";

export interface FormField {
  locator: Locator;
  value: string;
  name: string;
}
