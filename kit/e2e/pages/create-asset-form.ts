import { expect } from "@playwright/test";
import { BasePage } from "./base-page";

export class CreateAssetForm extends BasePage {
  async clickOnNextButton() {
    const nextButton = this.page.locator(
      'button[data-slot="button"]:has-text("Next")'
    );
    await nextButton.focus();
    await nextButton.click();
  }

  async fillBasicFields(options: {
    name?: string;
    symbol?: string;
    decimals?: string;
    isin?: string;
    country?: string;
  }) {
    if (options.name !== undefined) {
      await this.page.getByLabel("Name").fill(options.name);
    }
    if (options.symbol !== undefined) {
      await this.page.getByLabel("Symbol").fill(options.symbol);
    }
    if (options.decimals !== undefined) {
      await this.page.getByLabel("Decimals").fill(options.decimals);
    }
    if (options.isin !== undefined) {
      await this.page.getByLabel("ISIN").fill(options.isin);
    }
    if (options.country !== undefined) {
      await this.page.getByLabel("Country").click();
      await this.page.getByRole("option", { name: options.country }).click();
    }
  }

  async configureComplianceModules() {
    await expect(
      this.page.getByRole("heading", { name: "Compliance Modules" })
    ).toBeVisible();

    await this.page
      .locator('[data-slot="selectable-card"]')
      .filter({ hasText: "Country Allowlist" })
      .click();
    await this.clickNextButton();
  }

  async fillBondDetails(options: {
    decimals: string;
    maximumSupply: string;
    faceValue: string;
    maturityDate: string;
    underlyingAsset?: string;
  }) {
    await this.page.getByLabel("Decimals").fill(options.decimals);
    await this.page.getByLabel("Maximum supply").fill(options.maximumSupply);
    await this.page.getByLabel("Face value").fill(options.faceValue);
    await this.page.getByLabel("Maturity date").fill(options.maturityDate);
    if (options.underlyingAsset !== undefined) {
      await this.page.getByLabel("Underlying asset").click();
      await this.page
        .getByPlaceholder("Search for an asset...")
        .fill(options.underlyingAsset);
      await this.page
        .getByRole("option", { name: options.underlyingAsset })
        .click();
    }
  }

  async fillStablecoinFields(options: {
    name?: string;
    symbol?: string;
    decimals?: string;
    isin?: string;
    country?: string;
    pincode: string;
  }) {
    await this.fillBasicFields(options);
    await this.clickNextButton();
    await this.configureComplianceModules();
    await this.reviewAndDeploy();
    await this.confirmPinCode(options.pincode);
  }

  getMaturityDate(options: { isPast?: boolean; daysOffset?: number } = {}) {
    const { isPast = false, daysOffset = 1 } = options;
    const date = new Date();

    if (isPast) {
      date.setDate(date.getDate() - daysOffset);
    } else {
      date.setDate(date.getDate() + daysOffset);
    }

    return date.toISOString().slice(0, 16);
  }

  async expectErrorMessage(message: string) {
    const errorMessages = this.page.locator('[data-slot="form-message"]', {
      hasText: message,
    });
    const count = await errorMessages.count();
    expect(count).toBeGreaterThan(0);
    await expect(errorMessages.first()).toBeVisible();
  }

  async expectNoErrorMessage(message: string) {
    const errorMessages = this.page.locator('[data-slot="form-message"]', {
      hasText: message,
    });
    await expect(errorMessages).toHaveCount(0);
  }

  async verifyInputAttribute(label: string, attribute: string, value: string) {
    await expect(this.page.getByLabel(label)).toHaveAttribute(attribute, value);
  }

  async selectAssetType(assetType: string) {
    await this.page.getByRole("button", { name: "Asset designer" }).click();

    if (assetType.toLowerCase() === "stablecoin") {
      await this.page.getByText("Cash EquivalentHighly liquid").click();

      await this.page.getByText("StablecoinDigital currencies").click();

      await this.page.getByRole("button", { name: "Next" }).click();
    } else {
      throw new Error(
        `Asset type "${assetType}" navigation not implemented yet`
      );
    }

    await this.page.waitForURL("**/asset-designer?type=stablecoin");
  }

  async fillCryptocurrencyDetails(options: {
    decimals?: string;
    initialSupply?: string;
    price?: string;
  }) {
    if (options.decimals !== undefined) {
      await this.page.getByLabel("Decimals").fill(options.decimals);
    }
    if (options.initialSupply !== undefined) {
      await this.page.getByLabel("Initial supply").fill(options.initialSupply);
    }
    if (options.price !== undefined) {
      await this.page.getByLabel("Price").fill(options.price);
    }
  }

  async fillEquityConfigurationFields(options: {
    decimals?: string;
    price?: string;
    equityClass?: string;
    equityCategory?: string;
  }) {
    if (options.decimals !== undefined) {
      await this.page.getByLabel("Decimals").fill(options.decimals);
    }
    if (options.price !== undefined) {
      await this.page.getByLabel("Price").fill(options.price);
    }
    if (options.equityClass !== undefined) {
      await this.page.getByRole("combobox", { name: "Equity class" }).click();
      await this.page
        .getByRole("option", { name: options.equityClass })
        .click();
    }
    if (options.equityCategory !== undefined) {
      await this.page
        .getByRole("combobox", { name: "Equity category" })
        .click();
      await this.page
        .getByRole("option", { name: options.equityCategory })
        .click();
    }
  }

  async verifyCurrencyValue(currencyValue: string) {
    await expect(
      this.page.locator('button[id="price.currency"]')
    ).toContainText(currencyValue);
  }

