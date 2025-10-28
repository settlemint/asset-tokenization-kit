import { test } from "@playwright/test";
import { Pages } from "../pages/pages";
import { errorMessages } from "../test-data/error-messages";
import { adminUser, signInTestData } from "../test-data/user-data";
import { validationTestData } from "../test-data/validation-data";
import { getSetupUser } from "../utils/setup-user";

test.describe.serial("Sign-in Tests", () => {
  let pages: ReturnType<typeof Pages>;

  test.beforeEach(async ({ page }) => {
    pages = Pages(page);
    await page.goto("/auth/sign-in");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: "Login" })
      .waitFor({ state: "visible" });
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test("should handle empty form submission", async ({ page }) => {
    await pages.signInPage.clickEmailField();
    await pages.signInPage.clickPasswordField();
    await pages.signInPage.clickLoginButton();

    await pages.signInPage.expectValidationError(
      errorMessages.validation.emailInvalid
    );
    await pages.signInPage.expectValidationError(
      errorMessages.validation.passwordRequired
    );
  });

  test("should handle empty email field", async ({ page }) => {
    await pages.signInPage.clickEmailField();
    await pages.signInPage.fillPassword(adminUser.password);
    await pages.signInPage.clickLoginButton();
    await pages.signInPage.expectValidationError(
      errorMessages.validation.emailInvalid
    );
  });

  test("should handle empty password field", async ({ page }) => {
    await pages.signInPage.fillEmail(adminUser.email);
    await pages.signInPage.clickPasswordField();
    await pages.signInPage.clickLoginButton();
    await pages.signInPage.expectValidationError(
      errorMessages.validation.passwordRequired
    );
  });

  test("should sign in successfully with setup user (admin) credentials and sign out", async () => {
    const setupUser = getSetupUser();
    await pages.signInPage.fillSignInForm(setupUser.email, setupUser.password);
    await pages.signInPage.submitSignInForm();
    await pages.signInPage.expectSuccessfulLoginWithDashboard();
    await pages.portfolioPage.signOut();
    await pages.portfolioPage.expectSignOutSuccess();
  });

  test("should stay on sign-in page with wrong password", async ({ page }) => {
    const setupUser = getSetupUser();
    await pages.signInPage.fillSignInForm(
      setupUser.email,
      signInTestData.wrongPassword
    );
    await pages.signInPage.submitSignInForm();
    await pages.signInPage.expectToStayOnSignInPage();
    await pages.signInPage.expectValidationError(
      errorMessages.authentication.invalidCredentials
    );
  });

  test("should handle non-existent email", async ({ page }) => {
    await pages.signInPage.fillSignInForm(
      validationTestData.nonExistentEmails[0],
      adminUser.password
    );
    await pages.signInPage.submitSignInForm();
    await pages.signInPage.expectToStayOnSignInPage();
    await pages.signInPage.expectValidationError(
      errorMessages.authentication.invalidCredentials
    );
  });

  validationTestData.invalidEmails.forEach((invalidEmail) => {
    test(`should handle invalid email format: ${invalidEmail}`, async () => {
      await pages.signInPage.fillSignInForm(invalidEmail, adminUser.password);
      await pages.signInPage.submitSignInForm();
      await pages.signInPage.expectToStayOnSignInPage();
      await pages.signInPage.expectValidationError(
        errorMessages.validation.emailInvalid
      );
    });
  });

  test("should handle case insensitive email and sign out", async ({
    page,
  }) => {
    const setupUser = getSetupUser();
    await pages.signInPage.fillSignInForm(
      setupUser.email.toUpperCase(),
      setupUser.password
    );
    await pages.signInPage.submitSignInForm();
    await pages.signInPage.expectSuccessfulLoginWithDashboard();
    await pages.portfolioPage.signOut();
    await pages.portfolioPage.expectSignOutSuccess();
  });

  test("should handle email with extra spaces and sign out", async ({
    page,
  }) => {
    const setupUser = getSetupUser();
    await pages.signInPage.fillSignInForm(
      `  ${setupUser.email}  `,
      setupUser.password
    );
    await pages.signInPage.submitSignInForm();
    await pages.signInPage.expectSuccessfulLoginWithDashboard();
    await pages.portfolioPage.signOut();
    await pages.portfolioPage.expectSignOutSuccess();
  });
});
