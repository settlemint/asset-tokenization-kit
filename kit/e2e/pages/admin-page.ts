import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { formatAmount, searchAndSelectFromDialog } from "../utils/page-utils";
import { BasePage } from "./base-page";

export class AdminPage extends BasePage {
  private static readonly CURRENCY_CODE_REGEX = /[A-Z]+$/;
  private static readonly COMMA_REGEX = /,/g;

  async goto() {
    await this.page.goto("/assets");
  }

  async createBond(options: {
    assetType: string;
    name: string;
    symbol: string;
    isin: string;
    internalId: string;
    decimals: string;
    maximumSupply: string;
    faceValue: string;
    denominationAsset: string;
    pincode: string;
  }) {
    const nextButton = this.page.getByRole("button", {
      name: "Next",
      exact: true,
    });
    await nextButton.focus();
    await nextButton.click();
    await this.page.getByLabel("Decimals").fill(options.decimals);
    await this.page.getByLabel("Maximum supply").fill(options.maximumSupply);
    await this.page.getByLabel("Face value").fill(options.faceValue);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDateTime = tomorrow.toISOString().slice(0, 16);
    await this.page.getByLabel("Maturity date").fill(formattedDateTime);
    await this.page
      .locator('[id="denominationAsset"]')
      .waitFor({ state: "visible" });
    await this.page
      .locator('button[id="denominationAsset"][data-slot="popover-trigger"]')
      .click();
    await this.page.getByPlaceholder("Search for an asset...").click();
    await this.page
      .getByPlaceholder("Search for an asset...")
      .fill(options.denominationAsset);
    await this.page
      .getByRole("option", { name: `Avatar ${options.denominationAsset}` })
      .click();
    await nextButton.click();
    await nextButton.click();
    const buttonName = `Issue ${options.assetType.toLowerCase()}`;
  }

  async createCryptocurrency(options: {
    assetType: string;
    name: string;
    symbol: string;
    isin: string;
    internalId: string;
    decimals: string;
    initialSupply: string;
    price: string;
    pincode: string;
  }) {
    const nextButton = this.page.locator(
      'button[data-slot="button"]:has-text("Next")'
    );
    await nextButton.focus();
    await nextButton.click();
    await this.page.getByLabel("Decimals").fill(options.decimals);
    await this.page.getByLabel("Initial supply").fill(options.initialSupply);
    await this.page.getByLabel("Price").fill(options.price);
    await this.page.locator("#price\\.currency").click();
    await this.page.getByRole("option", { name: "EUR" }).click();
    await nextButton.click();
    await nextButton.click();
    const buttonName = `Issue ${options.assetType.toLowerCase()}`;
  }

  async createEquity(options: {
    assetType: string;
    name: string;
    symbol: string;
    isin: string;
    internalId: string;
    decimals: string;
    price: string;
    equityClass: string;
    equityCategory: string;
    pincode: string;
  }) {
    const nextButton = this.page.locator(
      'button[data-slot="button"]:has-text("Next")'
    );
    await nextButton.focus();
    await nextButton.click();
    await this.page.getByLabel("Decimals").fill(options.decimals);
    await this.page.getByLabel("Price").fill(options.price);
    await this.page.locator("#price\\.currency").click();
    await this.page.getByRole("option", { name: "EUR" }).click();
    await this.page.getByRole("combobox", { name: "Equity class" }).click();
    await this.page
      .getByRole("option", { name: options.equityClass })
      .waitFor({ state: "visible" });
    await this.page.getByRole("option", { name: options.equityClass }).click();
    await this.page.getByRole("combobox", { name: "Equity category" }).click();
    await this.page
      .getByRole("option", { name: options.equityCategory })
      .waitFor({ state: "visible" });
    await this.page
      .getByRole("option", { name: options.equityCategory })
      .click();
    await nextButton.click();
    await nextButton.click();
    const buttonName = `Issue ${options.assetType.toLowerCase()}`;
  }

