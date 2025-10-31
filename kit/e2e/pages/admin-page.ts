import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { confirmPinCode, selectDropdownOption } from "../utils/form-utils";
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

  async mintAsset(options: {
    assetName: string;
    userName: string;
    amount: string;
    pincode: string;
  }) {
    const manageButton = this.page
      .getByRole("button", { name: /Manage(?: Asset)?/, exact: false })
      .first();
    await expect(manageButton).toBeVisible({ timeout: 15000 });
    await manageButton.click();

    const mintTokensOption = this.page.getByRole("menuitem", {
      name: "Mint",
    });
    await mintTokensOption.waitFor({ state: "visible" });
    await mintTokensOption.click();

    const dialog = this.page.getByRole("dialog", {
      name: "Mint tokens",
    });
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await this.waitForReactStateSettle();
    const commandPaletteDialog = this.page
      .getByRole("dialog")
      .filter({ has: this.page.getByPlaceholder("Search addresses") })
      .first();
    const searchTerm = options.userName.split(/\s+/)[0] ?? options.userName;
    const userTrigger = dialog.getByRole("combobox").first();

    await this.selectFromRadixCommandPalette({
      trigger: userTrigger,
      dialog: commandPaletteDialog,
      searchInput: this.page.getByPlaceholder("Search addresses"),
      searchTerm,
      optionLocator: commandPaletteDialog
        .getByRole("option", {
          name: new RegExp(
            `^${options.userName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s+.*)?$`,
            "i"
          ),
        })
        .first(),
      expectedSelection: options.userName,
      context: `mint tokens to '${options.userName}'`,
      typingDelay: 60,
    });

    await expect(userTrigger).toContainText(options.userName, {
      timeout: 10000,
    });

    const amountInput = dialog
      .getByRole("textbox", { name: "Amount *" })
      .first();
    await expect(amountInput).toBeVisible({ timeout: 10000 });
    await amountInput.fill(options.amount);

    const continueButton = this.page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeEnabled({ timeout: 10000 });
    await continueButton.click();

    const confirmButton = this.page.getByRole("button", {
      name: "Confirm mint",
    });
    await expect(confirmButton).toBeVisible({ timeout: 10000 });
    await confirmButton.click();

    await confirmPinCode(this.page, options.pincode, "Mint tokens");
  }

  async ensureIdentityRegisteredForUser(options: {
    email: string;
    country: string;
    pincode: string;
  }): Promise<void> {
    await this.chooseSidebarMenuOption({
      sidebarOption: "Users",
      expectedUrlPattern: /\/participants\/users/,
      expectedLocatorsToWaitFor: [this.getTableBodyLocator()],
    });
    await this.waitForReactStateSettle();

    const pendingUserRow = this.page
      .locator("tr")
      .filter({ has: this.page.getByText(options.email, { exact: true }) })
      .filter({ has: this.page.getByText(/Pending registration/i) })
      .first();

    if ((await pendingUserRow.count()) === 0) {
      return;
    }

    await expect(pendingUserRow).toBeVisible({ timeout: 20000 });

    const identityAddressCell = pendingUserRow.locator("td").nth(3);
    const identityLink = identityAddressCell
      .locator('a[href*="/participants/entities/"]')
      .first();
    await expect(identityLink).toBeVisible({ timeout: 15000 });
    await identityLink.click();
    await this.page.waitForURL(
      /\/participants\/entities\/0x[a-fA-F0-9]{40}(?:\?.*)?$/,
      { timeout: 20000 }
    );
    await this.waitForReactStateSettle();

    const pendingStatusBadge = this.page
      .getByText(/Pending registration/i)
      .first();
    const isPendingRegistration = await pendingStatusBadge
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!isPendingRegistration) {
      return;
    }

    const manageButton = this.page
      .getByRole("button", { name: /^Manage$/i })
      .first();
    await manageButton.click();

    const registerMenuItem = this.page.getByRole("menuitem", {
      name: "Register identity",
    });
    await registerMenuItem.waitFor({ state: "visible", timeout: 10000 });
    await registerMenuItem.click();

    await selectDropdownOption(this.page, {
      label: "Country *",
      value: options.country,
    });

    await this.page.getByRole("button", { name: "Continue" }).click();
    await this.page.getByRole("button", { name: "Register identity" }).click();
    await confirmPinCode(this.page, options.pincode, "Register identity");
    await this.verifySuccessMessage("Identity registered successfully");

    await expect(
      this.page.getByText("Registered", { exact: true })
    ).toBeVisible({ timeout: 15000 });
  }

  async unpauseAsset(options: { pincode: string }): Promise<void> {
    await this.page.reload();

    const manageBtn = this.page.getByRole("button", { name: "Manage Asset" });
    await manageBtn.click();

    const unpauseOption = this.page.getByRole("menuitem", {
      name: "Unpause Token",
    });
    await expect(unpauseOption).toBeVisible({ timeout: 15000 });
    await unpauseOption.click();

    await this.page.waitForSelector(
      "button[data-slot='button']:has-text('Unpause Token')",
      { timeout: 15000 }
    );
    await this.page.getByRole("button", { name: "Unpause Token" }).click();
    await confirmPinCode(this.page, options.pincode, "Unpause Token Transfers");

    const activeBadge = this.page
      .locator('[data-slot="badge"]')
      .filter({ hasText: /^Active$/ });
    await expect(activeBadge).toBeVisible();
  }

  async grantAssetPermissions(options: {
    walletAddress?: string;
    user: string;
    permissions: string[];
    pincode: string;
    assetName?: string;
  }): Promise<void> {
    await expect(this.page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 10000,
    });
    if (options.assetName) {
      await expect
        .poll(
          () =>
            this.page
              .getByRole("heading", { level: 1 })
              .filter({ hasText: options.assetName })
              .isVisible(),
          { timeout: 30000 }
        )
        .toBe(true);
    }

    await this.page.waitForLoadState("networkidle");
    const permissionsTab = this.page.getByRole("link", { name: "Permissions" });

    await this.page.waitForLoadState("networkidle");
    await expect
      .poll(() => permissionsTab.isVisible(), { timeout: 30000 })
      .toBe(true);

    await permissionsTab.click();
    await this.page.waitForSelector("table tbody tr", { timeout: 10000 });

    const changeRolesBtn = this.page.getByRole("button", {
      name: "Add admin",
    });
    await expect
      .poll(() => changeRolesBtn.isVisible(), { timeout: 30000 })
      .toBe(true);
    await changeRolesBtn.click();

    const dialog = this.page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const searchTerm = options.user.split(/\s+/)[0] ?? options.user;
    const userCombobox = dialog.getByRole("combobox").first();
    await expect(userCombobox).toBeVisible({ timeout: 10000 });
    await userCombobox.click();

    const userInput = userCombobox.locator("input").first();
    if ((await userInput.count()) > 0) {
      await userInput.fill("");
      await userInput.type(searchTerm, { delay: 140 });
    } else {
      await this.page.keyboard.type(searchTerm, { delay: 140 });
    }

    await this.page
      .getByRole("option")
      .first()
      .waitFor({ state: "visible", timeout: 5000 })
      .catch(async () => {
        await this.page.waitForTimeout(300);
      });
    const userOption = this.page.getByRole("option", { name: options.user });
    await userOption.waitFor({ state: "visible", timeout: 15000 });
    await userOption.click();
    await this.waitForReactStateSettle();

    const roleButtons = this.page.locator(
      "button[data-slot='tooltip-trigger']"
    );
    for (const permission of options.permissions) {
      const btn = roleButtons.filter({ hasText: permission }).first();
      await expect(btn).toBeVisible({ timeout: 5000 });
      const isSelected =
        (await btn.locator("svg.lucide-square-check-big").count()) > 0;
      if (!isSelected) {
        await btn.click();
      }
    }

    await this.page.getByRole("button", { name: "Continue" }).click();

    await this.page.getByRole("button", { name: /Save|Confirm/i }).click();

    await confirmPinCode(this.page, options.pincode, "Change roles");

    await this.page.waitForSelector("table tbody tr", { timeout: 15000 });

    const row = this.page
      .locator("tr")
      .filter({ has: this.page.getByText(options.user, { exact: true }) });
    await expect(row).toBeVisible();

    const rolesCell = row.locator("td").nth(1);
    const roleBadges = rolesCell.locator('[data-slot="badge"]');

    for (const permission of options.permissions) {
      await expect(
        roleBadges.filter({ hasText: permission }).first()
      ).toBeVisible();
    }
  }

  async transferAsset(options: {
    recipient: string;
    amount: string;
    pincode: string;
  }) {
    await this.page
      .getByRole("button", { name: "Manage Asset", exact: true })
      .click();
    const mintTokensOption = this.page.getByRole("menuitem", {
      name: "Transfer Tokens",
    });
    await mintTokensOption.waitFor({ state: "visible" });
    await mintTokensOption.click();
    const dialog = this.page.getByRole("dialog", {
      name: "Transfer Tokens",
    });
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await this.waitForReactStateSettle();
    const commandPaletteDialog = this.page
      .getByRole("dialog")
      .filter({ has: this.page.getByPlaceholder("Search addresses") })
      .first();
    const searchTerm = options.recipient.split(/\s+/)[0] ?? options.recipient;
    const userTrigger = dialog.getByRole("combobox").first();

    await this.selectFromRadixCommandPalette({
      trigger: userTrigger,
      dialog: commandPaletteDialog,
      searchInput: this.page.getByPlaceholder("Search addresses"),
      searchTerm,
      optionLocator: commandPaletteDialog
        .getByRole("option", {
          name: new RegExp(
            `^${options.recipient.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s+.*)?$`,
            "i"
          ),
        })
        .first(),
      expectedSelection: options.recipient,
      context: `transfer tokens to '${options.recipient}'`,
      typingDelay: 60,
    });

    await expect(userTrigger).toContainText(options.recipient, {
      timeout: 10000,
    });

    const amountInput = dialog
      .getByRole("textbox", { name: "Amount *" })
      .first();
    await expect(amountInput).toBeVisible({ timeout: 10000 });
    await amountInput.fill(options.amount);

    const continueButton = this.page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeEnabled({ timeout: 10000 });
    await continueButton.click();
    const confirmButton = this.page.getByRole("button", {
      name: "Confirm Transfer",
    });
    await expect(confirmButton).toBeVisible({ timeout: 10000 });
    await confirmButton.click();
    await confirmPinCode(this.page, options.pincode, "Transfer Tokens");
  }

  async expectCurrentAvailableBalance(options: {
    expectedAmount: string;
  }): Promise<void> {
    await this.page
      .getByRole("button", { name: "Manage", exact: true })
      .click();

    const transferOption = this.page.getByRole("menuitem", {
      name: "Transfer",
    });
    await transferOption.waitFor({ state: "visible", timeout: 15000 });
    await transferOption.click();

    const currentAvailableLabel = this.page
      .getByText("Current Available")
      .first();
    await expect(currentAvailableLabel).toBeVisible({ timeout: 15000 });

    const currentAvailableValue = currentAvailableLabel.locator(
      "xpath=../following-sibling::*[1]"
    );
    await expect(currentAvailableValue).toBeVisible({ timeout: 15000 });

    const valueText = (await currentAvailableValue.textContent()) ?? "";
    if (!valueText) {
      throw new Error("Current Available amount text is empty");
    }

    const numericValue = valueText.replace(/[^0-9.]/g, "");
    if (numericValue !== options.expectedAmount) {
      throw new Error(
        `Expected Current Available to be ${options.expectedAmount} but got "${valueText}"`
      );
    }

    await this.page.getByRole("button", { name: "Cancel" }).click();
  }

  async signOut(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    const userButton = this.page
      .locator("button")
      .filter({ hasText: /@.*\.com/ })
      .first();

    await expect(userButton).toBeVisible({ timeout: 5000 });
    await userButton.click();

    const logoutMenuItem = this.page.getByRole("menuitem", {
      name: "Log out",
    });
    await expect(logoutMenuItem).toBeVisible({ timeout: 3000 });
    await logoutMenuItem.click();
  }

  async expectSignOutSuccess(): Promise<void> {
    await this.page.waitForURL(/auth\/sign-in/, { timeout: 10000 });
    await expect(this.page.getByRole("button", { name: "Login" })).toBeVisible({
      timeout: 5000,
    });
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
    const assetDetailsTab = this.page.getByRole("link", {
      name: "Asset Details",
    });
    await expect(assetDetailsTab).toBeVisible({ timeout: 15000 });
    await assetDetailsTab.click();
    await this.waitForReactStateSettle();

    const totalSupplyLabel = this.page.getByText("Total Supply", {
      exact: true,
    });
    const totalSupplyContainer = totalSupplyLabel.locator(
      "xpath=ancestor::div[contains(@class,'space-y-1')]"
    );
    const totalSupplyElement = totalSupplyContainer
      .locator("div.truncate.text-base")
      .first();

    await expect(totalSupplyElement).toBeVisible({ timeout: 15000 });
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
    const groupMap: Record<string, string> = {
      Equities: "Flexible Income",
      Funds: "Flexible Income",
      Bonds: "Fixed Income",
      Stablecoins: "Cash Equivalent",
      Deposits: "Cash Equivalent",
    };
    const groupName =
      groupMap[options.sidebarAssetTypes] ?? options.sidebarAssetTypes;

    const isExpanded = await this.isSidebarMenuExpanded(groupName);
    const groupButton = this.page.getByRole("button", { name: groupName });
    if (!isExpanded) {
      await groupButton.click();
    }

    const singularForm = this.getSingularForm(options.sidebarAssetTypes);

    let viewAllLink = this.page
      .locator(
        `a[data-sidebar="menu-sub-button"][href*="/assets/${singularForm}"]`
      )
      .filter({ hasText: "View all" });

    if ((await viewAllLink.count()) === 0) {
      viewAllLink = this.page
        .locator(`a[data-sidebar="menu-sub-button"]`)
        .filter({ hasText: options.sidebarAssetTypes });
    }

    await viewAllLink.first().waitFor({ state: "visible", timeout: 20000 });
    await viewAllLink.first().evaluate((element: HTMLElement) => {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      return new Promise((resolve) => setTimeout(resolve, 100));
    });
    await viewAllLink.first().click();

    await Promise.all([
      this.page.waitForSelector("table tbody", { timeout: 20000 }),
      this.page
        .getByRole("button", { name: "Filter" })
        .waitFor({ state: "visible", timeout: 20000 }),
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
    const nameCell = this.page
      .locator("td")
      .filter({ hasText: assetName })
      .first();
    await expect
      .poll(() => nameCell.isVisible(), { timeout: 30000 })
      .toBe(true);

    await nameCell.click();

    await this.page.waitForURL(
      /\/token\/0x[a-fA-F0-9]{40}\/0x[a-fA-F0-9]{40}/,
      { timeout: 30000 }
    );
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
