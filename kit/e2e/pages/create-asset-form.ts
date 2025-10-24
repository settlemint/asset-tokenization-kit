import { expect } from "@playwright/test";
import {
  confirmPinCode,
  escapeForRegex,
  selectDropdownOption,
} from "../utils/form-utils";
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
    basePrice?: string;
  }) {
    if (options.name !== undefined) {
      await this.page.getByLabel("Name", { exact: false }).fill(options.name);
    }
    if (options.symbol !== undefined) {
      await this.page
        .getByLabel("Symbol", { exact: false })
        .fill(options.symbol);
    }
    if (options.decimals !== undefined) {
      await this.page
        .getByLabel("Decimals", { exact: false })
        .fill(options.decimals);
    }
    if (options.isin !== undefined) {
      await this.page.getByLabel("ISIN", { exact: false }).fill(options.isin);
    }
    if (options.basePrice !== undefined) {
      await this.page
        .getByLabel("Base price", { exact: false })
        .fill(options.basePrice);
    }
    if (options.country !== undefined) {
      await this.page.getByLabel("Country", { exact: false }).click();
      await this.page.getByRole("option", { name: options.country }).click();
    }
  }

  async configureComplianceModules() {
    await expect(
      this.page.getByRole("heading", { name: "Compliance Modules" })
    ).toBeVisible();

    await this.clickNextButton();
  }

  getMaturityDate(options: { isPast?: boolean; daysOffset?: number } = {}) {
    const { isPast = false, daysOffset = 1 } = options;
    const date = new Date();

    if (isPast) {
      date.setDate(date.getDate() - daysOffset);
    } else {
      date.setDate(date.getDate() + daysOffset);
    }

    return date.toISOString();
  }

  async selectBondMaturityDate(isoDate: string) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid ISO date received: ${isoDate}`);
    }

    const year = date.getUTCFullYear().toString();
    const month = date.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const day = date.getUTCDate().toString();

    await this.selectDateFromRadixCalendar(
      "button#maturityDate",
      year,
      month,
      day,
      "bond maturity"
    );

    await this.page
      .locator('[data-slot="popover-content"][data-state="open"]')
      .first()
      .waitFor({ state: "detached", timeout: 2000 })
      .catch(() => {});
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

  private async _selectRadioOptionAndContinue(name: RegExp) {
    const radio = this.page.getByRole("radio", { name });
    await expect(radio).toBeVisible();
    const radioId = await radio.getAttribute("id");
    if (!radioId) {
      throw new Error(`Radio button with name ${name.toString()} has no id`);
    }
    const label = this.page.locator(`label[for="${radioId}"]`);
    await expect(label).toBeVisible();
    await label.click();

    const nextButton = this.page.getByRole("button", { name: "Next" });
    await expect(nextButton).toBeEnabled();
    await nextButton.click();
  }

  async selectAssetType(assetType: string) {
    type AssetTypeKey = "stablecoin" | "deposit" | "bond" | "equity" | "fund";

    const config: Record<
      AssetTypeKey,
      { category: RegExp; card: RegExp; urlType: string }
    > = {
      stablecoin: {
        category: /Cash\s*Equivalent/i,
        card: /^Stablecoin\b/i,
        urlType: "stablecoin",
      },
      deposit: {
        category: /Cash\s*Equivalent/i,
        card: /^Deposit\b/i,
        urlType: "deposit",
      },
      bond: {
        category: /Fixed\s*Income/i,
        card: /^Bond\b/i,
        urlType: "bond",
      },
      equity: {
        category: /Flexible\s*Income/i,
        card: /^Equity\b/i,
        urlType: "equity",
      },
      fund: {
        category: /Flexible\s*Income/i,
        card: /^Fund\b/i,
        urlType: "fund",
      },
    };

    const key = assetType.toLowerCase() as AssetTypeKey;
    if (!config[key]) {
      throw new Error(
        `Asset type "${assetType}" navigation not implemented yet`
      );
    }

    await this.page.getByRole("button", { name: "Asset designer" }).click();

    await this._selectRadioOptionAndContinue(config[key].category);
    await this._selectRadioOptionAndContinue(config[key].card);
    await expect(
      this.page.getByRole("heading", { name: "General info", level: 2 })
    ).toBeVisible();
  }

  async openAssetDesigner() {
    await this.page.getByRole("button", { name: "Asset designer" }).click();
  }

  async selectAssetClass(assetClass: string) {
    const classMap: Record<string, RegExp> = {
      "Flexible Income": /Flexible\s*Income/i,
      "Fixed Income": /Fixed\s*Income/i,
      "Cash Equivalent": /Cash\s*Equivalent/i,
    };

    const classRegex = classMap[assetClass];
    if (!classRegex) {
      throw new Error(`Asset class "${assetClass}" not recognized`);
    }

    await this._selectRadioOptionAndContinue(classRegex);
  }

  async selectAssetTypeFromDialog(assetType: string) {
    const typeMap: Record<string, RegExp> = {
      Equity: /^Equity\b/i,
      Fund: /^Fund\b/i,
      Bond: /^Bond\b/i,
      Stablecoin: /^Stablecoin\b/i,
      Deposit: /^Deposit\b/i,
    };

    const typeRegex = typeMap[assetType];
    if (!typeRegex) {
      throw new Error(`Asset type "${assetType}" not recognized`);
    }

    await this._selectRadioOptionAndContinue(typeRegex);
  }

  async fillAssetDetails(options: {
    name?: string;
    symbol?: string;
    decimals?: string;
    isin?: string;
    basePrice?: string;
    country?: string;
  }) {
    await this.fillBasicFields(options);
    await this.clickNextButton();
  }

  async completeAssetCreation(
    pincode: string,
    assetType?: "stablecoin" | "deposit" | "bond" | "equity" | "fund"
  ): Promise<string> {
    await this.configureComplianceModules();
    await this.reviewAndDeploy(assetType);
    await confirmPinCode(this.page, pincode, "Confirm asset creation");

    await expect
      .poll(() => this.page.url(), { timeout: 15000 })
      .toMatch(/\/token\//);
    return this.page.url();
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
    equityClass?: string;
    equityCategory?: string;
  }) {
    if (options.equityCategory !== undefined) {
      await selectDropdownOption(this.page, {
        label: /Equity category|Category/i,
        value: options.equityCategory,
      });
    }
    if (options.equityClass !== undefined) {
      await selectDropdownOption(this.page, {
        label: /Equity class|Class/i,
        value: options.equityClass,
      });
    }

    await this.clickNextButton();
  }

  async verifyCurrencyValue(currencyValue: string) {
    await expect(
      this.page.locator('button[id="price.currency"]')
    ).toContainText(currencyValue);
  }

  async fillBondConfigurationFields(
    options: {
      maximumLimit?: string;
      maturityDate?: string;
      denominationAsset?: string;
      faceValue?: string;
    } = {}
  ) {
    if (options.maximumLimit !== undefined) {
      await this.page
        .getByLabel("Maximum limit", { exact: false })
        .fill(options.maximumLimit);
    }
    if (options.maturityDate !== undefined) {
      await this.selectBondMaturityDate(options.maturityDate);
    }
    if (options.denominationAsset !== undefined) {
      await this.selectDenominationAsset(options.denominationAsset);
    }
    if (options.faceValue !== undefined) {
      await this.page.getByLabel("Face value").fill(options.faceValue);
    }
  }

  private async selectDenominationAsset(assetName: string) {
    const normalizedName = assetName.trim();
    await this.selectFromRadixCommandPalette({
      trigger: this.page
        .getByRole("combobox", { name: /Denomination asset|Choose address/i })
        .first(),
      triggerLabelFor: "denominationAsset",
      dialog: this.page
        .locator('[data-slot="popover-content"]')
        .filter({
          has: this.page.locator(
            'input[placeholder="Search for an asset..."], input[placeholder="Search addresses"]'
          ),
        })
        .first(),
      searchInput: this.page
        .locator(
          'input[placeholder="Search for an asset..."], input[placeholder="Search addresses"]'
        )
        .first(),
      searchTerm: normalizedName,
      optionLocator: this.page
        .getByRole("option", {
          name: new RegExp(
            `^${escapeForRegex(normalizedName)}(?:\\s|\\(|$)`,
            "i"
          ),
        })
        .first(),
      expectedSelection: normalizedName,
      typingDelay: 60,
      context: `denomination asset '${normalizedName}'`,
    });
  }

  async fillFundConfigurationFields(
    options: {
      fundCategory?: string;
      fundClass?: string;
      managementFeeBps?: string;
    } = {}
  ) {
    if (options.fundCategory !== undefined) {
      await selectDropdownOption(this.page, {
        label: /Fund category|Category/i,
        value: options.fundCategory,
      });
    }
    if (options.fundClass !== undefined) {
      await selectDropdownOption(this.page, {
        label: /Fund class|Class/i,
        value: options.fundClass,
      });
    }
    if (options.managementFeeBps !== undefined) {
      await this.page
        .getByLabel("Management fee", { exact: false })
        .fill(options.managementFeeBps);
    }

    await this.clickNextButton();
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
    const nextByRole = this.page
      .getByRole("button", { name: /^Next$/i })
      .first();
    if ((await nextByRole.count()) > 0) {
      await expect(nextByRole).toBeEnabled();
      return;
    }
    const nextByData = this.page
      .locator('button[data-slot="button"]')
      .filter({ hasText: "Next" })
      .first();
    await expect(nextByData).toBeEnabled();
  }

  async clickNextButton() {
    const candidates = [
      this.page.getByRole("button", { name: /^Next$/i }).first(),
      this.page.getByRole("button", { name: /^(Next|Continue)$/i }).first(),
      this.page
        .locator('footer [data-slot="button"]')
        .filter({ hasText: /^(Next|Continue)$/i })
        .first(),
      this.page
        .locator('button[data-slot="button"]')
        .filter({ hasText: /^(Next|Continue)$/i })
        .first(),
      this.page.locator('button:has-text("Next")').first(),
    ];

    await this.page.keyboard.press("Escape").catch(() => {});
    await this.page.keyboard.press("End").catch(() => {});

    for (const btn of candidates) {
      if ((await btn.count()) === 0) continue;
      const visible = await btn.isVisible().catch(() => false);
      if (!visible) continue;
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      const enabled = await btn.isEnabled().catch(() => false);
      if (!enabled) continue;
      await btn.click();
      return;
    }

    const fallback = this.page.getByRole("button", { name: /^Next$/i }).first();
    await fallback
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {});
    if ((await fallback.count()) > 0) {
      await fallback.scrollIntoViewIfNeeded().catch(() => {});
      await fallback.click();
      return;
    }

    throw new Error("Next/Continue button not found or not clickable");
  }

  async expectComplianceStep() {
    await expect(
      this.page.getByRole("heading", { name: "Compliance Modules" })
    ).toBeVisible();
  }

  async reviewAndDeploy(
    assetType?: "stablecoin" | "deposit" | "bond" | "equity" | "fund"
  ) {
    await expect(
      this.page.getByRole("heading", { name: /Review\s*&\s*deploy/i, level: 2 })
    ).toBeVisible();

    const button = assetType
      ? this.page.getByRole("button", {
          name: new RegExp(`^Create\\s+${assetType}$`, "i"),
        })
      : this.page.getByRole("button", { name: /^Create\b/i });

    await expect(button).toBeEnabled();
    await button.click();
  }

  async verifyAssetCreated(options: {
    name: string;
    symbol: string;
    decimals: string;
  }) {
    const { name } = options;

    await this.page.waitForLoadState("networkidle");

    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nameMatcher = new RegExp(`\\b${escapedName}\\b`, "i");

    const headerContractAddress = this.page
      .getByRole("columnheader", {
        name: /^(?:Contract\s+)?Address$/i,
      })
      .first();

    let onListing = false;
    try {
      await headerContractAddress.waitFor({ state: "visible", timeout: 8000 });
      onListing = true;
    } catch {
      onListing = false;
    }

    if (onListing) {
      const listingTable = this.page
        .getByRole("table")
        .filter({ has: headerContractAddress })
        .first();
      const tableBody = listingTable.locator('[data-slot="table-body"]');
      await expect(listingTable).toBeVisible({ timeout: 15000 });

      const assetRow = tableBody
        .getByRole("row", { name: nameMatcher })
        .first();
      await expect(assetRow).toBeVisible({ timeout: 30000 });
      return;
    }

    const tokenDetailRegex = /\/token\/0x[a-fA-F0-9]{40}\/?$/;
    if (!tokenDetailRegex.test(this.page.url())) {
      await this.page.waitForURL(tokenDetailRegex, { timeout: 30000 });
    }

    await expect(this.page.getByText(nameMatcher).first()).toBeVisible({
      timeout: 30000,
    });
  }
}
