import { test } from "@playwright/test";
import { Pages } from "../pages/pages";
import { adminUser, signInTestData } from "../test-data/user-data";

test.describe("Sign-in Tests", () => {
  test("should stay on sign-in page with wrong password", async ({ page }) => {
    const pages = Pages(page);

    await pages.signInPage.goto();
    await pages.signInPage.clearForm();
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
    const pages = Pages(page);

    await pages.signInPage.goto();
    await pages.signInPage.clearForm();
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
