import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

// Reusable toast selectors/helpers
const TOAST = "[data-sonner-toast]";
const TOAST_VISIBLE = `${TOAST}[data-mounted="true"][data-visible="true"]`;
const TOAST_TITLE = "[data-title]";
const TOAST_DESC = "[data-description]";
const toastOf = (page: Page, type: "error" | "success" | "info" | "warning") =>
  page.locator(`${TOAST_VISIBLE}[data-type="${type}"]`);

export async function confirmPinCode(
  page: Page,
  pinCode: string,
  heading: string
) {
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();

  await expect(page.getByText("PIN Code")).toBeVisible();

  await page.locator('[data-input-otp="true"]').fill(pinCode);

  await expect(page.getByRole("button", { name: "Confirm" })).toBeEnabled();

  await page.getByRole("button", { name: "Confirm" }).click();
  const errorToast = toastOf(page, "error");
  const hasError = await errorToast
    .isVisible({ timeout: 500 })
    .catch(() => false);
  if (hasError) {
    const title = (
      await errorToast.locator(TOAST_TITLE).first().textContent()
    )?.trim();
    const desc = (
      await errorToast.locator(TOAST_DESC).first().textContent()
    )?.trim();
    console.error(
      `[Toast:error] ${title ?? "Unknown error"}${desc ? ` - ${desc}` : ""}`
    );
    throw new Error(
      `Pin confirmation error: ${title ?? "Unknown error"}${desc ? ` - ${desc}` : ""}`
    );
  }
}

export const escapeForRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type SelectDropdownOptionParams = {
  label: RegExp | string;
  value: string;
  fallback?: {
    partialLength?: number;
    typeDelayMs?: number;
  };
};

export async function selectDropdownOption(
  page: Page,
  params: SelectDropdownOptionParams
) {
  const { label, value, fallback } = params;
  const labelForError = typeof label === "string" ? label : label.toString();
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      `selectDropdownOption requires a non-empty string value argument for label ${labelForError}`
    );
  }

  const normalizedValue = value.trim();

  const normalizedLabel =
    typeof label === "string"
      ? new RegExp(`^${escapeForRegex(label)}$`, "i")
      : label;

  const comboboxTrigger = page
    .getByRole("combobox", { name: normalizedLabel })
    .first();
  const buttonTrigger = page
    .getByRole("button", { name: normalizedLabel })
    .first();

  const comboboxCount = await comboboxTrigger.count();
  const buttonCount = await buttonTrigger.count();

  if (comboboxCount === 0 && buttonCount === 0) {
    throw new Error(
      `selectDropdownOption could not find a combobox or button with label matching ${normalizedLabel}`
    );
  }

  const trigger = comboboxCount > 0 ? comboboxTrigger : buttonTrigger;
  await expect(trigger).toBeVisible({ timeout: 15000 });
  await trigger.click();

  const optionPattern = new RegExp(`^${escapeForRegex(normalizedValue)}$`, "i");
  const option = page.getByRole("option", { name: optionPattern }).first();

  if ((await option.count()) > 0) {
    await option.click();
    return;
  }

  const partialLength =
    fallback?.partialLength ?? Math.min(6, normalizedValue.length);
  if (partialLength === 0) {
    throw new Error(
      `selectDropdownOption could not find option ${normalizedValue} and fallback typing is disabled`
    );
  }

  const partialValue = normalizedValue.slice(0, partialLength);
  await page.keyboard.type(partialValue, {
    delay: fallback?.typeDelayMs ?? 80,
  });
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
}
