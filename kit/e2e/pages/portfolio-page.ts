import { expect } from '@playwright/test';
import { BasePage } from './base-page';
const ASSET_DETAILS_URL_PATTERN = /\/portfolio\/my-assets(?:\/[a-zA-Z0-9-]+)?\/0x[a-fA-F0-9]{40}/;
const CURRENCY_CODE_REGEX = /[A-Z]+$/;
const COMMA_REGEX = /,/g;

export class PortfolioPage extends BasePage {
  async goto() {
    await this.page.goto('/portfolio');
  }

  async verifyPortfolioAssetAmount(options: { expectedAmount: string }) {
    const amountElement = this.page.locator('span.font-bold.text-4xl');
    await amountElement.waitFor({ state: 'visible' });

    const actualAmount = await amountElement.textContent();

    if (!actualAmount) {
      throw new Error('Could not find portfolio amount');
    }

    const formattedActual = Number.parseFloat(actualAmount.replace(/,/g, '')).toString();
    const formattedExpected = Number.parseFloat(options.expectedAmount).toString();

    if (formattedActual !== formattedExpected) {
      throw new Error(`Expected portfolio amount to be ${options.expectedAmount} but found ${actualAmount}`);
    }
  }

  async transferAsset(options: { assetName: string; walletAddress: string; transferAmount: string; pincode: string }) {
    await this.page.getByRole('link', { name: 'My Assets' }).click();
    await this.page.waitForURL('**/portfolio/my-assets');
    await this.page.locator('table').waitFor({ state: 'visible' });
    const row = this.page.locator('tbody tr', {
      has: this.page.getByText(options.assetName, { exact: true }),
    });
    await row.locator('a', { hasText: 'Details' }).click();
    await this.page.waitForURL(ASSET_DETAILS_URL_PATTERN);
    await this.page.getByRole('button', { name: 'Transfer' }).click();
    const menu = this.page.getByRole('menu');
    await menu.waitFor({ state: 'visible' });
    const transferButton = menu.locator('button').filter({ hasText: /^Transfer$/ });
    await transferButton.waitFor({ state: 'visible' });
    await transferButton.click();
    await this.page.getByLabel('Wallet Address').fill(options.walletAddress);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.getByLabel('Amount').fill(options.transferAmount);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.locator('[data-input-otp="true"]').fill(options.pincode);
    await this.page.getByRole('button', { name: 'Transfer' }).click();
  }

  async verifyAssetBalance(initialBalance: string, expectedBalance: string) {
    const balanceElement = this.page
      .locator('span.font-medium.text-muted-foreground')
      .filter({ hasText: 'Balance' })
      .locator('..')
      .locator('.text-md');

    await balanceElement.waitFor({ state: 'visible' });

    await expect
      .poll(
        async () => {
          const text = await balanceElement.textContent();
          if (!text) {
            throw new Error('Could not find balance text');
          }
          const currentBalance = this.formatBalance(text);
          if (currentBalance === initialBalance) {
            return initialBalance;
          }
          return currentBalance;
        },
        {
          message: `Waiting for balance to change from ${initialBalance} to ${expectedBalance}`,
          timeout: 30000,
          intervals: [1000],
        }
      )
      .toBe(expectedBalance);
  }

  private formatBalance(balanceText: string): string {
    return balanceText.replace(CURRENCY_CODE_REGEX, '').replace(COMMA_REGEX, '').trim().split('.')[0];
  }
}
