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

    const allowlistCard = this.page
      .locator('[data-slot="selectable-card"]')
      .filter({
        has: this.page
          .locator('[data-slot="selectable-card-title"]')
          .filter({ hasText: /Country\s*allowlist/i }),
      });
    await expect(allowlistCard).toHaveCount(1);
    await expect(allowlistCard).toBeVisible();
    await allowlistCard.click();

    await this.expectNextButtonEnabled();
    await this.clickNextButton();
  }

  async fillBondDetails(options: {
    decimals: string;
    maximumSupply: string;
    faceValue: string;
    maturityDate: string;
    denominationAsset?: string;
  }) {
    await this.page.getByLabel("Decimals").fill(options.decimals);
    await this.page.getByLabel("Maximum supply").fill(options.maximumSupply);
    await this.page.getByLabel("Face value").fill(options.faceValue);
    await this.page.getByLabel("Maturity date").fill(options.maturityDate);
    if (options.denominationAsset !== undefined) {
      await this.page.getByLabel("Denomination asset").click();
      await this.page
        .getByPlaceholder("Search for an asset...")
        .fill(options.denominationAsset);
      await this.page
        .getByRole("option", { name: options.denominationAsset })
        .click();
    }
  }

  async fillAssetFields(options: {
    name?: string;
    symbol?: string;
    decimals?: string;
    isin?: string;
    country?: string;
    basePrice?: string;
    assetType?: string;
    managementFee?: string;
    managementFeeBps?: string;
    pincode: string;
  }) {
    await this.fillBasicFields(options);

    const errorMessages = await this.page
      .locator('[data-slot="field-error"]')
      .allTextContents();

    const nextButton = this.page.getByRole("button", { name: "Next" });
    const isEnabled = await nextButton.isEnabled();

    await this.clickNextButton();
    const feeField = this.page.getByLabel("Management fee", { exact: false });
    const feeFieldCount = await feeField.count();
    if (feeFieldCount > 0 && (await feeField.first().isVisible())) {
      const managementFeeBps =
        options.managementFeeBps ??
        (options.managementFee !== undefined
          ? Math.round(parseFloat(options.managementFee) * 100).toString()
          : undefined);
      await this.fillFundConfigurationFields({
        managementFeeBps,
        managementFee: options.managementFee,
      });
      await this.clickNextButton();
    }
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
      managementFeeBps?: string;
      managementFee?: string;
    } = {}
  ) {
    const actions: Record<string, (value: string) => Promise<void>> = {
      managementFeeBps: async (value) => {
        await this.page
          .getByLabel("Management fee", { exact: false })
          .fill(value);
      },
      managementFee: async (value) => {
        const bps = Math.round(parseFloat(value) * 100).toString();
        await this.page
          .getByLabel("Management fee", { exact: false })
          .fill(bps);
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
    const { name, symbol, decimals } = options;

    await this.page.waitForLoadState("networkidle");
    await this.page.waitForURL(/\/token\/0x[a-fA-F0-9]{40}\/?$/, {
      timeout: 10000,
    });

    const dataTable = this.page.locator('[data-slot="table"]');
    const tableBody = dataTable.locator('[data-slot="table-body"]');
    const findRow = () =>
      tableBody.locator('[data-slot="table-row"]').filter({
        has: tableBody
          .locator('[data-slot="table-cell"]')
          .filter({ hasText: name }),
      });
    try {
      await expect(dataTable).toBeVisible({ timeout: 5000 });
    } catch {
      const factoryUrl = /\/token\/0x[a-fA-F0-9]{40}\/?$/;
      await expect(this.page).toHaveURL(factoryUrl, { timeout: 30000 });

      const pageText = await this.page.locator("body").textContent();

      const headings = await this.page
        .locator("h1, h2, h3, h4, h5, h6")
        .allTextContents();

      const tableElements = await this.page
        .locator('table, [data-slot="table"], [role="table"]')
        .count();

      const listElements = await this.page
        .locator('ul, ol, [data-slot="list"]')
        .count();

      const anyTableRows = await this.page
        .locator('[data-slot="table-row"], tr, [role="row"]')
        .count();

      const breadcrumbText = await this.page
        .locator('[data-slot="breadcrumb"], nav')
        .textContent();

      const notifications = await this.page
        .locator(
          '[data-slot="notification"], [role="alert"], .toast, .notification'
        )
        .allTextContents();

      const factoryIndicators = [
        "Create your first token to get started",
        "This factory has not created any tokens yet",
        "No tokens found",
      ];

      let factoryCreationConfirmed = false;
      for (const indicator of factoryIndicators) {
        if (pageText?.includes(indicator)) {
          factoryCreationConfirmed = true;
          break;
        }
      }

      const currentUrl = this.page.url();
      const isFactoryPage = factoryUrl.test(currentUrl);

      const hasFundsBreadcrumb =
        breadcrumbText?.includes("Funds") ||
        breadcrumbText?.includes("Flexible income");

      const hasFundHeading = headings.some(
        (h) => h.includes("Funds") || h.includes("Fund")
      );

      const hasTable = tableElements > 0 || anyTableRows > 0;

      if (
        isFactoryPage &&
        (hasFundsBreadcrumb || hasFundHeading) &&
        factoryCreationConfirmed
      ) {
        return;
      }

      if (hasTable && factoryCreationConfirmed) {
        return;
      }

      await expect(
        this.page.getByText(new RegExp(`\\b${symbol}\\b`))
      ).toBeVisible({
        timeout: 30000,
      });
      await expect(
        this.page.getByText(new RegExp(`^${decimals}$`))
      ).toBeVisible({
        timeout: 30000,
      });
      return;
    }

    await expect(dataTable).toBeVisible({ timeout: 120000 });

    await expect
      .poll(
        async () => {
          await this.page.reload();
          await this.page.waitForLoadState("networkidle");
          await expect(dataTable).toBeVisible();
          return await findRow().count();
        },
        { timeout: 120000, intervals: [1000, 2000, 5000] }
      )
      .toBeGreaterThan(0);

    const assetRow = findRow().first();
    await expect(
      assetRow.locator('[data-slot="table-cell"]').filter({ hasText: symbol })
    ).toBeVisible({ timeout: 30000 });
    await expect(
      assetRow
        .locator('[data-slot="table-cell"]')
        .filter({ hasText: new RegExp(`^${decimals}$`) })
    ).toBeVisible();
    await expect(
      assetRow.locator('[data-slot="badge"]').filter({ hasText: "Paused" })
    ).toBeVisible();
  }
}
