import { expect } from "@playwright/test";
import type { KycData } from "../types/form-field";
import { BasePage } from "./base-page";
import { RoleManagementPage } from "./role-management-page";

export class OnboardingPage extends BasePage {
  async waitForReactHydration(): Promise<void> {
    await Promise.race([
      this.page.waitForFunction(
        () => {
          const element = document.querySelector("[data-reactroot], #root > *");
          return (
            element &&
            ((element as any)._reactInternalFiber ||
              (element as any)._reactInternalInstance ||
              (window as any).React ||
              document.querySelector("[data-react-helmet]"))
          );
        },
        { timeout: 30000 }
      ),
      this.page.waitForSelector("#root", { state: "visible", timeout: 30000 }),
      this.page.waitForSelector('a[href*="sign-up"], a:has-text("Sign Up")', {
        state: "visible",
        timeout: 30000,
      }),
    ]);
  }

  async waitForReactStateSettle(): Promise<void> {
    await this.page.waitForTimeout(100);
    await this.page.waitForLoadState("networkidle");
  }

  async waitForReactComponent(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { state: "visible" });
    await this.waitForReactStateSettle();
  }

  async verifyWelcomePage(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactHydration();

    await expect(
      this.page.getByRole("button", { name: "Get started" })
    ).toBeVisible({
      timeout: 30000,
    });
  }

  async continueSetup(): Promise<void> {
    const continueButton = this.page.getByRole("button", {
      name: "Continue Setup",
    });
    await expect(continueButton).toBeVisible({ timeout: 120000 });
    await continueButton.click();
    await this.waitForReactStateSettle();
  }

  async clickGetStarted(): Promise<void> {
    await this.waitForReactStateSettle();
    const continueSetupButton = this.page.getByRole("button", {
      name: "Continue setup",
    });

    if (
      await continueSetupButton.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await continueSetupButton.click();
      await this.waitForReactStateSettle();
      return;
    }

    const getStartedButton = this.page.getByRole("button", {
      name: "Get started",
    });

    await expect(getStartedButton).toBeVisible({ timeout: 120000 });
    await getStartedButton.click();
    await this.waitForReactStateSettle();
  }

  async verifyStepCount(expectedSteps: number): Promise<void> {
    await this.waitForReactStateSettle();

    try {
      const stepText = await this.page
        .locator("text=/\\d+ \\/ \\d+/")
        .textContent();

      expect(stepText).toContain(`/ ${expectedSteps}`);
    } catch (error) {
      throw error;
    }
  }

  async verifyCurrentStep(
    stepNumber: number,
    totalSteps: number
  ): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(this.page.getByText(`Step ${stepNumber}`)).toBeVisible();
    await expect(
      this.page.getByText(`${stepNumber} / ${totalSteps}`)
    ).toBeVisible();
  }

  async verifyStepCompleted(stepName: string): Promise<void> {
    await this.waitForReactStateSettle();
    const stepButton = this.page.getByRole("button", {
      name: new RegExp(stepName),
    });
    await expect(stepButton).toBeVisible();
  }

  async createWallet(): Promise<void> {
    await this.waitForReactComponent(
      "button[name*='Create my wallet'], button:has-text('Create my wallet')"
    );

    await expect(
      this.page.getByRole("button", { name: "Create my wallet" })
    ).toBeVisible({
      timeout: 120000,
    });
    await this.page.getByRole("button", { name: "Create my wallet" }).click();

    await this.page.waitForTimeout(1000);
    await expect(
      this.page.locator("h2", { hasText: /^Your wallet$/ })
    ).toBeVisible();
    await this.dismissToastWithLogs();
    await expect(
      this.page.getByRole("button", { name: "Secure my wallet" })
    ).toBeVisible({
      timeout: 120000,
    });
    await this.page.getByRole("button", { name: "Secure my wallet" }).click();
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  async selectPinOption(): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(
      this.page.getByRole("button", { name: "Choose PIN" })
    ).toBeVisible({
      timeout: 10000,
    });
    await this.page.getByRole("button", { name: "Choose PIN" }).click();
    await this.waitForReactStateSettle();
  }

  async setupPin(pin: string): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(this.page.locator('[data-input-otp="true"]')).toBeVisible({
      timeout: 10000,
    });

    const pinField = this.page.locator('[data-input-otp="true"]').nth(0);
    await pinField.fill(pin);
    await this.page.waitForTimeout(300);

    const confirmField = this.page.locator('[data-input-otp="true"]').nth(1);
    await confirmField.fill(pin);
    await this.page.waitForTimeout(300);

    await expect(this.page.getByText("✓ PIN codes match")).toBeVisible({
      timeout: 5000,
    });

    await this.page.getByRole("button", { name: "Set PIN Code" }).click();

    await expect(
      this.page.locator("h2", {
        hasText: "Great! Your security method is set.",
      })
    ).toBeVisible({ timeout: 120000 });
    await expect(
      this.page.getByRole("button", { name: "Generate your backup codes" })
    ).toBeVisible({ timeout: 120000 });
    await this.page
      .getByRole("button", { name: "Generate your backup codes" })
      .click();
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  async verifyAndConfirmRecoveryCodes(): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: "Your secret codes", exact: true })
    ).toBeVisible({ timeout: 120000 });

    const copyAllButton = this.page.getByRole("button", { name: "Copy all" });
    await expect(copyAllButton).toBeVisible({ timeout: 120000 });
    await copyAllButton.click();

    const confirmCheckbox = this.page.locator("#recovery-codes-stored");
    await expect(confirmCheckbox).toBeEnabled({ timeout: 120000 });
    await confirmCheckbox.click();

    const finishButton = this.page.getByRole("button", {
      name: "Finish wallet setup",
    });
    await expect(finishButton).toBeEnabled({ timeout: 120000 });
    await finishButton.click();

    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  async deploySystem(pin: string): Promise<void> {
    await this.waitForReactStateSettle();
    const systemAccordion = this.page.getByRole("button", {
      name: /System Deploy and configure your system/i,
    });
    if (await systemAccordion.isVisible({ timeout: 5000 }).catch(() => false)) {
      const expanded = await systemAccordion
        .getAttribute("aria-expanded")
        .catch(() => null);
      if (expanded === "false") {
        await systemAccordion.click().catch(() => {});
        await this.waitForReactStateSettle();
      }
    }

    const deployBtn = this.page.getByRole("button", {
      name: "Deploy system",
      exact: true,
    });
    await expect(deployBtn).toBeVisible({ timeout: 120000 });
    await expect(deployBtn).toBeEnabled({ timeout: 120000 });
    await deployBtn.click();

    await this.enterPinVerification(pin);

    await expect(
      this.page.getByRole("heading", { name: "System deployed successfully" })
    ).toBeAttached({ timeout: 120000 });

    const configureButton = this.page
      .locator("footer.OnboardingStepLayout__footer")
      .getByRole("button", { name: "Configure platform", exact: true });
    await expect(configureButton).toBeVisible({ timeout: 120000 });
    await expect(configureButton).toBeEnabled({ timeout: 120000 });
    await configureButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  async configureSystem(): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(
      this.page.getByRole("heading", {
        name: /Configure platform settings/i,
      })
    ).toBeVisible({
      timeout: 120000,
    });
    await this.page
      .getByRole("button", { name: /Save\s*&\s*continue/i })
      .click();

    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  private async selectCheckboxByLabel(
    labels: string[],
    containerSelector: string
  ) {
    const containers = await this.page.locator(containerSelector).all();
    for (const labelToSelect of labels) {
      let found = false;
      for (const container of containers) {
        const label =
          (await container.locator("label").innerText())?.trim() ?? "";
        if (label.toLowerCase() === labelToSelect.toLowerCase()) {
          const checkbox = container.locator('button[role="checkbox"]');
          await expect(checkbox).toBeVisible({ timeout: 120000 });
          await checkbox.click();
          await this.page.waitForTimeout(200);
          found = true;
          break;
        }
      }
      if (!found) {
        console.warn(
          `[WARN] Checkbox with label "${labelToSelect}" not found.`
        );
      }
    }
  }

  async selectAssetTypes(assetTypes: string[], pin: string): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(
      this.page.getByRole("heading", {
        name: /Configure Supported Asset Types/i,
        level: 2,
      })
    ).toBeVisible({ timeout: 120000 });
    await this.selectCheckboxByLabel(assetTypes, ".flex.flex-row.items-start");
    await this.page
      .getByRole("button", { name: "Deploy asset factories" })
      .click();
    await this.enterPinVerification(pin);
  }

  async selectAddons(addons: string[], pin: string): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
    await expect(
      this.page.getByRole("heading", {
        name: /Configure Platform Add-ons/i,
        level: 2,
      })
    ).toBeVisible({ timeout: 120000 });
    await this.selectCheckboxByLabel(addons, ".flex.flex-row.items-start");
    await this.page
      .getByRole("button", { name: /Deploy Selected add-ons/i })
      .click();
    await this.enterPinVerification(pin);

    const deployedHeading = this.page.getByRole("heading", {
      name: "Add-ons Deployed Successfully",
    });
    await expect(deployedHeading).toBeVisible({ timeout: 120000 });

    const continueBtn = this.page.getByRole("button", {
      name: "Continue to identity setup",
    });
    await expect(continueBtn).toBeVisible({ timeout: 120000 });
    await continueBtn.click();
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  async setupOnChainId(pin: string): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(
      this.page.getByRole("heading", {
        name: /Your On-Chain Identity/i,
        level: 2,
      })
    ).toBeVisible({
      timeout: 120000,
    });
    await this.page
      .getByRole("button", { name: /Create My ONCHAINID/i })
      .click();

    await this.enterPinVerification(pin);

    await expect(
      this.page.getByRole("heading", { name: /Identity Created Successfully/i })
    ).toBeVisible({
      timeout: 120000,
    });
    await expect(
      this.page.getByRole("button", {
        name: /(Add personal information|Continue)/i,
      })
    ).toBeVisible({ timeout: 120000 });
    await this.page
      .getByRole("button", { name: /(Add personal information|Continue)/i })
      .click();
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  async fillKycForm(kycData: KycData): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(
      this.page.getByRole("heading", {
        name: /Complete Your Personal Information/i,
        level: 2,
      })
    ).toBeVisible({ timeout: 120000 });

    await expect(
      this.page.getByRole("textbox", { name: "First name *" })
    ).toBeVisible({
      timeout: 5000,
    });
    await this.page
      .getByRole("textbox", { name: "First name *" })
      .fill(kycData.firstName);
    await this.page.waitForTimeout(200);

    await this.page
      .getByRole("textbox", { name: "Last name *" })
      .fill(kycData.lastName);
    await this.page.waitForTimeout(200);

    await this.selectDateFlexibly(
      kycData.dateOfBirth.year,
      kycData.dateOfBirth.month,
      kycData.dateOfBirth.day
    );

    const countryDropdown = this.page.getByRole("combobox", {
      name: /country of residence/i,
    });
    await expect(countryDropdown).toBeVisible({ timeout: 20000 });
    await countryDropdown.click();
    const countryOption = this.page.getByRole("option", {
      name: new RegExp(`^${kycData.countryOfResidence}$`, "i"),
    });
    await expect(countryOption).toBeVisible({ timeout: 20000 });
    await countryOption.click();
    await this.page.waitForTimeout(300);

    const residencyDropdown = this.page.getByRole("combobox", {
      name: /residency status/i,
    });
    await expect(residencyDropdown).toBeVisible({ timeout: 20000 });
    await residencyDropdown.click();
    const residencyOption = this.page.getByRole("option", {
      name: new RegExp(`^${kycData.residencyStatus}$`, "i"),
    });
    await expect(residencyOption).toBeVisible({ timeout: 20000 });
    await residencyOption.click();
    await this.page.waitForTimeout(300);

    await this.page
      .getByRole("textbox", { name: "National ID *" })
      .fill(kycData.nationalId);
    await this.page.waitForTimeout(300);

    await expect(
      this.page.getByRole("button", { name: "Save and continue" })
    ).toBeEnabled({
      timeout: 120000,
    });
  }

  async completeIdentityVerification(pin: string): Promise<void> {
    await this.page.getByRole("button", { name: "Save and continue" }).click();

    await this.waitForReactStateSettle();
    await expect(this.page.getByRole("dialog")).toBeVisible({
      timeout: 20000,
    });

    await this.enterPinVerification(pin);
    await expect(this.page).toHaveURL(/\/$/, { timeout: 120000 });
    await this.waitForReactStateSettle();
  }

  async enterPinVerification(pin: string): Promise<void> {
    await this.enterPinVerificationWithRetry(pin);
  }

  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          await this.page.waitForTimeout(delay);
        }
      }
    }

    throw lastError!;
  }

  async selectDateFlexibly(
    year: string,
    month: string,
    day: string
  ): Promise<void> {
    await this.selectDateFromRadixCalendar(
      "button#dob",
      year,
      month,
      day,
      "date of birth"
    );
  }

  async enterPinVerificationWithRetry(pin: string): Promise<void> {
    await this.retryOperation(async () => {
      await this.waitForReactStateSettle();
      const pinInput = this.page.getByRole("textbox").last();
      await expect(pinInput).toBeVisible({ timeout: 20000 });
      await pinInput.clear();
      await pinInput.fill(pin);
      await this.page.waitForTimeout(300);

      const confirmButton = this.page.getByRole("button", { name: "Confirm" });
      await expect(confirmButton).toBeEnabled({ timeout: 5000 });
      await confirmButton.click();

      await this.page.waitForTimeout(500);

      await this.page
        .getByRole("dialog")
        .waitFor({ state: "detached", timeout: 20000 });
      await this.waitForReactStateSettle();
    });
  }

  async completeWalletSteps(pin: string): Promise<void> {
    await this.createWallet();
    await this.selectPinOption();
    await this.setupPin(pin);
    await this.verifyAndConfirmRecoveryCodes();
  }

  async completeSystemSteps(
    pin: string,
    assetTypes: string[],
    addons: string[]
  ): Promise<void> {
    await this.deploySystem(pin);
    await this.configureSystem();
    await this.selectAssetTypes(assetTypes, pin);
    await this.selectAddons(addons, pin);
  }

  async completeIdentitySteps(pin: string, kycData: KycData): Promise<void> {
    await this.setupOnChainId(pin);
    await this.fillKycForm(kycData);
    await this.completeIdentityVerification(pin);
  }

  async completeFullAdminFlow(
    pin: string,
    assetTypes: string[],
    addons: string[],
    kycData: KycData
  ): Promise<void> {
    await this.clickGetStarted();
    await this.verifyCurrentStep(1, 9);

    await this.completeWalletSteps(pin);

    await this.completeSystemSteps(pin, assetTypes, addons);

    await this.completeIdentitySteps(pin, kycData);
  }

  async assignAssetRoles(
    pin: string,
    userName: string,
    roles: string[]
  ): Promise<void> {
    const roleManagementPage = new RoleManagementPage(this.page);

    await roleManagementPage.assignRolesToUser(userName, roles, pin);
    await roleManagementPage.verifyUserHasRoles(userName, roles);
  }

  async verifyOnboardingComplete(userName: string): Promise<void> {
    await this.waitForReactStateSettle();
    const userChip = this.page
      .getByRole("button", {
        name: new RegExp(userName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      })
      .first();
    await expect(userChip).toBeVisible({ timeout: 120000 });

    const assetDesignerButton = this.page.getByRole("button", {
      name: "Asset designer",
    });
    await expect(assetDesignerButton).toBeVisible({ timeout: 120000 });
  }

  async setDateOfBirthDirectly(date: string): Promise<void> {
    await this.page.evaluate((date) => {
      const input = document.querySelector('input[name="dateOfBirth"]');
      if (input) (input as HTMLInputElement).value = date;
    }, date);
    await this.waitForReactStateSettle();
  }

  async dismissToastWithLogs() {
    const toast = this.page.locator(
      'section[aria-label="Notifications alt+T"] li[data-sonner-toast]'
    );
    if (await toast.isVisible({ timeout: 1000 })) {
      try {
        await toast.waitFor({ state: "hidden", timeout: 30000 });
      } catch {
        console.error(
          "[Toast] Toast did not disappear within 30s. Continuing anyway."
        );
      }
    } else {
      console.error("[Toast] No toast visible, nothing to wait for.");
    }
  }

  async getWalletAddress(): Promise<string> {
    return await this.getWalletAddressFromWalletPanel();
  }

  async getWalletAddressFromWalletPanel(): Promise<string> {
    const walletSectionButton = this.page.getByRole("button", {
      name: /^Wallet/,
    });
    if (await walletSectionButton.isVisible().catch(() => false)) {
      await walletSectionButton.click().catch(() => {});
    }

    const addressLocator = this.page.getByText(/^0x[a-fA-F0-9]{40}$/).first();
    await addressLocator.waitFor({ state: "visible", timeout: 60000 });
    const address = (await addressLocator.textContent())?.trim() ?? "";
    return address;
  }
}
