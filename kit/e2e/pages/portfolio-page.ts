import { expect } from "@playwright/test";
import { BasePage } from "./base-page";
const ASSET_DETAILS_URL_PATTERN =
  /\/portfolio\/my-assets(?:\/[a-zA-Z0-9-]+)?\/0x[a-fA-F0-9]{40}/;
const CURRENCY_CODE_REGEX = /[A-Z]+$/;
const COMMA_REGEX = /,/g;

export class PortfolioPage extends BasePage {
  async goto() {
    await this.page.goto("/portfolio");
  }

  async verifyPortfolioAssetAmount(options: {
    expectedAmount: string;
    price?: string;
  }) {
    await this.page.getByRole("link", { name: "Dashboard" }).click();
    const amountElement = this.page.locator("span.font-bold.text-4xl");
    await amountElement.waitFor({ state: "visible" });

    const actualAmount = await amountElement.textContent();

    if (!actualAmount) {
      throw new Error("Could not find portfolio amount");
    }

    const formattedActual = Number.parseFloat(
      actualAmount.replace(/[€$£,]/g, "").trim()
    ).toFixed(0);

    let formattedExpected = Number.parseFloat(
      options.expectedAmount
    ).toString();
    if (options.price) {
      formattedExpected = (
        Number.parseFloat(options.expectedAmount) *
        Number.parseFloat(options.price)
      ).toFixed(0);
    }

    if (formattedActual !== formattedExpected) {
      throw new Error(
        `Expected portfolio amount to be ${formattedExpected} but found ${actualAmount} (formatted: ${formattedActual})`
      );
    }
  }

  async transferAsset(options: {
    asset: string;
    walletAddress: string;
    transferAmount: string;
    user: string;
    pincode: string;
  }): Promise<void> {
    await this.page.getByRole("button", { name: "Transfer" }).click();
    const assetButton = this.page.locator('#asset, [id="asset"]');
    await assetButton.waitFor({ state: "visible", timeout: 15000 });
    await assetButton.click();

    await this.page.waitForSelector('[role="dialog"][data-state="open"]');
    const searchInput = this.page.locator(
      '[role="dialog"][data-state="open"] input'
    );
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill(options.asset);
    await this.page
      .locator(`[role="option"]`)
      .filter({ hasText: options.asset })
      .first()
      .click();

    await this.page.getByRole("button", { name: "Confirm" }).click();
    await this.page.getByLabel("Amount").fill(options.transferAmount);
    await this.page.getByRole("button", { name: "Next" }).click();
    const recipientButton = this.page.locator('#to, [id="to"]');
    await recipientButton.waitFor({ state: "visible", timeout: 15000 });
    await recipientButton.click();
    await this.searchAndSelectFromDialog(options.walletAddress, options.user);
    await this.page.getByRole("button", { name: "Next" }).click();

    const button = this.page.getByRole("button", { name: "Transfer" });

    await button.waitFor({ state: "attached" });
    await button.scrollIntoViewIfNeeded();
    await button.click();

    await this.page.getByRole("dialog").waitFor({ state: "visible" });
    await this.page.locator('[data-input-otp="true"]').fill(options.pincode);
    await this.page.getByRole("button", { name: "Yes, confirm" }).click();
  }

  async verifyAssetBalance(
    initialBalance: string,
    expectedBalance: string,
    price?: string
  ) {
    const amountElement = this.page.locator("span.mr-1.font-bold.text-4xl");
    await amountElement.waitFor({ state: "visible" });

    let adjustedInitialBalance = initialBalance;
    let adjustedExpectedBalance = expectedBalance;

    if (price) {
      adjustedInitialBalance = (
        Number.parseFloat(initialBalance) * Number.parseFloat(price)
      ).toFixed(0);
      adjustedExpectedBalance = (
        Number.parseFloat(expectedBalance) * Number.parseFloat(price)
      ).toFixed(0);
    }

    await expect
      .poll(
        async () => {
          const actualAmount = await amountElement.textContent();
          if (!actualAmount) {
            throw new Error("Could not find portfolio balance amount");
          }

          // Improved formatting to handle currency symbols and commas
          const formattedActual = Number.parseFloat(
            actualAmount.replace(/[€$£,]/g, "").trim()
          ).toFixed(0);

          // Convert initial balance to same format for comparison
          const formattedInitial = price
            ? adjustedInitialBalance
            : Number.parseFloat(initialBalance).toFixed(0);

          if (formattedActual === formattedInitial) {
            return formattedInitial;
          }

          return formattedActual;
        },
        {
          message: `Waiting for balance to change from ${adjustedInitialBalance} to ${adjustedExpectedBalance}`,
          timeout: 120000,
          intervals: [1000],
        }
      )
      .toBe(
        price
          ? adjustedExpectedBalance
          : Number.parseFloat(expectedBalance).toFixed(0)
      );
  }

  private async searchAndSelectFromDialog(
    searchText: string,
    user: string,
    optionSelector: string = '[role="option"]'
  ) {
    await this.page.waitForSelector('[role="dialog"][data-state="open"]');

    const searchInput = this.page.locator(
      '[role="dialog"][data-state="open"] input'
    );
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill(searchText);

    await this.page
      .locator(optionSelector)
      .filter({ hasText: user })
      .first()
      .click();
  }
}
