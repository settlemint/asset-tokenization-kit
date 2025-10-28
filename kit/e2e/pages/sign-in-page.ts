import { expect, type Page } from "@playwright/test";

export class SignInPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/auth/sign-in");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async fillSignInForm(email: string, password: string): Promise<void> {
    const emailField = this.page.getByRole("textbox", { name: "Email" });
    await emailField.waitFor({ state: "visible", timeout: 10000 });
    await emailField.click();
    await emailField.clear();
    await emailField.pressSequentially(email, { delay: 100 });

    const passwordField = this.page.getByLabel("Password");
    await passwordField.waitFor({ state: "visible", timeout: 10000 });
    await passwordField.click();
    await passwordField.clear();
    await passwordField.pressSequentially(password, { delay: 100 });
  }

  async submitSignInForm(): Promise<void> {
    const loginButton = this.page.getByRole("button", { name: "Login" });
    await expect(loginButton).toBeEnabled({ timeout: 10000 });
    await loginButton.click();
  }

  async clearForm(): Promise<void> {
    const emailField = this.page.getByRole("textbox", { name: "Email" });
    await emailField.waitFor({ state: "visible", timeout: 10000 });
    await emailField.clear();

    const passwordField = this.page.getByLabel("Password");
    await passwordField.waitFor({ state: "visible", timeout: 10000 });
    await passwordField.clear();
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
      await expect(this.page).toHaveURL(/^http:\/\/localhost:3000\/$/, {
        timeout: 15000,
      });
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

  async fillEmail(email: string): Promise<void> {
    const emailField = this.page.getByRole("textbox", { name: "Email" });
    await emailField.waitFor({ state: "visible", timeout: 10000 });
    await emailField.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    const passwordField = this.page.getByRole("textbox", { name: "Password" });
    await passwordField.waitFor({ state: "visible", timeout: 10000 });
    await passwordField.fill(password);
  }

  async clickEmailField(): Promise<void> {
    const emailField = this.page.getByRole("textbox", { name: "Email" });
    await emailField.waitFor({ state: "visible", timeout: 10000 });
    await emailField.click();
  }

  async clickPasswordField(): Promise<void> {
    const passwordField = this.page.getByRole("textbox", { name: "Password" });
    await passwordField.waitFor({ state: "visible", timeout: 10000 });
    await passwordField.click();
  }

  async clickLoginButton(): Promise<void> {
    const loginButton = this.page.getByRole("button", { name: "Login" });
    await expect(loginButton).toBeEnabled({ timeout: 10000 });
    await loginButton.click();
  }

  async expectValidationError(errorMessage: string): Promise<void> {
    await expect(this.page.getByText(errorMessage)).toBeVisible({
      timeout: 10000,
    });
  }

  async expectSuccessfulNavigation(): Promise<void> {
    await expect(this.page).toHaveURL("/", { timeout: 10000 });
  }

  async expectSuccessfulLoginWithDashboard(): Promise<void> {
    await expect(this.page).toHaveURL("/", { timeout: 10000 });

    const assetDesignerButton = this.page.getByRole("button", {
      name: "Asset designer",
    });
    await expect(assetDesignerButton).toBeVisible({ timeout: 15000 });
  }
}
