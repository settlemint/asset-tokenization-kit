import { expect, test } from "@playwright/test";
import { OnboardingPage } from "../pages/onboarding-page";
import { Pages } from "../pages/pages";
import {
  onboardingTestData,
  transferUserProfiles,
} from "../test-data/user-data";
import { getSetupUser, saveSetupUser } from "../utils/setup-user";

const transferUsers = transferUserProfiles;

test.describe.serial("Transfer User Onboarding", () => {
  test.beforeAll(async () => {
    expect(() => getSetupUser("admin")).not.toThrow();
  });

  for (const transferUser of transferUsers) {
    test(`should onboard ${transferUser.key}`, async ({ page, context }) => {
      const onboardingPage = new OnboardingPage(page);
      const email = `${transferUser.key}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}@settlemint.com`;
      const userRecord = {
        email,
        password: onboardingTestData.password,
        pincode: onboardingTestData.pinCode,
        name: `${transferUser.firstName} ${transferUser.lastName}`,
      } as const;

      await page.goto("/");
      // await onboardingPage.waitForReactHydration();

      await page.goto("auth/sign-up");
      await page
        .getByRole("textbox", { name: /email/i })
        .fill(userRecord.email);
      await page
        .getByRole("textbox", { name: /^password$/i })
        .fill(userRecord.password);
      await page
        .getByRole("textbox", { name: /^confirm password$/i })
        .fill(userRecord.password);
      await page.getByRole("button", { name: /create an account/i }).click();

      await onboardingPage.clickGetStarted();
      await onboardingPage.completeWalletSteps(userRecord.pincode);
      await onboardingPage.setupOnChainId(userRecord.pincode);
      await onboardingPage.fillKycForm({
        firstName: transferUser.firstName,
        lastName: transferUser.lastName,
        dateOfBirth: onboardingTestData.kycData.dateOfBirth,
        countryOfResidence: onboardingTestData.kycData.countryOfResidence,
        residencyStatus: onboardingTestData.kycData.residencyStatus,
        nationalId: transferUser.nationalId,
      });
      await onboardingPage.completeIdentityVerification(userRecord.pincode);

      saveSetupUser(transferUser.key, userRecord);

      const setupAdmin = getSetupUser("admin");
      const adminContext = await context.browser()?.newContext();
      if (!adminContext) {
        throw new Error(
          "Unable to create admin browser context for identity registration"
        );
      }

      const adminPage = await adminContext.newPage();
      const adminPages = Pages(adminPage);

      try {
        await adminPages.signInPage.goto();
        await adminPages.signInPage.fillSignInForm(
          setupAdmin.email,
          setupAdmin.password
        );
        await adminPages.signInPage.submitSignInForm();
        await adminPages.signInPage.expectSuccessfulSignIn();

        await adminPages.adminPage.ensureIdentityRegisteredForUser({
          email: userRecord.email,
          country: onboardingTestData.kycData.countryOfResidence,
          pincode: setupAdmin.pincode,
        });

        await adminPages.adminPage.signOut();
        await adminPages.adminPage.expectSignOutSuccess();
      } finally {
        await adminContext.close();
      }
    });
  }
});