  async createFund(options: {
    assetType: string;
    name: string;
    symbol: string;
    isin: string;
    internalId: string;
    decimals: string;
    price: string;
    managementFee: string;
    fundCategory: string;
    fundClass: string;
    pincode: string;
  }) {
    const nextButton = this.page.locator(
      'button[data-slot="button"]:has-text("Next")'
    );
    await nextButton.focus();
    await nextButton.click();
    await this.page.getByLabel("Decimals").fill(options.decimals);
    await this.page.getByLabel("Price").fill(options.price);
    await this.page.locator("#price\\.currency").click();
    await this.page.getByRole("option", { name: "EUR" }).click();
    await this.page.getByLabel("Management fee").fill(options.managementFee);
    await this.page.getByRole("combobox", { name: "Fund category" }).click();
    await this.page
      .getByRole("option", { name: options.fundCategory })
      .waitFor({ state: "visible" });
    await this.page.getByRole("option", { name: options.fundCategory }).click();
    await this.page.getByRole("combobox", { name: "Fund class" }).click();
    await this.page
      .getByRole("option", { name: options.fundClass })
      .waitFor({ state: "visible" });
    await this.page.getByRole("option", { name: options.fundClass }).click();
    await nextButton.click();
    await nextButton.click();
    const buttonName = `Issue ${options.assetType.toLowerCase()}`;
  }

  async createDeposit(options: {
    assetType: string;
    name: string;
    symbol: string;
    isin: string;
    internalId: string;
    decimals: string;
    price: string;
    validityPeriod: string;
    pincode: string;
  }) {
    const nextButton = this.page.locator(
      'button[data-slot="button"]:has-text("Next")'
    );
    await nextButton.focus();
    await nextButton.click();
    await this.page.getByLabel("Decimals").fill(options.decimals);
    await this.page.getByLabel("Price").fill(options.price);
    await this.page.locator("#price\\.currency").click();
    await this.page.getByRole("option", { name: "EUR" }).click();
    await this.page
      .getByLabel("Collateral Proof Validity")
      .fill(options.validityPeriod);
    await nextButton.click();
    await nextButton.click();
    const buttonName = `Issue ${options.assetType.toLowerCase()}`;
  }

  private async getColumnIndices() {
    const nameColumn = this.page.locator("th", { hasText: "Name" });

    let supplyColumn = this.page.locator("th", { hasText: "Total Supply" });

    if ((await supplyColumn.count()) === 0) {
      supplyColumn = this.page.locator("th", { hasText: "Balance" });
    }

    await nameColumn.waitFor({ state: "visible", timeout: 40000 });
    await supplyColumn.waitFor({ state: "visible", timeout: 40000 });

    return {
      nameColumnIndex: await nameColumn.evaluate((el: HTMLElement) => {
        return Array.from(el.parentElement?.children ?? []).indexOf(el) + 1;
      }),
      supplyColumnIndex: await supplyColumn.evaluate((el: HTMLElement) => {
        return Array.from(el.parentElement?.children ?? []).indexOf(el) + 1;
      }),
    };
  }

