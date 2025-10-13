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
