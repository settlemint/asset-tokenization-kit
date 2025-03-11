import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { BasePage } from "./base-page";

export class AdminPage extends BasePage {
  private static readonly CURRENCY_CODE_REGEX = /[A-Z]+$/;
  private static readonly COMMA_REGEX = /,/g;

  async goto() {
    await this.page.goto("/assets");
  }

  private async startAssetCreation(
    assetType: string,
    name: string,
    symbol: string
  ) {
    await this.page.getByRole("button", { name: "Asset Designer" }).click();
    await this.page.getByRole("menuitem", { name: assetType }).click();
    await this.page.getByLabel("Name").fill(name);
    await this.page.getByLabel("Symbol").fill(symbol);
  }

  private async completeAssetCreation(pincode: string, assetType: string) {
    await this.page.locator('[data-input-otp="true"]').fill(pincode);

    const buttonName = `Issue a new ${assetType?.toLowerCase()}`;
    const button = this.page.getByRole("button", { name: buttonName });

    await this.page.evaluate((buttonSelector) => {
      const button = document.querySelector(
        `button[aria-label="${buttonSelector}"]`
      );
      if (button) {
        let element = button;
        while (element.parentElement) {
          const parent = element.parentElement;
          const style = window.getComputedStyle(parent);
          if (style.overflow === "hidden" || style.overflowY === "hidden") {
            parent.style.overflow = "visible";
          }
          if (style.position === "fixed" || style.position === "absolute") {
            parent.style.position = "static";
          }
          element = parent;
        }

        (button as HTMLElement).click();
      }
    }, buttonName);
  }

  async createBond(options: {
    assetType: string;
    name: string;
    symbol: string;
    decimals: string;
    isin: string;
    maximumSupply: string;
    faceValue: string;
    underlyingAsset: string;
    pincode: string;
  }) {
    await this.startAssetCreation(
      options.assetType,
      options.name,
      options.symbol
    );
    await this.page.getByLabel("Decimals").fill(options.decimals);
    await this.page.getByLabel("ISIN").fill(options.isin);
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.page.getByLabel("Maximum supply").fill(options.maximumSupply);
    await this.page.getByLabel("Face value").fill(options.faceValue);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split("T")[0];
    await this.page.getByLabel("Maturity date").fill(formattedDate);
    await this.page.getByRole("button", { name: "Select an option" }).click();
    await this.page.getByPlaceholder("Search for an asset...").click();
    await this.page
      .getByPlaceholder("Search for an asset...")
      .fill(options.underlyingAsset);
    await this.page
      .getByRole("option", { name: `Avatar ${options.underlyingAsset}` })
      .click();
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.completeAssetCreation(options.pincode, options.assetType);
  }

  async createCryptocurrency(options: {
    assetType: string;
    name: string;
    symbol: string;
    initialSupply: string;
    pincode: string;
  }) {
    await this.startAssetCreation(
      options.assetType,
      options.name,
      options.symbol
    );
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.page.getByLabel("Initial supply").fill(options.initialSupply);
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.completeAssetCreation(options.pincode, options.assetType);
  }

  async createEquity(options: {
    assetType: string;
    name: string;
    symbol: string;
    isin: string;
    equityClass: string;
    equityCategory: string;
    pincode: string;
  }) {
    await this.startAssetCreation(
      options.assetType,
      options.name,
      options.symbol
    );
    await this.page.getByLabel("ISIN").fill(options.isin);
    await this.page.getByRole("button", { name: "Next" }).click();
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
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.completeAssetCreation(options.pincode, options.assetType);
  }

  async createFund(options: {
    assetType: string;
    name: string;
    symbol: string;
    isin: string;
    fundCategory: string;
    fundClass: string;
    managementFee: string;
    pincode: string;
  }) {
    await this.startAssetCreation(
      options.assetType,
      options.name,
      options.symbol
    );
    await this.page.getByLabel("ISIN").fill(options.isin);
    await this.page.getByRole("button", { name: "Next" }).click();
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
    await this.page.getByLabel("Management fee").fill(options.managementFee);
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.completeAssetCreation(options.pincode, options.assetType);
  }

  async createStablecoin(options: {
    assetType: string;
    name: string;
    symbol: string;
    isin: string;
    validityPeriod: string;
    pincode: string;
  }) {
    await this.startAssetCreation(
      options.assetType,
      options.name,
      options.symbol
    );
    await this.page.getByLabel("ISIN").fill(options.isin);
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.page
      .getByLabel("Collateral Proof Validity")
      .fill(options.validityPeriod);
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.completeAssetCreation(options.pincode, options.assetType);
  }

