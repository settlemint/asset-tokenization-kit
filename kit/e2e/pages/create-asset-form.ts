import { expect } from "@playwright/test";
import { BasePage } from "./base-page";

export class CreateAssetForm extends BasePage {
  async clickOnContinueButton() {
    const continueButton = this.page.locator(
      'button[data-slot="button"]:has-text("Continue")'
    );
    await continueButton.focus();
    await continueButton.click();
  }

  async fillBasicFields(options: {
    name: string;
    symbol: string;
    isin?: string;
    internalId?: string;
    decimals?: string;
  }) {
    await this.page.getByLabel("Name").fill(options.name);

    await this.page.getByLabel("Symbol").fill(options.symbol);
    if (options.isin !== undefined) {
      await this.page.getByLabel("ISIN").fill(options.isin);
    }
    if (options.decimals !== undefined) {
      await this.page.getByLabel("Decimals").fill(options.decimals);
    }
    if (options.internalId !== undefined) {
      await this.page.getByLabel("Internal ID").fill(options.internalId);
    }
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
    await this.page
      .locator(
        'div[data-slot="sidebar-content"] > button:has-text("Asset Designer")'
      )
      .first()
      .click();
    await this.page
      .locator(
        `[data-slot="card"] [data-slot="card-title"]:has-text("${assetType}")`
      )
      .click();
  }

  async fillCryptocurrencyDetails(options: {
    initialSupply?: string;
    price?: string;
  }) {
    if (options.initialSupply !== undefined) {
      await this.page.getByLabel("Initial supply").fill(options.initialSupply);
    }
    if (options.price !== undefined) {
      await this.page.getByLabel("Price").fill(options.price);
    }
  }

  async fillEquityConfigurationFields(options: {
    equityClass?: string;
    equityCategory?: string;
    price?: string;
  }) {
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
    if (options.price !== undefined) {
      await this.page.getByLabel("Price").fill(options.price);
    }
  }

  async verifyCurrencyValue(expected: string) {
    await expect(
      this.page.locator('select[name="price.currency"]')
    ).toHaveValue(expected);
  }

  async fillFundConfigurationFields(
    options: {
      fundCategory?: string;
      fundClass?: string;
      managementFeeBps?: string;
      price?: string;
    } = {}
  ) {
    const actions: Record<string, (value: string) => Promise<void>> = {
      fundCategory: async (value) => {
        await this.page.getByLabel("Fund category", { exact: false }).click();
        await this.page.getByRole("option", { name: value }).click();
      },
      fundClass: async (value) => {
        await this.page.getByLabel("Fund class", { exact: false }).click();
        await this.page.getByRole("option", { name: value }).click();
      },
      managementFeeBps: async (value) => {
        await this.page
          .getByLabel("Management fee", { exact: false })
          .fill(value);
      },
      price: async (value) => {
        await this.page.getByLabel("Price", { exact: false }).fill(value);
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
      collateralProofValidity?: string;
      collateralProofValidityTimeUnit?: string;
      priceAmount?: string;
      priceCurrency?: string;
    } = {}
  ) {
    const actions: Record<string, (value: string) => Promise<void>> = {
      collateralProofValidity: async (value) => {
        await this.page
          .getByLabel("Collateral proof validity", { exact: false })
          .fill(value);
      },
      collateralProofValidityTimeUnit: async (value) => {
        await this.page.locator("#collateralLivenessTimeUnit").click();
        await this.page.getByRole("option", { name: value }).click();
      },
      priceAmount: async (value) => {
        await this.page.getByLabel("Price", { exact: false }).fill(value);
      },
      priceCurrency: async (value) => {
        await this.page.locator("#price\\.currency").click();
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
}
