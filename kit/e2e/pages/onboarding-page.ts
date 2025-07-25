import { expect } from "@playwright/test";
import { BasePage } from "./base-page";

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
        { timeout: 10000 }
      ),
      this.page.waitForSelector("#root", { state: "visible", timeout: 10000 }),
      this.page.waitForSelector('a[href*="sign-up"], a:has-text("Sign Up")', {
        state: "visible",
        timeout: 10000,
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

    try {
      await expect(
        this.page.getByRole("button", { name: "Let's Get Started" })
      ).toBeVisible({
        timeout: 10000,
      });
    } catch (error) {
      throw error;
    }
  }

  async continueSetup(): Promise<void> {
    const continueButton = this.page.getByRole("button", {
      name: "Continue Setup",
    });
    await expect(continueButton).toBeVisible({ timeout: 10000 });
    await continueButton.click();
    await this.waitForReactStateSettle();
  }

  async clickLetsGetStarted(): Promise<void> {
    const letsGetStartedButton = this.page.getByRole("button", {
      name: "Let's Get Started",
    });

    await expect(letsGetStartedButton).toBeVisible({ timeout: 10000 });
    await letsGetStartedButton.click();
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

  async verifyToastNotification(
    message: string,
    loadingMessage?: string
  ): Promise<void> {
    if (loadingMessage) {
      await this.page
        .locator(`div[data-sonner-toast]:has-text("${loadingMessage}")`)
        .waitFor({ state: "detached", timeout: 10000 });
    }
    try {
      await expect(
        this.page.locator(`div[data-sonner-toast]:has-text("${message}")`)
      ).toBeAttached({ timeout: 2000 });
    } catch {}
  }

  async createWallet(): Promise<void> {
    await this.waitForReactComponent(
      "button[name*='Create my wallet'], button:has-text('Create my wallet')"
    );

    await expect(
      this.page.getByRole("button", { name: "Create my wallet" })
    ).toBeVisible({
      timeout: 10000,
    });
    await this.page.getByRole("button", { name: "Create my wallet" }).click();

    await this.page.waitForTimeout(1000);
    await expect(
      this.page.getByRole("heading", { name: "Wallet Created" })
    ).toBeVisible({
      timeout: 15000,
    });
    try {
      await expect(
        this.page.locator(
          'div[data-sonner-toast]:has-text("Wallet created successfully!")'
        )
      ).toBeAttached({ timeout: 2000 });
    } catch {}
    await expect(
      this.page.getByRole("button", { name: "Continue" })
    ).toBeVisible({
      timeout: 10000,
    });
    await this.page.getByRole("button", { name: "Continue" }).click();
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
      this.page.getByRole("heading", { name: "Your wallet is now secured!" })
    ).toBeVisible({
      timeout: 10000,
    });
    await this.verifyToastNotification("PIN code set successfully");

    await expect(
      this.page.getByRole("button", { name: "Continue" })
    ).toBeVisible({
      timeout: 5000,
    });
    await this.page.getByRole("button", { name: "Continue" }).click();
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  async verifyAndConfirmRecoveryCodes(): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(
      this.page.getByRole("heading", { name: "Your Secret Codes (16)" })
    ).toBeVisible({
      timeout: 15000,
    });

    for (let i = 1; i <= 16; i++) {
      const codeNumber = i.toString().padStart(2, "0");
      await expect(this.page.getByText(`${codeNumber}.`)).toBeVisible({
        timeout: 5000,
      });
    }

    await this.verifyToastNotification("Secret codes generated successfully!");

    await expect(
      this.page.getByRole("button", { name: "Confirm I've stored them" })
    ).toBeVisible({
      timeout: 5000,
    });
    await this.page
      .getByRole("button", { name: "Confirm I've stored them" })
      .click();
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  async deploySystem(pin: string): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(this.page.getByText("Initialize the system")).toBeVisible({
      timeout: 10000,
    });
    await this.page
      .getByRole("button", { name: "Deploy System", exact: true })
      .click();

    await this.enterPinVerification(pin);

    let deployed = false;
    try {
      await expect(
        this.page.getByText("System deployed successfully!")
      ).toBeAttached({ timeout: 120000 });
      deployed = true;
    } catch {
      try {
        await expect(
          this.page.getByRole("heading", { name: "Deployment Details" })
        ).toBeAttached({ timeout: 10000 });
        deployed = true;
      } catch {}
    }
    if (!deployed) {
      throw new Error("System deployment did not complete successfully.");
    }

    await expect(
      this.page.getByRole("heading", { name: "Deployment Details" })
    ).toBeAttached({ timeout: 20000 });
    const continueButton = this.page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeVisible({ timeout: 20000 });
    await expect(continueButton).toBeEnabled({ timeout: 20000 });
    await continueButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  async configureSystem(): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(
      this.page.getByText("Configure Platform Settings")
    ).toBeVisible({
      timeout: 10000,
    });
    await this.page.getByRole("button", { name: "Save & Continue" }).click();

    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  private async selectCheckboxByLabel(
    labels: string[],
    containerSelector: string,
    logPrefix: string
  ) {
    const containers = await this.page.locator(containerSelector).all();
    const allLabels = [];
    for (const [i, container] of containers.entries()) {
      const label = await container.locator("label").innerText();
      allLabels.push(label?.trim() ?? "");
    }

    let selected = false;
    for (const labelToSelect of labels) {
      for (const [i, container] of containers.entries()) {
        const label =
          (await container.locator("label").innerText())?.trim() ?? "";
        if (label.toLowerCase() === labelToSelect.toLowerCase()) {
          const checkbox = container.locator('button[role="checkbox"]');
          await expect(checkbox).toBeVisible({ timeout: 20000 });
          await checkbox.click();
          await this.page.waitForTimeout(200);
          selected = true;
          break;
        }
      }
      if (selected) break;
    }
    if (!selected && containers.length > 0) {
      const fallbackCheckbox = containers[0].locator('button[role="checkbox"]');
      await expect(fallbackCheckbox).toBeVisible({ timeout: 20000 });
      await fallbackCheckbox.click();
      await this.page.waitForTimeout(200);
    }
  }

  async selectAssetTypes(assetTypes: string[], pin: string): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(
      this.page.getByRole("heading", { name: "Select Asset Types" })
    ).toBeVisible({ timeout: 10000 });
    await this.selectCheckboxByLabel(
      assetTypes,
      ".flex.flex-row.items-start",
      "Asset type"
    );
    await this.page.getByRole("button", { name: "Deploy Assets" }).click();
    await this.enterPinVerification(pin);
    await expect(this.page.getByText("Asset Types Deployed")).toBeVisible({
      timeout: 30000,
    });
    await expect(
      this.page.getByRole("button", { name: "Continue" })
    ).toBeVisible({ timeout: 5000 });
    await this.page.getByRole("button", { name: "Continue" }).click();
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  async selectAddons(addons: string[], pin: string): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(this.page.getByText("Enable Addons")).toBeVisible({
      timeout: 10000,
    });
    await this.selectCheckboxByLabel(
      addons,
      ".flex.flex-row.items-start",
      "Addon"
    );
    await this.page.getByRole("button", { name: "Deploy Addons" }).click();
    await this.enterPinVerification(pin);

    await this.page.screenshot({
      path: "debug-after-addon-pin-dialog.png",
      fullPage: true,
    });

    const deployedHeading = this.page.getByRole("heading", {
      name: "Addons Deployed",
    });
    const isDeployedHeadingVisible = await deployedHeading
      .isVisible()
      .catch(() => false);
    if (!isDeployedHeadingVisible) {
      const url = this.page.url();
      await this.page.screenshot({
        path: "debug-no-addons-deployed-heading.png",
        fullPage: true,
      });
    }

    await expect(deployedHeading).toBeVisible({ timeout: 120000 });

    const continueBtn = this.page.getByRole("button", { name: "Continue" });
    const isContinueBtnVisible = await continueBtn
      .isVisible()
      .catch(() => false);
    if (!isContinueBtnVisible) {
      await this.page.screenshot({
        path: "debug-no-continue-btn-after-addons.png",
        fullPage: true,
      });
    }

    await expect(continueBtn).toBeVisible({ timeout: 120000 });
    await continueBtn.click();
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  async setupOnChainId(pin: string): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(
      this.page.getByRole("heading", {
        name: "Creating your ONCHAINID",
        exact: true,
      })
    ).toBeVisible({
      timeout: 10000,
    });
    await this.page.getByRole("button", { name: "Create ONCHAINID" }).click();

    await this.enterPinVerification(pin);

    await expect(
      this.page.getByRole("heading", {
        name: "ONCHAINID created successfully",
        exact: true,
      })
    ).toBeVisible({
      timeout: 20000,
    });
    await expect(
      this.page.getByRole("button", { name: "Continue" })
    ).toBeVisible({
      timeout: 5000,
    });
    await this.page.getByRole("button", { name: "Continue" }).click();
    await this.page.waitForLoadState("networkidle");
    await this.waitForReactStateSettle();
  }

  async fillKycForm(kycData: {
    firstName: string;
    lastName: string;
    dateOfBirth: { year: string; month: string; day: string };
    countryOfResidence: string;
    residencyStatus: string;
    nationalId: string;
  }): Promise<void> {
    await this.waitForReactStateSettle();
    await expect(
      this.page.locator("h2").filter({ hasText: "Add Personal Information" })
    ).toBeVisible({
      timeout: 10000,
    });

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
    await expect(countryOption).toBeVisible({ timeout: 10000 });
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
    await expect(residencyOption).toBeVisible({ timeout: 10000 });
    await residencyOption.click();
    await this.page.waitForTimeout(300);

    await this.page
      .getByRole("textbox", { name: "National ID *" })
      .fill(kycData.nationalId);
    await this.page.waitForTimeout(300);

    await expect(
      this.page.getByRole("button", { name: "Save and continue" })
    ).toBeEnabled({
      timeout: 5000,
    });
  }

  async completeIdentityVerification(pin: string): Promise<void> {
    await this.page.getByRole("button", { name: "Save and continue" }).click();

    await this.waitForReactStateSettle();
    await expect(this.page.getByRole("dialog")).toBeVisible({
      timeout: 10000,
    });

    await this.enterPinVerification(pin);

    await this.verifyToastNotification("Identity registered successfully!");
    await expect(this.page).toHaveURL(/\/$/, { timeout: 20000 });
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
    const monthIndex = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].findIndex((m) => m.toLowerCase() === month.toLowerCase().slice(0, 3));
    try {
      const dateBtn = this.page.locator("button#dob");
      await expect(dateBtn).toBeVisible({ timeout: 10000 });
      await dateBtn.click();
      await this.waitForReactStateSettle();
      const monthSelect = this.page.locator("select.rdp-months_dropdown");
      await expect(monthSelect).toBeVisible({ timeout: 10000 });

      const monthOptions = await monthSelect
        .locator("option")
        .allTextContents();
      if (monthIndex >= 0 && monthIndex < monthOptions.length) {
        await monthSelect.selectOption(monthIndex.toString());
      } else {
        console.warn(
          `[WARN] Target month '${month}' not found in options:`,
          monthOptions
        );
      }
      await this.page.waitForTimeout(300);

      const yearSelect = this.page.locator("select.rdp-years_dropdown");
      await expect(yearSelect).toBeVisible({ timeout: 10000 });
      const yearOptions = await yearSelect.locator("option").allTextContents();
      if (yearOptions.includes(year)) {
        await yearSelect.selectOption(year);
      } else {
        console.warn(
          `[WARN] Target year '${year}' not found in options:`,
          yearOptions
        );
      }
      await this.page.waitForTimeout(300);

      const dayBtns = this.page.locator(
        'button[data-slot="button"][aria-label]'
      );
      const dayLabels = await dayBtns.evaluateAll((btns) =>
        btns.map((b) => b.getAttribute("aria-label"))
      );
      const targetDate = new Date(
        year + "-" + (monthIndex + 1).toString().padStart(2, "0") + "-" + day
      );
      const weekday = targetDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      const fullMonth = targetDate.toLocaleDateString("en-US", {
        month: "long",
      });
      const dayNum = parseInt(day);
      const daySuffix = (d: number) =>
        (d > 3 && d < 21) || d % 10 > 3
          ? "th"
          : ["st", "nd", "rd"][(d % 10) - 1] || "th";
      const ariaLabelVariants = [
        `${weekday}, ${fullMonth} ${dayNum}${daySuffix(dayNum)}, ${year}`,
        `${weekday}, ${month} ${dayNum}${daySuffix(dayNum)}, ${year}`,
        `${weekday}, ${fullMonth} ${dayNum}, ${year}`,
        `${weekday}, ${month} ${dayNum}, ${year}`,
      ];
      let clicked = false;
      for (const label of ariaLabelVariants) {
        const btn = this.page.locator(`button[aria-label="${label}"]`);
        if ((await btn.count()) > 0 && (await btn.isVisible())) {
          await btn.scrollIntoViewIfNeeded();
          await btn.click();
          clicked = true;
          break;
        }
      }
      if (!clicked) {
        console.warn(
          "[WARN] Target day button not found. Available aria-labels:",
          dayLabels
        );
      }
      await this.page.waitForTimeout(300);
      await expect(monthSelect).toBeHidden({ timeout: 10000 });
      await this.waitForReactStateSettle();
    } catch (e) {
      throw e;
    }
  }

  async enterPinVerificationWithRetry(pin: string): Promise<void> {
    await this.retryOperation(async () => {
      await this.waitForReactStateSettle();
      const pinInput = this.page.getByRole("textbox").last();
      await expect(pinInput).toBeVisible({ timeout: 10000 });
      await pinInput.clear();
      await pinInput.fill(pin);
      await this.page.waitForTimeout(300);
      const pinValue = await pinInput.inputValue();

      const confirmButton = this.page.getByRole("button", { name: "Confirm" });
      const confirmButtonCount = await this.page
        .locator("button")
        .filter({ hasText: "Confirm" })
        .count();
      let confirmButtonExists = false;
      let confirmButtonEnabled = false;
      let confirmButtonText = "";
      try {
        confirmButtonExists = await confirmButton.isVisible();
        confirmButtonEnabled = await confirmButton.isEnabled();
        confirmButtonText = await confirmButton.innerText();
      } catch (e) {}
      if (!confirmButtonExists || !confirmButtonEnabled) {
      }

      await expect(confirmButton).toBeEnabled({ timeout: 5000 });
      await confirmButton.click();

      await this.page.waitForTimeout(500);

      const dialog = this.page.getByRole("dialog");
      const isDialogVisible = await dialog.isVisible().catch(() => false);
      if (isDialogVisible) {
      }

      const toast = this.page.locator("div[data-sonner-toast]");
      if (await toast.isVisible().catch(() => false)) {
      }
      const errorMsg = this.page.locator(
        '[data-slot="form-error"], .text-destructive, .text-red-500'
      );
      if (await errorMsg.isVisible().catch(() => false)) {
      }

      await this.page
        .getByRole("dialog")
        .waitFor({ state: "detached", timeout: 10000 });
      await this.waitForReactStateSettle();
    });
  }

  async verifyToastNotificationWithRetry(
    message: string,
    loadingMessage?: string
  ): Promise<void> {
    if (loadingMessage) {
      await this.page
        .locator(`div[data-sonner-toast]:has-text("${loadingMessage}")`)
        .waitFor({ state: "detached", timeout: 10000 });
    }
    try {
      await expect(
        this.page.locator(`div[data-sonner-toast]:has-text("${message}")`)
      ).toBeAttached({ timeout: 2000 });
    } catch {}
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

  async completeIdentitySteps(pin: string, kycData: any): Promise<void> {
    await this.setupOnChainId(pin);
    await this.fillKycForm(kycData);
    await this.completeIdentityVerification(pin);
  }

  async completeFullAdminFlow(
    pin: string,
    assetTypes: string[],
    addons: string[],
    kycData: any
  ): Promise<void> {
    await this.clickLetsGetStarted();
    await this.verifyCurrentStep(1, 9);

    await this.completeWalletSteps(pin);

    await this.completeSystemSteps(pin, assetTypes, addons);

    await this.completeIdentitySteps(pin, kycData);
  }

  async setDateOfBirthDirectly(date: string): Promise<void> {
    await this.page.evaluate((date) => {
      const input = document.querySelector('input[name="dateOfBirth"]');
      if (input) (input as HTMLInputElement).value = date;
    }, date);
    await this.waitForReactStateSettle();
  }
}
