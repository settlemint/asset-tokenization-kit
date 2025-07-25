import { expect } from "@playwright/test";
import { BasePage } from "./base-page";

export class SignUpPage extends BasePage {
  async goto() {
    await this.page.goto("http://localhost:3000/auth/sign-up");
  }

  async fillSignUpForm(email: string, password: string): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);

    await this.page
      .getByRole("textbox", { name: "Email" })
      .click({ force: true });
    await this.page.getByRole("textbox", { name: "Email" }).fill(email);

    await this.page
      .getByRole("textbox", { name: "Password", exact: true })
      .click({ force: true });
    await this.page
      .getByRole("textbox", { name: "Password", exact: true })
      .fill(password);

    await this.page
      .getByRole("textbox", { name: "Confirm Password" })
      .click({ force: true });
    await this.page
      .getByRole("textbox", { name: "Confirm Password" })
      .fill(password);

    await this.page.waitForTimeout(1000);
  }

  async submitForm(): Promise<void> {
    await this.page.getByRole("button", { name: "Create an account" }).click();
  }

  async expectSuccessfulSignUp(): Promise<void> {
    await Promise.race([
      this.page.waitForURL(/\/onboarding/, { timeout: 10000 }),
      this.page.waitForURL(/\/auth\/sign-in/, { timeout: 10000 }),
      this.page.waitForURL(/\/dashboard/, { timeout: 10000 }),
    ]);

    const currentUrl = this.page.url();
    const isSuccess =
      currentUrl.includes("/onboarding") ||
      currentUrl.includes("/auth/sign-in") ||
      currentUrl.includes("/dashboard");
    expect(isSuccess).toBe(true);
  }

  async expectValidationError(): Promise<void> {
    expect(this.page.url()).toContain("/auth/sign-up");

    const submitButton = this.page.getByRole("button", {
      name: "Create an account",
    });
    const isButtonDisabled = await submitButton.isDisabled();
    const pageContent = await this.page.textContent("body");
    const hasValidationError =
      pageContent?.includes("required") ||
      pageContent?.includes("invalid") ||
      pageContent?.includes("error") ||
      isButtonDisabled;

    expect(hasValidationError).toBe(true);
  }
}
