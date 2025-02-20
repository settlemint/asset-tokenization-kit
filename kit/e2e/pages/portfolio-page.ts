import { BasePage } from './base-page';
const ASSET_DETAILS_URL_PATTERN = /\/portfolio\/my-assets\/0x[a-fA-F0-9]{40}/;
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

    if (actualAmount !== options.expectedAmount) {
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
    await this.page.locator('[role="menu"]').waitFor({ state: 'visible' });
    const transferOption = this.page.getByRole('menuitem').filter({ hasText: 'Transfer' });
    await transferOption.waitFor({ state: 'visible' });
    await transferOption.click();
    await this.page.getByLabel('Wallet Address').fill(options.walletAddress);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.getByLabel('Amount').fill(options.transferAmount);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.locator('[data-input-otp="true"]').fill(options.pincode);
    await this.page.getByRole('button', { name: 'Transfer' }).click();
  }

  async verifyAssetBalance(expectedBalance: string) {
    const balanceElement = this.page
      .locator('span.font-medium.text-muted-foreground')
      .filter({ hasText: 'Balance' })
      .locator('..')
      .locator('.text-md');

    await balanceElement.waitFor({ state: 'visible' });
    const actualBalanceText = await balanceElement.textContent();

    if (!actualBalanceText) {
      throw new Error('Could not find balance text');
    }

    const actualBalance = this.formatBalance(actualBalanceText);

    if (actualBalance !== expectedBalance) {
      throw new Error(`Expected balance to be ${expectedBalance} but found ${actualBalance}`);
    }
  }

  private formatBalance(balanceText: string): string {
    return balanceText.replace(CURRENCY_CODE_REGEX, '').replace(COMMA_REGEX, '').trim().split('.')[0];
  }
}
