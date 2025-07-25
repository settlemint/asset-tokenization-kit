import { expect, test } from "@playwright/test";
import { OnboardingPage } from "../pages/onboarding-page";
import { onboardingTestData } from "../test-data/user-data";

test.setTimeout(600_000);

test.describe.serial("Complete Onboarding Flow", () => {
  let onboardingPage: OnboardingPage;
  const testData = {
    ...onboardingTestData,
    email: `admin-onboarding-${Date.now()}-${Math.random().toString(36).substring(7)}@settlemint.com`,
  };

  test.beforeEach(async ({ page }) => {
    onboardingPage = new OnboardingPage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await onboardingPage.waitForReactHydration();
  });

  test("should complete full onboarding flow with robust date picker", async ({
    page,
  }) => {
    await page.getByRole("link", { name: /sign up/i }).click();
    await page.getByRole("textbox", { name: /email/i }).fill(testData.email);
    await page
      .getByRole("textbox", { name: /^password$/i })
      .fill(testData.password);
    await page
      .getByRole("textbox", { name: /^confirm password$/i })
      .fill(testData.password);
    await page.getByRole("button", { name: /create an account/i }).click();
    await onboardingPage.clickLetsGetStarted();
    await onboardingPage.completeWalletSteps(testData.pinCode);
    await onboardingPage.completeSystemSteps(
      testData.pinCode,
      Object.values(testData.assetTypes),
      Object.values(testData.addons)
    );
    await onboardingPage.setupOnChainId(testData.pinCode);
    await onboardingPage.waitForReactStateSettle();
    try {
      await onboardingPage.fillKycForm(testData.kycData);
    } catch {
      await onboardingPage.setDateOfBirthDirectly("1990-07-25");
      await onboardingPage.waitForReactStateSettle();
      await onboardingPage.fillKycForm({
        ...testData.kycData,
        dateOfBirth: {
          year: "1990",
          month: "Jul",
          day: "25",
        },
      });
    }
    await onboardingPage.completeIdentityVerification(testData.pinCode);
    await onboardingPage.verifyOnboardingComplete(
      `${testData.kycData.firstName} ${testData.kycData.lastName}`
    );
    await expect(page.getByText(/onboardingFinished": true/)).toBeVisible({
      timeout: 20000,
    });
  });
});