  private async searchForAsset(
    searchInput: Locator,
    assetName: string
  ): Promise<boolean> {
    try {
      await searchInput.click();
      await searchInput.clear();
      await this.page.waitForTimeout(300);
      await searchInput.fill(assetName);
      await searchInput.press("Enter");
      await this.page.waitForTimeout(500);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkAssetInRow(
    row: Locator,
    assetName: string,
    columnIndices: { nameColumnIndex: number; supplyColumnIndex: number },
    expectedTotalSupply?: string
  ): Promise<{
    found: boolean;
    matchedSupply: boolean;
    actualSupply?: string;
  }> {
    try {
      const nameCell = row.locator(
        `td:nth-child(${columnIndices.nameColumnIndex})`
      );
      await nameCell.waitFor({ state: "visible", timeout: 10000 });

      const nameFlex = nameCell.locator(".flex");
      const isFlexVisible = await nameFlex.isVisible();

      const textToCheck = isFlexVisible
        ? await nameFlex.textContent()
        : await nameCell.textContent();

      if (textToCheck && textToCheck.trim() === assetName) {
        if (expectedTotalSupply) {
          const supplyCell = row.locator(
            `td:nth-child(${columnIndices.supplyColumnIndex})`
          );
          const supplyText = (await supplyCell.textContent()) ?? "";

          if (supplyText.includes("NaN") || supplyText.trim() === "NaN") {
            throw new Error(
              `VALIDATION_ERROR: Found asset ${assetName} but total supply is NaN in the table`
            );
          }
          if (!supplyText.trim()) {
            throw new Error(
              `VALIDATION_ERROR: Found asset ${assetName} but total supply is missing`
            );
          }

          const formattedSupply = this.formatAmount(supplyText);
          const formattedExpected = this.formatAmount(expectedTotalSupply);
          if (
            formattedSupply === "NaN" ||
            formattedSupply === "undefined" ||
            !formattedSupply.match(/^[\d.]+$/)
          ) {
            throw new Error(
              `VALIDATION_ERROR: Found asset ${assetName} but total supply value is invalid: "${supplyText}"`
            );
          }

          if (formattedSupply !== formattedExpected) {
            throw new Error(
              `VALIDATION_ERROR: Found asset ${assetName} but total supply value is incorrect. Expected: ${formattedExpected}, Actual: ${formattedSupply}`
            );
          }

          return {
            found: true,
            matchedSupply: true,
            actualSupply: formattedSupply,
          };
        }

        return { found: true, matchedSupply: true };
      }

      return { found: false, matchedSupply: false };
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("VALIDATION_ERROR") ||
          error.message.includes("but total supply"))
      ) {
        throw error;
      }
      return { found: false, matchedSupply: false };
    }
  }

  async checkIfAssetExists(options: {
    name: string;
    sidebarAssetTypes?: string;
    totalSupply?: string;
  }): Promise<void> {
    if (options.sidebarAssetTypes) {
      await this.chooseAssetTypeFromSidebar({
        sidebarAssetTypes: options.sidebarAssetTypes,
      });
    }

    await this.filterAssetByName({
      name: options.name,
      sidebarAssetTypes: options.sidebarAssetTypes,
      totalSupply: options.totalSupply,
    });
  }

  async filterAssetByName(options: {
    name: string;
    sidebarAssetTypes?: string;
    totalSupply?: string;
  }) {
    await this.page.getByRole("button", { name: "Filter" }).click();
    await this.page.getByRole("option", { name: "Name" }).click();
    await this.page.getByRole("button", { name: "Contains" }).click();
    const searchInput = this.page.getByPlaceholder("Search...");
    let currentSearchAttempts = 0;
    const maxSearchAttempts = 3;
    let currentRefreshCount = 0;
    const maxRefreshes = 5;

    const columnIndices = await this.getColumnIndices();

    await expect
      .poll(
        async () => {
          try {
            const searchSuccessful = await this.searchForAsset(
              searchInput,
              options.name
            );
            if (!searchSuccessful) {
              return false;
            }

            const rows = this.page.locator("tbody tr");
            const count = await rows.count();

            if (count === 0) {
              const result = await this.handleNoRows(
                currentSearchAttempts,
                maxSearchAttempts,
                currentRefreshCount,
                maxRefreshes,
                { sidebarAssetTypes: options.sidebarAssetTypes }
              );

              currentSearchAttempts = result.updatedSearchAttempts;
              currentRefreshCount = result.updatedRefreshCount;

              return false;
            }

            for (let i = 0; i < count; i++) {
              const row = rows.nth(i);
              const result = await this.checkAssetInRow(
                row,
                options.name,
                columnIndices,
                options.totalSupply
              );

              if (result.found) {
                return true;
              }
            }

            const result = await this.handleAssetNotFound(
              currentSearchAttempts,
              maxSearchAttempts,
              currentRefreshCount,
              maxRefreshes,
              { sidebarAssetTypes: options.sidebarAssetTypes }
            );

            currentSearchAttempts = result.updatedSearchAttempts;
            currentRefreshCount = result.updatedRefreshCount;

            return false;
          } catch (error) {
            if (
              error instanceof Error &&
              (error.message.includes("VALIDATION_ERROR") ||
                error.message.includes("but total supply"))
            ) {
              throw error;
            }
            return false;
          }
        },
        {
          message: `Waiting for asset ${options.name} to appear in the table with${options.totalSupply ? ` total supply ${options.totalSupply}` : ""}`,
          timeout: 180000,
          intervals: [3000],
        }
      )
      .toBe(true);
  }

