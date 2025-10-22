import { BasePage, expect } from "./base-page";

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type ThemeMode = "light" | "dark";

export class ThemeSettingsPage extends BasePage {
  async goto(): Promise<void> {
    await this.page.goto("/platform-settings/theme");
    await this.waitForLoaded();
  }

  async waitForLoaded(): Promise<void> {
    await this.page
      .getByRole("heading", { name: "Theme" })
      .first()
      .waitFor({ state: "visible", timeout: 45000 });
    await this.page
      .locator("table")
      .first()
      .waitFor({ state: "visible", timeout: 45000 });
  }

  private colorRow(token: string) {
    return this.page
      .locator("table tr")
      .filter({ has: this.page.getByRole("cell", { name: token }) })
      .first();
  }

  async getColorTokenValue(token: string): Promise<string> {
    const input = this.colorRow(token).getByRole("textbox").first();
    return input.inputValue();
  }

  async setColorToken(token: string, value: string): Promise<void> {
    const input = this.colorRow(token).getByRole("textbox").first();
    await input.waitFor({ state: "visible", timeout: 15000 });
    await input.click();
    await input.fill(value);
    await input.blur();
    await this.waitForReactStateSettle();
  }

  async expectColorSwatchValue(token: string, value: string): Promise<void> {
    const swatch = this.colorRow(token)
      .getByRole("button", { name: new RegExp(`Edit ${token} color`, "i") })
      .first();
    await expect(swatch).toHaveAttribute(
      "style",
      new RegExp(`background:\\s*${escapeForRegExp(value)}`)
    );
  }

  async expectColorInputValue(token: string, value: string): Promise<void> {
    const input = this.colorRow(token).getByRole("textbox").first();
    await expect(input).toHaveValue(value);
  }

  private logoInput(mode: ThemeMode) {
    const index = mode === "light" ? 0 : 1;
    return this.page
      .locator('input[placeholder="https://cdn.example.com/logo.svg"]')
      .nth(index);
  }

  private logoPreviewImage(mode: ThemeMode) {
    const index = mode === "light" ? 0 : 1;
    return this.page
      .locator("div.space-y-6 img, div.rounded-md img")
      .filter({ hasNot: this.page.locator("svg") })
      .nth(index);
  }

  async getLogoValue(mode: ThemeMode): Promise<string> {
    return this.logoInput(mode).inputValue();
  }

  async setLogoUrl(mode: ThemeMode, url: string): Promise<void> {
    const input = this.logoInput(mode);
    await input.waitFor({ state: "visible", timeout: 15000 });
    await input.click();
    await input.fill(url);
    await input.blur();
  }

  async expectLogoPreview(mode: ThemeMode, expectedUrl: string): Promise<void> {
    const preview = this.logoPreviewImage(mode);
    await expect(preview).toHaveAttribute(
      "src",
      new RegExp(escapeForRegExp(expectedUrl))
    );
  }

  async openPreviewTab(label: "Light preview" | "Dark preview"): Promise<void> {
    const tab = this.page.getByRole("tab", { name: label });
    await tab.waitFor({ state: "visible", timeout: 15000 });
    await tab.click();
  }

  async openEditorTab(label: string): Promise<void> {
    const trigger = this.page
      .getByRole("tab", { name: new RegExp(`^${escapeForRegExp(label)}`, "i") })
      .first();
    await trigger.waitFor({ state: "visible", timeout: 15000 });
    await trigger.click();
  }

  async save(): Promise<void> {
    const actionsTrigger = this.page.getByRole("button", {
      name: /theme actions/i,
    });
    await actionsTrigger.waitFor({ state: "visible", timeout: 15000 });
    await actionsTrigger.click();

    const saveItem = this.page.getByRole("menuitem", { name: /save/i }).first();
    await saveItem.waitFor({ state: "visible", timeout: 15000 });
    await expect(saveItem).not.toHaveAttribute("aria-disabled", "true");
    await saveItem.click();
  }

  async expectToast(message: string): Promise<void> {
    const toast = this.page
      .locator('[data-sonner-toast][data-state="open"]')
      .filter({ hasText: message })
      .first();
    await expect(toast).toBeVisible({ timeout: 30000 });
  }

  async getThemeHash(): Promise<string | null> {
    const styleElement = this.page.locator("#theme-overrides").first();
    if (await styleElement.count()) {
      return styleElement.getAttribute("data-hash");
    }
    return null;
  }
}
