import { expect } from "@playwright/test";
import { BasePage } from "./base-page";

export class CreateAssetForm extends BasePage {
  async clickNext() {
    await this.page.getByRole("button", { name: "Next" }).click();
  }

  async fillBasicFields(options: {
    name?: string;
    symbol?: string;
    isin?: string;
    decimals?: string;
  }) {
    if (options.name !== undefined) {
      await this.page.getByLabel("Name").fill(options.name);
    }
    if (options.symbol !== undefined) {
      await this.page.getByLabel("Symbol").fill(options.symbol);
    }
    if (options.isin !== undefined) {
      await this.page.getByLabel("ISIN").fill(options.isin);
    }
    if (options.decimals !== undefined) {
      await this.page.getByLabel("Decimals").fill(options.decimals);
    }
  }

  async fillBondDetails(options: {
    maximumSupply?: string;
    faceValue?: string;
    maturityDate?: string;
    underlyingAsset?: string;
    price?: string;
  }) {
    if (options.maximumSupply !== undefined) {
      await this.page.getByLabel("Maximum supply").fill(options.maximumSupply);
    }
    if (options.faceValue !== undefined) {
      await this.page.getByLabel("Face value").fill(options.faceValue);
    }
    if (options.maturityDate !== undefined) {
      await this.page.getByLabel("Maturity date").fill(options.maturityDate);
    }
    if (options.underlyingAsset !== undefined) {
      await this.page.getByLabel("Underlying asset").click();
      await this.page
        .getByPlaceholder("Search for an asset...")
        .fill(options.underlyingAsset);
      await this.page
        .getByRole("option", { name: options.underlyingAsset })
        .click();
    }
    if (options.price !== undefined) {
      await this.page.getByLabel("Price").fill(options.price);
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
    await this.page.getByRole("button", { name: "Asset Designer" }).click();
    await this.page.getByRole("menuitem", { name: assetType }).click();
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
    if (options.fundCategory) {
      await this.page.getByLabel("Fund category", { exact: false }).click();
      await this.page
        .getByRole("option", { name: options.fundCategory })
        .click();
    }

    if (options.fundClass) {
      await this.page.getByLabel("Fund class", { exact: false }).click();
      await this.page.getByRole("option", { name: options.fundClass }).click();
    }

    if (options.managementFeeBps) {
      await this.page
        .getByLabel("Management fee", { exact: false })
        .fill(options.managementFeeBps);
    }

    if (options.price) {
      await this.page.getByLabel("Price", { exact: false }).fill(options.price);
    }
  }

  async clearField(label: string) {
    await this.page.getByLabel(label, { exact: false }).fill("");
  }
}
