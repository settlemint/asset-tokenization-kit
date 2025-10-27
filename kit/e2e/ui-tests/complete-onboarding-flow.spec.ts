import { test } from "@playwright/test";
import { ClaimManagementPage } from "../pages/claim-management-page";
import { OnboardingPage } from "../pages/onboarding-page";
import {
  onboardingTestData,
  userAdminRoles,
  userAdminTrustedTopics,
} from "../test-data/user-data";
import { saveSetupUser } from "../utils/setup-user";

test.setTimeout(600_000);

test.describe.serial("Complete Onboarding Flow", () => {
  let onboardingPage: OnboardingPage;
  const testData = {
    ...onboardingTestData,
    email: `fresh-onboarding-${Date.now()}-${Math.random().toString(36).substring(7)}@settlemint.com`,
  };

  test.beforeEach(async ({ page }) => {
    onboardingPage = new OnboardingPage(page);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await onboardingPage.waitForReactHydration();
  });

  test("should complete full onboarding flow", async ({ page }) => {
    const baseURL =
      (test.info().project.use && (test.info().project.use as any).baseURL) ??
      "(none)";
    let resolved = "sign-up";
    try {
      resolved =
        baseURL !== "(none)"
          ? new URL("sign-up", baseURL as string).toString()
          : "sign-up";
    } catch {
      resolved = "sign-up";
    }

    await page.goto("auth/sign-up");
    await page.waitForLoadState("networkidle");

    await page.getByRole("textbox", { name: /email/i }).fill(testData.email);
    await page
      .getByRole("textbox", { name: /^password$/i })
      .fill(testData.password);
    await page
      .getByRole("textbox", { name: /^confirm password$/i })
      .fill(testData.password);
    await page.getByRole("button", { name: /create an account/i }).click();

    await onboardingPage.clickGetStarted();
    await onboardingPage.completeWalletSteps(testData.pinCode);
    await onboardingPage.completeSystemSteps(
      testData.pinCode,
      [...testData.selectedAssetTypes],
      []
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

    await page.waitForTimeout(5000);

    const userName = `${testData.kycData.firstName} ${testData.kycData.lastName}`;

    await onboardingPage.assignAssetRoles(
      testData.pinCode,
      userName,
      userAdminRoles
    );

    const claimPage = new ClaimManagementPage(page);
    await claimPage.navigateTo();

    await claimPage.addTrustedIssuerByUser(
      userName,
      userAdminTrustedTopics,
      testData.pinCode
    );

    await page.goto("/");

    await onboardingPage.verifyOnboardingComplete(
      `${testData.kycData.firstName} ${testData.kycData.lastName}`
    );

    saveSetupUser("admin", {
      email: testData.email,
      password: testData.password,
      pincode: testData.pinCode,
      name: `${testData.kycData.firstName} ${testData.kycData.lastName}`,
      roles: userAdminRoles,
    });
  });
});
