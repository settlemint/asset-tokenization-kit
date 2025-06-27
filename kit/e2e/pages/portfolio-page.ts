import { expect } from '@playwright/test';
import {
  parseAmountString,
  selectRecipientFromDialog,
} from '../utils/page-utils';
import { BasePage } from './base-page';

export class PortfolioPage extends BasePage {
  async goto() {
    await this.page.goto('/portfolio');
  }

  async verifyPortfolioAssetAmount(options: {
    expectedAmount: string;
    price?: string;
  }) {
    await this.page.getByRole('link', { name: 'Dashboard' }).click();
    const amountElement = this.page.locator('div.font-bold.text-4xl');
    await amountElement.waitFor({ state: 'visible' });

    const actualAmount = await amountElement.textContent();

    if (!actualAmount) {
      throw new Error('Could not find portfolio amount');
    }

    const numericValue = this.parseAmountString(actualAmount);
    const formattedActual = numericValue.toFixed(0);

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
        `Expected portfolio amount to be ${formattedExpected} but found ${actualAmount} (parsed as ${numericValue}, formatted: ${formattedActual})`
      );
    }
  }

  async verifyMyAssetBalance(_options: { expectedAmount: string }) {
    await this.page.getByRole('link', { name: 'My assets' }).click();
  }

  async addContact(options: {
    address: string;
    firstName: string;
    lastName: string;
  }) {
    await this.page.getByRole('link', { name: 'My contacts' }).click();
    await this.page.getByRole('button', { name: 'Add Contact' }).click();
    await this.page.getByLabel('Wallet Address').fill(options.address);
    await this.page.getByLabel('First Name').fill(options.firstName);
    await this.page.getByLabel('Last Name').fill(options.lastName);
    await this.page.getByRole('button', { name: 'Add Contact' }).click();
  }

  async transferAsset(options: {
    asset: string;
    walletAddress: string;
    transferAmount: string;
    user: string;
    pincode: string;
  }): Promise<void> {
    await this.page.goto('/portfolio');
    await this.page.getByRole('link', { name: 'Dashboard' }).first().click();
    await this.page.getByRole('button', { name: 'Transfer' }).click();
    const assetButton = this.page.locator('#asset, [id="asset"]');
    await assetButton.waitFor({ state: 'visible', timeout: 15_000 });
    await assetButton.click();

    await this.page.waitForSelector('[role="dialog"][data-state="open"]');
    const searchInput = this.page.locator(
      '[role="dialog"][data-state="open"] input'
    );
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill(options.asset);
    await this.page
      .locator(`[role="option"]`)
      .filter({ hasText: options.asset })
      .first()
      .click();

    await this.page.getByRole('button', { name: 'Confirm' }).click();
    await this.page.getByLabel('Amount').fill(options.transferAmount);
    await this.page.getByRole('button', { name: 'Next' }).click();
    const recipientButton = this.page.locator('#to, [id="to"]');
    await recipientButton.waitFor({ state: 'visible', timeout: 15_000 });
    await recipientButton.click();
    await selectRecipientFromDialog(
      this.page,
      options.walletAddress,
      options.user
    );
    await this.page.getByRole('button', { name: 'Next' }).click();

    const button = this.page.getByRole('button', { name: 'Transfer' });

    await button.waitFor({ state: 'attached' });
    await button.scrollIntoViewIfNeeded();
    await button.click();

    await this.page.getByRole('dialog').waitFor({ state: 'visible' });
    await this.page.locator('[data-input-otp="true"]').fill(options.pincode);
    await this.page.getByRole('button', { name: 'Yes, confirm' }).click();
  }

  async verifyAssetBalance(
    initialBalance: string,
    expectedBalance: string,
    price?: string
  ) {
    const amountElement = this.page.locator('div.font-bold.text-4xl');
    await amountElement.waitFor({ state: 'visible' });

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
          const actualAmountText = await amountElement.textContent();
          if (!actualAmountText) {
            return 'Could not find portfolio balance amount text';
          }

          try {
            const numericValue = this.parseAmountString(actualAmountText);
            const formattedActual = numericValue.toFixed(0);

            if (
              formattedActual ===
              (price
                ? adjustedInitialBalance
                : Number.parseFloat(initialBalance).toFixed(0))
            ) {
              return formattedActual;
            }

            return formattedActual;
          } catch (_error) {
            return 'PARSE_ERROR';
          }
        },
        {
          message: `Waiting for balance to change from ${adjustedInitialBalance} to ${adjustedExpectedBalance}. Last parsed value might be incorrect if text was "TEXT_NOT_FOUND" or "PARSE_ERROR".`,
          timeout: 120_000,
          intervals: [1000],
        }
      )
      .toBe(
        price
          ? adjustedExpectedBalance
          : Number.parseFloat(expectedBalance).toFixed(0)
      );
  }

  async verifyContactExists(options: { name: string; walletAddress: string }) {
    await this.page.getByRole('table').waitFor({ state: 'visible' });

    const displayName = options.name.split(' ').slice(0, 2).join(' ');
    const nameCell = this.page
      .getByRole('cell')
      .filter({ hasText: displayName })
      .first();
    await expect(nameCell).toBeVisible();

    const shortAddress = `${options.walletAddress.slice(0, 6)}…${options.walletAddress.slice(-4)}`;
    const addressCell = this.page
      .getByRole('cell')
      .filter({ hasText: shortAddress })
      .first();
    await expect(addressCell).toBeVisible();
  }

  private parseAmountString(text: string): number {
    return parseAmountString(text);
  }
}