  private async handleNoRows(
    searchAttempts: number,
    maxSearchAttempts: number,
    refreshCount: number,
    maxRefreshes: number,
    options: { sidebarAssetTypes?: string }
  ): Promise<{
    continueSearch: boolean;
    updatedSearchAttempts: number;
    updatedRefreshCount: number;
  }> {
    const updatedSearchAttempts = searchAttempts + 1;

    if (updatedSearchAttempts < maxSearchAttempts) {
      await this.page.waitForTimeout(1000);
      return {
        continueSearch: false,
        updatedSearchAttempts,
        updatedRefreshCount: refreshCount,
      };
    }

    await this.page
      .locator("body")
      .click({ position: { x: 1, y: 1 }, force: true });

    let updatedRefreshCount = refreshCount;
    if (refreshCount < maxRefreshes) {
      updatedRefreshCount = refreshCount + 1;
      await this.page.reload();
      if (options.sidebarAssetTypes) {
        await this.chooseAssetTypeFromSidebar({
          sidebarAssetTypes: options.sidebarAssetTypes,
        });
      }
      await this.page.waitForTimeout(2000);
    }

    return {
      continueSearch: false,
      updatedSearchAttempts: 0,
      updatedRefreshCount,
    };
  }

  private async handleAssetNotFound(
    searchAttempts: number,
    maxSearchAttempts: number,
    refreshCount: number,
    maxRefreshes: number,
    options: { sidebarAssetTypes?: string }
  ): Promise<{
    continueSearch: boolean;
    updatedSearchAttempts: number;
    updatedRefreshCount: number;
  }> {
    const updatedSearchAttempts = searchAttempts + 1;

    if (updatedSearchAttempts < maxSearchAttempts) {
      await this.page.waitForTimeout(1000);
      return {
        continueSearch: false,
        updatedSearchAttempts,
        updatedRefreshCount: refreshCount,
      };
    }

    let updatedRefreshCount = refreshCount;
    if (refreshCount < maxRefreshes) {
      updatedRefreshCount = refreshCount + 1;
      await this.page.reload();
      if (options.sidebarAssetTypes) {
        await this.chooseAssetTypeFromSidebar({
          sidebarAssetTypes: options.sidebarAssetTypes,
        });
      }
      await this.page.waitForTimeout(2000);
    }

    return {
      continueSearch: false,
      updatedSearchAttempts: 0,
      updatedRefreshCount,
    };
  }

  async updateCollateral(options: { amount: string; pincode: string }) {
    await this.page
      .getByRole("button", { name: "Manage", exact: true })
      .click();
    const updateCollateralOption = this.page.getByRole("menuitem", {
      name: "Update Collateral",
    });

    await updateCollateralOption.waitFor({ state: "visible" });
    await updateCollateralOption.click();
    await this.page.locator("#amount").fill(options.amount);
    const nextButton = this.page.locator(
      'button[data-slot="button"]:has-text("Next")'
    );
    await nextButton.focus();
    await nextButton.click();
    const updateButton = this.page.locator(
      'button[data-slot="button"][aria-label="Update collateral"]'
    );
    await updateButton.waitFor({ state: "attached" });
    await updateButton.scrollIntoViewIfNeeded();
    await updateButton.click();

    await this.page.getByRole("dialog").waitFor({ state: "visible" });
    await this.page.locator('[data-input-otp="true"]').fill(options.pincode);
    await this.page.getByRole("button", { name: "Yes, confirm" }).click();
  }

