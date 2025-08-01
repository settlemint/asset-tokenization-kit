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
