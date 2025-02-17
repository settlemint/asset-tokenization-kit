import { expect } from '@playwright/test';
import { BasePage } from './base-page';

export class AdminPage extends BasePage {
  async goto() {
    await this.page.goto('/admin');
  }

  private async selectTomorrowDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const day = tomorrow.getDate().toString();
    const currentMonth = today.getMonth();
    const tomorrowMonth = tomorrow.getMonth();

    if (currentMonth !== tomorrowMonth) {
      await this.page.getByRole('button', { name: 'Next month' }).click();
    }

    await this.page.waitForSelector('table[aria-labelledby*="react-day-picker"]');
    const dateCell = this.page.locator('td[role="presentation"]', {
      has: this.page.locator(`button:text("${day}")`),
    });

    await dateCell.locator('button').click();
  }

  private normalizeNumber(str: string): string {
    const withoutCommas = str.replace(/,/g, '');
    const [wholeNumber] = withoutCommas.split('.');
    return wholeNumber;
  }

  private async startAssetCreation(assetType: string, name: string, symbol: string) {
    await this.page.getByRole('button', { name: 'Asset Designer' }).click();
    await this.page.getByRole('menuitem', { name: assetType }).click();
    await this.page.getByLabel('Name').fill(name);
    await this.page.getByLabel('Symbol').fill(symbol);
  }

  private async completeAssetCreation(pincode: string) {
    await this.page.locator('[data-input-otp="true"]').fill(pincode);
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async createBond(options: {
    assetType: string;
    name: string;
    symbol: string;
    decimals: string;
    isin: string;
    cap: string;
    faceValueCurrency: string;
    faceValue: string;
    couponRate: string;
    paymentFrequency: string;
    pincode: string;
  }) {
    this.startAssetCreation(options.assetType, options.name, options.symbol);
    await this.page.getByLabel('Decimals').fill(options.decimals);
    await this.page.getByLabel('ISIN').fill(options.isin);
    await this.page.getByLabel('Cap').fill(options.cap);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.getByRole('combobox', { name: 'Face value currency' }).click();
    await this.page.getByRole('option', { name: options.faceValueCurrency }).click();
    await this.page.getByRole('spinbutton', { name: 'Face value' }).fill(options.faceValue);
    const datepicker = await this.page
      .locator('div')
      .filter({ hasText: 'Pick a date' })
      .getByRole('button', { name: 'Maturity date' })
      .first();
    await datepicker.click();
    await this.selectTomorrowDate();
    await this.page.getByLabel('Coupon rate').fill(options.couponRate);
    await this.page.getByLabel('Payment frequency').click();
    await this.page.getByRole('option', { name: options.paymentFrequency }).click();
    await this.page.getByLabel('First payment date').click();
    await this.selectTomorrowDate();
    await this.page.getByRole('button', { name: 'Go to next step' }).click();
    await this.completeAssetCreation(options.pincode);
  }

  async createCryptocurrency(options: {
    assetType: string;
    name: string;
    symbol: string;
    initialSupply: string;
    pincode: string;
  }) {
    this.startAssetCreation(options.assetType, options.name, options.symbol);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.getByLabel('Initial supply').fill(options.initialSupply);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.completeAssetCreation(options.pincode);
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
    this.startAssetCreation(options.assetType, options.name, options.symbol);
    await this.page.getByLabel('ISIN').fill(options.isin);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.getByLabel('Equity class').fill(options.equityClass);
    await this.page.getByLabel('Equity category').fill(options.equityCategory);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.completeAssetCreation(options.pincode);
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
    this.startAssetCreation(options.assetType, options.name, options.symbol);
    await this.page.getByLabel('ISIN').fill(options.isin);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.getByRole('combobox', { name: 'Fund category' }).click();
    await this.page.getByRole('option', { name: options.fundCategory }).click();
    await this.page.getByRole('combobox', { name: 'Fund class' }).click();
    await this.page.getByRole('option', { name: options.fundClass }).click();
    await this.page.getByLabel('Management fee').fill(options.managementFee);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.completeAssetCreation(options.pincode);
  }

  async createStablecoin(options: {
    assetType: string;
    name: string;
    symbol: string;
    isin: string;
    collateralThreshold: string;
    collateralProofValidityDuration: string;
    pincode: string;
  }) {
    this.startAssetCreation(options.assetType, options.name, options.symbol);
    await this.page.getByLabel('ISIN').fill(options.isin);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.getByLabel('Collateral threshold').fill(options.collateralThreshold);
    await this.page.getByRole('combobox', { name: 'Collateral proof validity duration' }).click();
    await this.page.getByRole('option', { name: options.collateralProofValidityDuration }).click();
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.completeAssetCreation(options.pincode);
  }

  async checkIfAssetExists(options: { sidebarAssetTypes: string; name: string; totalSupply: string }) {
    await this.page.getByRole('button', { name: options.sidebarAssetTypes }).click();
    await this.page
      .locator('a[data-sidebar="menu-sub-button"]', {
        hasText: 'View all',
      })
      .click();
    await this.page.waitForSelector('table tbody');

    const nameColumnIndex = await this.page.locator('th', { hasText: 'Name' }).evaluate((el) => {
      return Array.from(el.parentElement?.children ?? []).indexOf(el) + 1;
    });

    const supplyColumnIndex = await this.page.locator('th', { hasText: 'Total Supply' }).evaluate((el) => {
      return Array.from(el.parentElement?.children ?? []).indexOf(el) + 1;
    });

    const row = this.page.locator('tbody tr', {
      has: this.page.locator(`td:nth-child(${nameColumnIndex}) .flex`, { hasText: options.name }),
    });

    await row.waitFor();
    const nameCell = row.locator(`td:nth-child(${nameColumnIndex}) .flex`);
    const totalSupplyCell = row.locator(`td:nth-child(${supplyColumnIndex}) .flex`);

    const actualName = await nameCell.textContent();
    const actualTotalSupply = await totalSupplyCell.textContent();

    expect(actualName?.trim()).toBe(options.name);
    expect(this.normalizeNumber(actualTotalSupply?.trim() ?? '')).toBe(options.totalSupply);
  }
}