  private formatAmount(amount: string): string {
    return formatAmount(
      amount,
      AdminPage.CURRENCY_CODE_REGEX,
      AdminPage.COMMA_REGEX
    );
  }

  async verifyCollateral(expectedAmount: string) {
    await this.page.reload();
    const collateralElement = this.page
      .locator("div.space-y-1")
      .filter({
        has: this.page.locator(
          "span.font-medium.text-muted-foreground.text-sm",
          {
            hasText: "Proven collateral",
          }
        ),
      })
      .locator("div.text-md");

    await expect(collateralElement).toBeVisible();
    await this.page
      .locator("body")
      .click({ position: { x: 1, y: 1 }, force: true });
    await expect
      .poll(
        async () => {
          const text = await collateralElement.textContent();
          return text ? this.formatAmount(text) : "0";
        },
        {
          message: "Waiting for proven collateral to be updated from 0",
          timeout: 120000,
          intervals: [1000],
        }
      )
      .not.toBe("0");

    const actualAmount = await collateralElement.textContent();

    if (!actualAmount) {
      throw new Error("Could not find proven collateral amount");
    }

    const formattedActual = this.formatAmount(actualAmount);
    const formattedExpected = this.formatAmount(expectedAmount);

    await expect(formattedActual).toBe(formattedExpected);
  }

  async mintAsset(options: { user: string; amount: string; pincode: string }) {
    await this.page.reload();
    await this.page
      .getByRole("button", { name: "Manage", exact: true })
      .click();
    const mintTokensOption = this.page.getByRole("menuitem", {
      name: "Mint",
    });
    await mintTokensOption.waitFor({ state: "visible" });
    await mintTokensOption.click();
    await this.page.locator("#amount").fill(options.amount);
    const nextButton = this.page.locator(
      'button[data-slot="button"]:has-text("Next")'
    );
    await nextButton.focus();
    await nextButton.click();
    await this.page
      .getByRole("button", { name: "Enter an address, name or email" })
      .click();
    await this.page.waitForSelector('[role="dialog"][data-state="open"]');
    const searchInput = this.page.locator(
      '[role="dialog"][data-state="open"] input'
    );
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill(options.user);
    await this.page
      .locator(`[role="option"]`)
      .filter({ hasText: options.user })
      .first()
      .click();
    await nextButton.click();
  }

  async topUpAsset(options: {
    sidebarAssetTypes: string;
    name: string;
    amount: string;
    pincode: string;
  }) {
    await this.page.reload();
    await this.page
      .getByRole("button", { name: "Manage", exact: true })
      .click();
    const mintTokensOption = this.page.getByRole("menuitem", {
      name: "Top up",
    });
    await mintTokensOption.waitFor({ state: "visible" });
    await mintTokensOption.click();
    await this.page.locator("#amount").fill(options.amount);
    const nextButton = this.page.locator(
      'button[data-slot="button"]:has-text("Next")'
    );
    await nextButton.focus();
    await nextButton.click();
  }

  async redeemBurnAsset(options: { amount: string; pincode: string }) {
    await this.page
      .locator('button[data-slot="sheet-trigger"]')
      .filter({ hasText: "Burn" })
      .click();
    await this.page.locator("#amount").fill(options.amount);
    const nextButton = this.page.locator(
      'button[data-slot="button"]:has-text("Next")'
    );
    await nextButton.focus();
    await nextButton.click();
  }

