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

  async verifyPortfolioAssetAmount(options: { expectedAmount: string }) {
    const amountElement = this.page.locator("span.font-bold.text-4xl");
    await amountElement.waitFor({ state: "visible" });

    const actualAmount = await amountElement.textContent();

    if (!actualAmount) {
      throw new Error("Could not find portfolio amount");
    }

    const formattedActual = Number.parseFloat(
      actualAmount.replace(/,/g, "")
    ).toString();
    const formattedExpected = Number.parseFloat(
      options.expectedAmount
    ).toString();

    if (formattedActual !== formattedExpected) {
      throw new Error(
        `Expected portfolio amount to be ${options.expectedAmount} but found ${actualAmount}`
      );
    }
  }

  async transferAsset(options: {
    asset: string;
    walletAddress: string;
    transferAmount: string;
    pincode: string;
  }): Promise<void> {
    await this.page.getByRole("button", { name: "Transfer" }).click();
    const assetButton = this.page.getByRole("button", {
      name: "Select an asset",
    });
    await assetButton.scrollIntoViewIfNeeded();

    try {
      await assetButton.evaluate((node) => {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
        (node as HTMLElement).click();
      });
    } catch (_) {
      await assetButton.click({ force: true });
    }

    await this.page.waitForFunction(
      () => {
        const input = document.querySelector(
          'input[placeholder="Search for an asset..."]'
        );
        return input !== null;
      },
      { timeout: 40000 }
    );

    const input = this.page.getByPlaceholder("Search for an asset...");
    await input.fill(options.asset);
    const optionLocator = this.page.locator('[cmdk-item][role="option"]', {
      hasText: options.asset,
    });

    await optionLocator.waitFor({ state: "visible", timeout: 40000 });
    await this.page.waitForFunction(
      () => {
        const options = document.querySelectorAll('[cmdk-item][role="option"]');
        return options.length > 0;
      },
      { timeout: 40000 }
    );

    try {
      await optionLocator.evaluate((node) => {
        const event = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        node.dispatchEvent(event);
      });
    } catch (_) {
      await optionLocator.click({ force: true, timeout: 40000 });
    }

    await this.page.getByRole("button", { name: "Confirm" }).click();
    await this.page.getByLabel("Wallet Address").fill(options.walletAddress);
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.page.getByLabel("Amount").fill(options.transferAmount);
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.page.locator('[data-input-otp="true"]').fill(options.pincode);
    await this.page.getByRole("button", { name: "Transfer" }).click();
  }

  async verifyAssetBalance(initialBalance: string, expectedBalance: string) {
    const amountElement = this.page.locator("span.mr-1.font-bold.text-4xl");
    await amountElement.waitFor({ state: "visible" });

    await expect
      .poll(
        async () => {
          const actualAmount = await amountElement.textContent();
          if (!actualAmount) {
            throw new Error("Could not find portfolio balance amount");
          }
          const formattedActual = Number.parseFloat(
            actualAmount.replace(/,/g, "")
          ).toString();
          if (formattedActual === initialBalance) {
            return initialBalance;
          }
          return formattedActual;
        },
        {
          message: `Waiting for balance to change from ${initialBalance} to ${expectedBalance}`,
          timeout: 120000,
          intervals: [1000],
        }
      )
      .toBe(expectedBalance);
  }
}
