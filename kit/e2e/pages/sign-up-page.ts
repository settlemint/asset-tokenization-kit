import { expect } from "@playwright/test";
import { BasePage } from "./base-page";

export class SignUpPage extends BasePage {
  async goto() {
    await this.page.goto("/");
  }

  async signUp(options: {
    name: string;
    email: string;
    password: string;
    pincodeName: string;
    pincode: string;
  }) {
    await this.page.getByRole("link", { name: "Issuer portal" }).click();
    await this.page.getByRole("link", { name: "Sign Up" }).click();
    await this.page.getByLabel("Name").fill(options.name);
    await this.page.getByLabel("Email").fill(options.email);
    await this.page
      .getByPlaceholder("Enter your password", { exact: true })
      .fill(options.password);
    await this.page
      .getByPlaceholder("Confirm Password", { exact: true })
      .fill(options.password);
    await this.page.getByRole("button", { name: "Create an account" }).click();
    await this.page.waitForURL(
      (url) =>
        url.pathname.includes("/portfolio") || url.pathname.includes("/assets"),
      { timeout: 10000 }
    );
    await this.secureWallet({ pincode: options.pincode });
    await expect(
      this.page.locator("div.grid span.truncate.font-semibold", {
        hasText: options.name,
      })
    ).toBeVisible({ timeout: 30000 });
  }

  async secureWallet(options: { pincode: string }) {
    const dialogSelector = 'div[role="dialog"][data-state="open"]';

    const isDialogVisible = await this.page
      .isVisible(dialogSelector, { timeout: 30000 })
      .catch(() => false);

    if (isDialogVisible) {
      // Step 1: Create wallet
      await this.page.getByRole("button", { name: "Create my wallet" }).click();
      
      // Wait for wallet creation to complete
      await this.page.waitForSelector('text=Continue', {
        state: "visible",
        timeout: 30000,
      });
      await this.page.getByRole("button", { name: "Continue" }).click();
      
      // Step 2: Set up PIN security
      await this.page.getByRole("button", { name: "PIN-code" }).click();
      await this.page.locator('[data-input-otp="true"]').fill(options.pincode);
      await this.page.getByRole("button", { name: "Next" }).click();
      
      // Step 3: Handle recovery codes
      await this.page.waitForSelector('button[title="Copy to clipboard"]', {
        state: "visible",
        timeout: 30000,
      });
      await this.page.getByRole("button", { name: "Confirm i've stored them" }).click();
      
      // Step 4: Complete the process
      await this.page
        .getByRole("button", { name: "Start using my wallet" })
        .click();
    }
  }
}