  async verifyTotalSupply(expectedAmount: string) {
    const totalSupplyElement = this.page
      .locator("div.space-y-1")
      .filter({
        has: this.page.locator(
          "span.font-medium.text-muted-foreground.text-sm",
          {
            hasText: "Total supply",
          }
        ),
      })
      .locator("div.text-md");

    await expect(totalSupplyElement).toBeVisible();
    await this.page
      .locator("body")
      .click({ position: { x: 1, y: 1 }, force: true });

    const formattedExpected = this.formatAmount(expectedAmount);
    let initialValue: string;

    await expect
      .poll(
        async () => {
          const text = await totalSupplyElement.textContent();
          const currentValue = text ? this.formatAmount(text) : "";
          if (!initialValue) {
            initialValue = currentValue;
            return currentValue !== "" && currentValue === formattedExpected;
          }
          return (
            currentValue !== initialValue && currentValue === formattedExpected
          );
        },
        {
          message: `Waiting for total supply to update from initial value to ${formattedExpected}`,
          timeout: 120000,
          intervals: [1000],
        }
      )
      .toBe(true);

    const actualAmount = await totalSupplyElement.textContent();

    if (!actualAmount) {
      throw new Error("Could not find total supply amount");
    }

    const formattedActual = this.formatAmount(actualAmount);
    await expect(formattedActual).toBe(formattedExpected);
  }

  async allowUser(options: {
    walletAddress: string;
    user: string;
    pincode: string;
  }): Promise<void> {
    await this.page.reload();
    await this.page
      .getByRole("button", { name: "Manage", exact: true })
      .click();
    const allowUserOption = this.page.getByRole("menuitem", {
      name: "Allow user",
      exact: true,
    });
    await allowUserOption.waitFor({ state: "visible" });
    await allowUserOption.click();

    await searchAndSelectFromDialog(
      this.page,
      options.walletAddress,
      options.user
    );
    const nextButton = this.page.locator(
      'button[data-slot="button"]:has-text("Next")'
    );
    await nextButton.focus();
    await nextButton.click();
  }

  async verifySuccessMessage(partialMessage: string) {
    const toastSelector =
      '[data-sonner-toast][data-type="success"][data-mounted="true"][data-visible="true"]';

    await expect
      .poll(
        async () => {
          const toasts = await this.page.locator(toastSelector).all();
          if (toasts.length === 0) {
            return false;
          }

          for (const toast of toasts) {
            const title = await toast.locator("[data-title]").textContent();
            if (title?.toLowerCase().includes(partialMessage.toLowerCase())) {
              return true;
            }
          }
          return false;
        },
        {
          message: `Waiting for success toast containing "${partialMessage}"`,
          timeout: 180000,
          intervals: [1000, 2000, 3000],
        }
      )
      .toBe(true);
  }

  private getSingularForm(type: string): string {
    const pluralToSingular: Record<string, string> = {
      Cryptocurrencies: "cryptocurrency",
      Stablecoins: "stablecoin",
      Bonds: "bond",
      Equities: "equity",
      Funds: "fund",
      Deposits: "deposit",
    };
    return pluralToSingular[type] || type.toLowerCase();
  }

  private async isSidebarMenuExpanded(menuName: string): Promise<boolean> {
    const menuButton = this.page
      .locator("button[data-sidebar='menu-button']")
      .filter({ hasText: menuName });

    const exists = (await menuButton.count()) > 0;
    if (!exists) {
      return false;
    }

    const isExpanded =
      (await menuButton.getAttribute("aria-expanded")) === "true";
    const state = await menuButton.getAttribute("data-state");

    return isExpanded && state === "open";
  }

