import { test } from "@playwright/test";
import { Pages } from "../pages/pages";
import { adminUser, signInTestData } from "../test-data/user-data";

test.describe("Sign-in Tests", () => {
  let pages: ReturnType<typeof Pages>;

  test.beforeEach(async ({ page }) => {
    pages = Pages(page);
    await pages.signInPage.goto();
    await pages.signInPage.clearForm();
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test("should stay on sign-in page with wrong password", async ({ page }) => {
    await pages.signInPage.fillSignInForm(
      adminUser.email,
      signInTestData.wrongPassword
    );
    await pages.signInPage.submitSignInForm();

    await page.waitForTimeout(3000);
    await pages.signInPage.expectToStayOnSignInPage();
    await pages.signInPage.expectAuthenticationError();
  });

  test("should handle invalid email format", async ({ page }) => {
    await pages.signInPage.fillSignInForm(
      signInTestData.invalidEmails[0],
      adminUser.password
    );

    await page.waitForTimeout(1000);
    await pages.signInPage.submitSignInForm();
    await page.waitForTimeout(2000);

    await pages.signInPage.expectToStayOnSignInPage();
  });
});