  private async getColumnIndices() {
    return {
      nameColumnIndex: await this.page
        .locator("th", { hasText: "Name" })
        .evaluate((el) => {
          return Array.from(el.parentElement?.children ?? []).indexOf(el) + 1;
        }),
      supplyColumnIndex: await this.page
        .locator("th", { hasText: "Total Supply" })
        .evaluate((el) => {
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
      console.log(`Error during search: ${error}`);
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
          const supplyText = (await supplyCell.textContent()) || "";

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
        console.error(error.message);
        throw error;
      }
      return { found: false, matchedSupply: false };
    }
  }

  async checkIfAssetExists(options: {
    name: string;
    sidebarAssetTypes: string;
    totalSupply?: string;
  }): Promise<void> {
    await this.chooseAssetTypeFromSidebar({
      sidebarAssetTypes: options.sidebarAssetTypes,
    });

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
              console.log(
                "No rows found in table, checking if we need to refresh"
              );

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

            console.log(`Asset ${options.name} not found in ${count} rows`);

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

            console.log(`Error during search: ${error}`);
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
    options: { sidebarAssetTypes: string }
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
      await this.chooseAssetTypeFromSidebar({
        sidebarAssetTypes: options.sidebarAssetTypes,
      });
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
    options: { sidebarAssetTypes: string }
  ): Promise<{
    continueSearch: boolean;
    updatedSearchAttempts: number;
    updatedRefreshCount: number;
  }> {
    const updatedSearchAttempts = searchAttempts + 1;

    if (updatedSearchAttempts < maxSearchAttempts) {
      console.error(
        `Asset not found, search attempt ${updatedSearchAttempts}/${maxSearchAttempts}...`
      );
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
      await this.chooseAssetTypeFromSidebar({
        sidebarAssetTypes: options.sidebarAssetTypes,
      });
      await this.page.waitForTimeout(2000);
    }

    return {
      continueSearch: false,
      updatedSearchAttempts: 0,
      updatedRefreshCount,
    };
  }

  async updateCollateral(options: {
    sidebarAssetTypes: string;
    name: string;
    amount: string;
    pincode: string;
  }) {
    await this.chooseAssetTypeFromSidebar({
      sidebarAssetTypes: options.sidebarAssetTypes,
    });
    await this.chooseAssetFromTable({
      name: options.name,
      sidebarAssetTypes: options.sidebarAssetTypes,
    });
    await this.page.getByRole("button", { name: "Manage" }).click();
    const updateCollateralOption = this.page.getByRole("menuitem", {
      name: "Update Collateral",
    });

    await updateCollateralOption.waitFor({ state: "visible" });
    await updateCollateralOption.click();
    await this.page.getByLabel("Amount").fill(options.amount);
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.page.locator('[data-input-otp="true"]').fill(options.pincode);
    await this.page
      .getByRole("button", { name: "Update Collateral Amount" })
      .click();
  }

  private formatAmount(amount: string): string {
    return amount
      .replace(AdminPage.CURRENCY_CODE_REGEX, "")
      .replace(AdminPage.COMMA_REGEX, "")
      .trim()
      .split(".")[0];
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

  async mintToken(options: {
    sidebarAssetTypes: string;
    name: string;
    user: string;
    amount: string;
    pincode: string;
  }) {
    await this.page.reload();
    await this.page.getByRole("button", { name: "Manage" }).click();
    const mintTokensOption = this.page.getByRole("menuitem", {
      name: "Mint",
    });
    await mintTokensOption.waitFor({ state: "visible" });
    await mintTokensOption.click();
    await this.page.getByLabel("Amount").fill(options.amount);
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.page.getByRole("button", { name: "Search for a user" }).click();
    await this.page.getByPlaceholder("Search for a user...").click();
    await this.page.getByPlaceholder("Search for a user...").fill(options.user);
    await this.page
      .getByRole("option", { name: `Avatar ${options.user}` })
      .click();
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.page.getByRole("textbox").click();
    await this.page.getByRole("textbox").fill(options.pincode);
    await this.page.getByRole("button", { name: "Mint Assets" }).click();
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

    await expect
      .poll(
        async () => {
          const text = await totalSupplyElement.textContent();
          return text ? this.formatAmount(text) : "0";
        },
        {
          message: "Waiting for total supply to be updated from 0",
          timeout: 120000,
          intervals: [1000],
        }
      )
      .not.toBe("0");

    const actualAmount = await totalSupplyElement.textContent();

    if (!actualAmount) {
      throw new Error("Could not find total supply amount");
    }

    const formattedActual = this.formatAmount(actualAmount);
    const formattedExpected = this.formatAmount(expectedAmount);

    await expect(formattedActual).toBe(formattedExpected);
  }

  async verifySuccessMessage(partialMessage: string) {
    const toastSelector =
      '[data-sonner-toast][data-type="success"][data-mounted="true"][data-visible="true"]';
    const titleSelector = `${toastSelector} [data-title]`;

    await expect
      .poll(
        async () => {
          const isToastVisible = await this.page.isVisible(toastSelector);
          if (!isToastVisible) {
            return false;
          }

          const toastTitle = await this.page
            .locator(titleSelector)
            .textContent();
          return toastTitle
            ?.toLowerCase()
            .includes(partialMessage.toLowerCase());
        },
        {
          message: `Waiting for success toast containing "${partialMessage}"`,
          timeout: 60000,
          intervals: [500, 1000, 2000],
        }
      )
      .toBe(true);
  }

  async chooseAssetTypeFromSidebar(options: { sidebarAssetTypes: string }) {
    await this.page
      .getByRole("button", { name: options.sidebarAssetTypes })
      .click();

    const viewAllLink = this.page
      .locator(
        `a[data-sidebar="menu-sub-button"][href*="/assets/${options.sidebarAssetTypes.toLowerCase()}"]`
      )
      .filter({ hasText: "View all" });

    await viewAllLink.waitFor({ state: "visible", timeout: 15000 });

    await viewAllLink.evaluate((element) => {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      return new Promise((resolve) => setTimeout(resolve, 100));
    });

    await viewAllLink.click();
    await this.page.waitForURL(`**/${options.sidebarAssetTypes.toLowerCase()}`);
    await Promise.all([
      this.page.waitForSelector("table tbody"),
      this.page.waitForSelector('[data-testid="data-table-search-input"]'),
    ]);
  }

  async chooseAssetFromTable(options: {
    name: string;
    sidebarAssetTypes: string;
  }) {
    await this.page.getByPlaceholder("Search...").fill(options.name);
    const detailsLink = this.page
      .locator("tr")
      .filter({ has: this.page.getByText(options.name, { exact: true }) })
      .getByRole("link", { name: "Details" });

    await detailsLink.click();
    await this.page.waitForURL(
      new RegExp(
        `.*/${options.sidebarAssetTypes.toLowerCase()}/0x[a-fA-F0-9]{40}`
      )
    );
  }
}