  async chooseAssetTypeFromSidebar(options: { sidebarAssetTypes: string }) {
    const isExpanded = await this.isSidebarMenuExpanded(
      options.sidebarAssetTypes
    );

    const assetTypeButton = this.page.getByRole("button", {
      name: options.sidebarAssetTypes,
    });

    if (!isExpanded) {
      await assetTypeButton.click();
    }

    const singularForm = this.getSingularForm(options.sidebarAssetTypes);

    const viewAllLink = this.page
      .locator(
        `a[data-sidebar="menu-sub-button"][href*="/assets/${singularForm}"]`
      )
      .filter({ hasText: "View all" });

    await viewAllLink.waitFor({ state: "visible", timeout: 15000 });

    await viewAllLink.evaluate((element: HTMLElement) => {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      return new Promise((resolve) => setTimeout(resolve, 100));
    });

    await viewAllLink.click();
    await this.page.waitForURL(`**/${singularForm}`);
    await Promise.all([
      this.page.waitForSelector("table tbody"),
      this.page.getByRole("button", { name: "Filter" }),
    ]);
  }

  async selectFooterDropdownOption(optionText: string) {
    const menuTrigger = this.page.locator(
      '[data-slot="dropdown-menu-trigger"]'
    );
    await menuTrigger.click();
    await this.page
      .locator('[role="menu"][data-state="open"]')
      .waitFor({ state: "visible" });
    const menu = this.page.locator('[role="menu"][data-state="open"]');
    await menu.waitFor({ state: "visible" });

    const option = this.page
      .locator('div[role="menuitemradio"]')
      .filter({ hasText: optionText });
    await option.waitFor({ state: "visible" });

    const isSelected = (await option.getAttribute("aria-checked")) === "true";
    if (!isSelected) {
      await option.click();

      await option.waitFor({ state: "visible" });
      await expect(option).toContainText(optionText);
    }
  }

  async chooseAssetFromTable(options: {
    name: string;
    sidebarAssetTypes: string;
  }) {
    const detailsLink = this.page
      .locator("tr")
      .filter({ has: this.page.getByText(options.name, { exact: true }) })
      .getByRole("link", { name: "Details" });

    await detailsLink.click();
    const singularForm = this.getSingularForm(options.sidebarAssetTypes);
    await this.page.waitForURL(
      new RegExp(`.*\\/assets\\/${singularForm}\\/0x[a-fA-F0-9]{40}`)
    );
  }

  async clickAssetDetails(assetName: string): Promise<void> {
    const rows = this.page.locator("tbody tr");
    const rowCount = await rows.count();

    let assetFound = false;
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const nameCell = row.locator("td").nth(1);
      const nameText = await nameCell.textContent();

      if (nameText?.trim() === assetName) {
        const detailsLink = row.getByRole("link", { name: "Details" });
        await detailsLink.click();
        assetFound = true;
        break;
      }
    }

    if (!assetFound) {
      throw new Error(
        `Asset with name "${assetName}" not found in the current table view`
      );
    }

    await this.page.waitForURL(/.*\/assets\/.*\/0x[a-fA-F0-9]{40}/);
  }

  public getTableBodyLocator(): Locator {
    return this.page.locator("table tbody");
  }

  public getFilterButtonLocator(): Locator {
    return this.page.getByRole("button", { name: "Filter" });
  }

  async chooseSidebarMenuOption(options: {
    sidebarOption: string;
    expectedUrlPattern?: string | RegExp;
    expectedLocatorsToWaitFor?: Locator[];
  }): Promise<void> {
    const linkLocator = this.page
      .locator(
        'a[data-sidebar="menu-button"], a[data-sidebar="menu-sub-button"]'
      )
      .filter({ hasText: options.sidebarOption })
      .first();

    await expect(linkLocator).toBeVisible();
    await linkLocator.click();

    if (options.expectedUrlPattern) {
      await this.page.waitForURL(options.expectedUrlPattern);
    }
    if (options.expectedLocatorsToWaitFor) {
      for (const locator of options.expectedLocatorsToWaitFor) {
        await locator.waitFor({ state: "visible" });
      }
    }
  }
}
