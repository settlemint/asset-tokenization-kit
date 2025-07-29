import { expect, type Page } from "@playwright/test";

export class SignInPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/auth/sign-in");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async fillSignInForm(email: string, password: string): Promise<void> {
    const emailField = this.page.getByRole("textbox", { name: "Email" });
    await emailField.click();
    await emailField.focus();
    await emailField.clear();
    await emailField.pressSequentially(email, { delay: 50 });

    const passwordField = this.page.getByLabel("Password");
    await passwordField.click();
    await passwordField.focus();
    await passwordField.clear();
    await passwordField.pressSequentially(password, { delay: 50 });
  }

  async submitSignInForm(): Promise<void> {
    await this.page.getByRole("button", { name: "Login" }).click();
  }

  async clearForm(): Promise<void> {
    const emailField = this.page.getByRole("textbox", { name: "Email" });
    await emailField.fill("");
    const passwordField = this.page.getByLabel("Password");
    await passwordField.fill("");
  }

  async expectToStayOnSignInPage(): Promise<void> {
    expect(this.page.url()).toContain("/auth/sign-in");
    const loginButton = this.page.getByRole("button", { name: "Login" });
    await expect(loginButton).toBeVisible();
  }

  async expectAuthenticationError(): Promise<void> {
    await expect(
      this.page.locator('li[data-type="error"] div[data-title]')
    ).toBeVisible();
    await expect(
      this.page.locator('li[data-type="error"] div[data-title]')
    ).toHaveText("The email or password you entered is invalid.");
  }

  async expectSuccessfulSignIn(): Promise<void> {
    const authErrorToast = this.page.locator(
      'div[data-sonner-toast][data-type="error"]'
    );
    const authErrorVisible = await authErrorToast.isVisible({ timeout: 3000 });

    if (authErrorVisible) {
      const authErrorText = await authErrorToast.textContent();
      throw new Error(
        `Sign-in failed: Authentication error detected - ${authErrorText}`
      );
    }

    try {
      await expect(this.page).toHaveURL(/dashboard/, { timeout: 15000 });
    } catch (urlError) {
      const currentUrl = this.page.url();
      const isStillOnSignIn = currentUrl.includes("/auth/sign-in");

      if (isStillOnSignIn) {
        const errorMessages = await this.page
          .locator('div[role="alert"], .error-message, [data-testid="error"]')
          .allTextContents();

        if (errorMessages.length > 0) {
          throw new Error(
            `Sign-in failed: Found error messages - ${errorMessages.join(", ")}`
          );
        }

        throw new Error(
          "Sign-in failed: Still on sign-in page without clear error message"
        );
      }

      throw new Error(
        `Sign-in failed: Expected to be on dashboard but got ${currentUrl}`
      );
    }
  }
}