  async fillFundConfigurationFields(
    options: {
      decimals?: string;
      price?: string;
      managementFeeBps?: string;
      fundCategory?: string;
      fundClass?: string;
    } = {}
  ) {
    const actions: Record<string, (value: string) => Promise<void>> = {
      decimals: async (value) => {
        await this.page.getByLabel("Decimals", { exact: false }).fill(value);
      },
      price: async (value) => {
        await this.page.getByLabel("Price", { exact: false }).fill(value);
      },
      managementFeeBps: async (value) => {
        await this.page
          .getByLabel("Management fee", { exact: false })
          .fill(value);
      },
      fundCategory: async (value) => {
        await this.page.getByLabel("Fund category", { exact: false }).click();
        await this.page.getByRole("option", { name: value }).click();
      },
      fundClass: async (value) => {
        await this.page.getByLabel("Fund class", { exact: false }).click();
        await this.page.getByRole("option", { name: value }).click();
      },
    };
    for (const key in options) {
      const value = options[key as keyof typeof options];
      if (value && actions[key]) {
        await actions[key](value);
      }
    }
  }

  async fillStablecoinConfigurationFields(
    options: {
      decimals?: string;
      price?: string;
      priceCurrency?: string;
      collateralProofValidity?: string;
      collateralProofValidityTimeUnit?: string;
    } = {}
  ) {
    const actions: Record<string, (value: string) => Promise<void>> = {
      decimals: async (value) => {
        await this.page.getByLabel("Decimals", { exact: false }).fill(value);
      },
      price: async (value) => {
        await this.page.getByLabel("Price", { exact: false }).fill(value);
      },
      priceCurrency: async (value) => {
        await this.page.locator("#price\\.currency").click();
        await this.page.getByRole("option", { name: value }).click();
      },
      collateralProofValidity: async (value) => {
        await this.page
          .getByLabel("Collateral proof validity", { exact: false })
          .fill(value);
      },
      collateralProofValidityTimeUnit: async (value) => {
        await this.page.locator("#collateralLivenessTimeUnit").click();
        await this.page.getByRole("option", { name: value }).click();
      },
    };

    for (const key in options) {
      const value = options[key as keyof typeof options];
      if (value && actions[key]) {
        await actions[key](value);
      }
    }
  }

  async clearField(label: string) {
    await this.page.getByLabel(label, { exact: false }).fill("");
  }

  async setInvalidValueInNumberInput(selector: string, invalidValue: string) {
    await this.page.evaluate(
      ({ selector, value }) => {
        const input = document.querySelector(selector) as HTMLInputElement;
        if (input) {
          input.value = value;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      },
      { selector, value: invalidValue }
    );
  }

  async isNextButtonEnabled(): Promise<boolean> {
    const nextButton = this.page.getByRole("button", { name: "Next" });
    return await nextButton.isEnabled();
  }

  async expectNextButtonDisabled() {
    const nextButton = this.page.getByRole("button", { name: "Next" });
    await expect(nextButton).toBeDisabled();
  }

  async expectNextButtonDisabledWithValidation(validationMessage?: string) {
    if (validationMessage) {
      await expect(this.page.getByText(validationMessage)).toBeVisible();
    }
    const nextButton = this.page.getByRole("button", { name: "Next" });
    await expect(nextButton).toBeDisabled();
  }

  async expectNextButtonEnabled() {
    const nextButton = this.page.getByRole("button", { name: "Next" });
    await expect(nextButton).toBeEnabled();
  }

  async clickNextButton() {
    const nextButton = this.page.getByRole("button", { name: "Next" });
    await nextButton.click();
  }

  async expectComplianceStep() {
    await expect(
      this.page.getByRole("heading", { name: "Compliance Modules" })
    ).toBeVisible();
  }

  async reviewAndDeploy() {
    await expect(
      this.page.locator("h2").filter({ hasText: "Review & Deploy" })
    ).toBeVisible();

    await expect(
      this.page.getByRole("paragraph").filter({
        hasText:
          "Confirm and deploy your compliant digital asset to the blockchain",
      })
    ).toBeVisible();

    await this.page.getByRole("button", { name: "Submit" }).click();
  }

  async confirmPinCode(pinCode: string) {
    await expect(
      this.page.getByRole("heading", { name: "Confirm asset creation" })
    ).toBeVisible();

    await expect(this.page.getByText("PIN Code")).toBeVisible();

    await this.page.locator('[data-input-otp="true"]').fill(pinCode);

    await expect(
      this.page.getByRole("button", { name: "Confirm" })
    ).toBeEnabled();

    await this.page.getByRole("button", { name: "Confirm" }).click();
  }

  async verifyAssetCreated(options: {
    name: string;
    symbol: string;
    decimals: string;
  }) {
    await this.page.waitForURL(/.*\/token\/0x[a-fA-F0-9]+/, {
      timeout: 120000,
    });

    await expect(this.page.locator('[data-slot="data-table"]')).toBeVisible({
      timeout: 120000,
    });

    let assetRow = this.page.getByRole("row").filter({
      has: this.page.getByRole("cell", { name: options.name }),
    });

    await expect(assetRow).toBeVisible({
      timeout: 30000,
    });

    await expect(
      assetRow.getByRole("cell", { name: options.symbol })
    ).toBeVisible({
      timeout: 30000,
    });

    await expect(
      assetRow.getByRole("cell", { name: options.decimals })
    ).toBeVisible();

    await expect(
      assetRow.locator('[data-slot="badge"]').filter({ hasText: "Paused" })
    ).toBeVisible();
  }
}
