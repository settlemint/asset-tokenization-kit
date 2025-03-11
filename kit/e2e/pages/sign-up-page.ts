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
    await this.page.getByRole("link", { name: "Issuer Portal" }).click();
    await this.page.getByRole("link", { name: "Sign Up" }).click();
    await this.page.getByLabel("Name").fill(options.name);
    await this.page.getByLabel("Email").fill(options.email);
    await this.page.getByLabel("Password").fill(options.password);
    await this.page.getByRole("button", { name: "Create an account" }).click();
    await this.page.waitForURL("**/portfolio");
    await this.page.waitForSelector('label:has-text("Pincode Name")', {
      state: "visible",
    });
    await this.page.getByLabel("Pincode Name").fill(options.pincodeName);
    await this.page.locator('[data-input-otp="true"]').fill(options.pincode);
    await this.page.getByRole("button", { name: "Setup Pincode" }).click();
    await expect(
      this.page.locator("div.grid span.truncate.font-semibold", {
        hasText: options.name,
      })
    ).toBeVisible();
  }
}
