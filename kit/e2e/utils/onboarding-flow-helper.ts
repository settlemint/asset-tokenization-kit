import type { Page } from "@playwright/test";
import { Pages } from "../pages/pages";
import { onboardingTestData } from "../test-data/user-data";
import { cleanupZeroAddressUsers } from "./db-utils";

export class OnboardingFlowHelper {
  private page: Page;
  public pages: ReturnType<typeof Pages>;

  constructor(page: Page) {
    this.page = page;
    this.pages = Pages(page);
  }

  async setupTest(): Promise<void> {
    await cleanupZeroAddressUsers();
  }

  async startOnboardingFlow(): Promise<void> {
    await this.pages.onboardingPage.verifyWelcomePage();
    await this.pages.onboardingPage.continueSetup();
    await this.page.waitForTimeout(3000);
  }

  async completeWalletSteps(): Promise<void> {
    await this.pages.onboardingPage.verifyCurrentStep(
      1,
      onboardingTestData.expectedSteps.admin
    );
    await this.pages.onboardingPage.createWallet();

    await this.pages.onboardingPage.verifyCurrentStep(
      2,
      onboardingTestData.expectedSteps.admin
    );
    await this.pages.onboardingPage.selectPinOption();
    await this.pages.onboardingPage.setupPin(onboardingTestData.pinCode);

    await this.pages.onboardingPage.verifyCurrentStep(
      3,
      onboardingTestData.expectedSteps.admin
    );
    await this.pages.onboardingPage.verifyRecoveryCodesPage();
    await this.pages.onboardingPage.confirmRecoveryCodes();
  }

  async completeSystemSteps(): Promise<void> {
    await this.pages.onboardingPage.verifyCurrentStep(
      4,
      onboardingTestData.expectedSteps.admin
    );
    await this.pages.onboardingPage.deploySystem(onboardingTestData.pinCode);

    await this.pages.onboardingPage.verifyCurrentStep(
      5,
      onboardingTestData.expectedSteps.admin
    );
    await this.pages.onboardingPage.configureSystem();

    await this.pages.onboardingPage.verifyCurrentStep(
      6,
      onboardingTestData.expectedSteps.admin
    );
    await this.pages.onboardingPage.selectAssetTypes(
      [
        onboardingTestData.assetTypes.bonds,
        onboardingTestData.assetTypes.equities,
      ],
      onboardingTestData.pinCode
    );

    await this.pages.onboardingPage.verifyCurrentStep(
      7,
      onboardingTestData.expectedSteps.admin
    );
    await this.pages.onboardingPage.skipSystemAddons();
  }

  async completeFullAdminFlow(): Promise<void> {
    await this.startOnboardingFlow();
    await this.completeWalletSteps();
    await this.completeSystemSteps();
  }

  async completeFullRegularUserFlow(): Promise<void> {
    await this.startOnboardingFlow();
    await this.pages.onboardingPage.verifyStepCount(
      onboardingTestData.expectedSteps.regularUser
    );
    await this.completeWalletSteps();
  }

  async verifyStepProgression(
    currentStep: number,
    totalSteps: number
  ): Promise<void> {
    await this.pages.onboardingPage.verifyCurrentStep(currentStep, totalSteps);
  }

  async verifyWalletStepsCompleted(): Promise<void> {
    for (const step of onboardingTestData.walletSteps) {
      await this.pages.onboardingPage.verifyStepCompleted(step);
    }
  }

  async verifySystemStepsCompleted(): Promise<void> {
    for (const step of onboardingTestData.systemSteps) {
      await this.pages.onboardingPage.verifyStepCompleted(step);
    }
  }

  async getStepCount(): Promise<number> {
    const stepText = await this.page
      .locator("text=/\\d+ \\/ \\d+/")
      .textContent();
    if (stepText) {
      const match = stepText.match(/\/ (\d+)/);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  }

  async isAdminUser(): Promise<boolean> {
    const totalSteps = await this.getStepCount();
    return totalSteps === onboardingTestData.expectedSteps.admin;
  }
}
