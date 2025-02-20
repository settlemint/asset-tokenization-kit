import { expect } from '@playwright/test';
import { BasePage } from './base-page';

export class AdminPage extends BasePage {
  private static readonly CURRENCY_CODE_REGEX = /[A-Z]+$/;
  private static readonly COMMA_REGEX = /,/g;

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
    await this.startAssetCreation(options.assetType, options.name, options.symbol);
    await this.page.getByLabel('Decimals').fill(options.decimals);
    await this.page.getByLabel('ISIN').fill(options.isin);
    await this.page.getByLabel('Cap').fill(options.cap);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.getByRole('combobox', { name: 'Face value currency' }).click();
    await this.page.getByRole('option', { name: options.faceValueCurrency }).waitFor({ state: 'visible' });
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
    await this.page.getByRole('option', { name: options.paymentFrequency }).waitFor({ state: 'visible' });
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
    await this.startAssetCreation(options.assetType, options.name, options.symbol);
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
    await this.startAssetCreation(options.assetType, options.name, options.symbol);
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
    await this.startAssetCreation(options.assetType, options.name, options.symbol);
    await this.page.getByLabel('ISIN').fill(options.isin);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.getByRole('combobox', { name: 'Fund category' }).click();
    await this.page.getByRole('option', { name: options.fundCategory }).waitFor({ state: 'visible' });
    await this.page.getByRole('option', { name: options.fundCategory }).click();
    await this.page.getByRole('combobox', { name: 'Fund class' }).click();
    await this.page.getByRole('option', { name: options.fundClass }).waitFor({ state: 'visible' });
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
    collateralProofValidityDuration: string;
    pincode: string;
  }) {
    await this.startAssetCreation(options.assetType, options.name, options.symbol);
    await this.page.getByLabel('ISIN').fill(options.isin);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.getByRole('combobox', { name: 'Collateral proof validity duration' }).click();
    await this.page
      .getByRole('option', { name: options.collateralProofValidityDuration })
      .waitFor({ state: 'visible' });
    await this.page.getByRole('option', { name: options.collateralProofValidityDuration }).click();
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.completeAssetCreation(options.pincode);
  }

  async checkIfAssetExists(options: { sidebarAssetTypes: string; name: string; totalSupply: string }) {
    await this.chooseAssetTypeFromSidebar({ sidebarAssetTypes: options.sidebarAssetTypes });
    await this.page.getByPlaceholder('Search...').fill(options.name);

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

  async updateProvenCollateral(options: { sidebarAssetTypes: string; name: string; amount: string; pincode: string }) {
    await this.chooseAssetTypeFromSidebar({ sidebarAssetTypes: options.sidebarAssetTypes });
    await this.chooseAssetFromTable({ name: options.name, sidebarAssetTypes: options.sidebarAssetTypes });
    await this.page.getByRole('button', { name: 'Manage Stablecoin' }).click();
    const updateCollateralButton = this.page.getByRole('button', { name: 'Update proven collateral' });

    await updateCollateralButton.waitFor({ state: 'visible' });
    await updateCollateralButton.click();
    await this.page.getByLabel('Amount').fill(options.amount);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.locator('[data-input-otp="true"]').fill(options.pincode);
    await this.page.getByRole('button', { name: 'Update collateral' }).click();
  }

  private formatAmount(amount: string): string {
    return amount.replace(AdminPage.CURRENCY_CODE_REGEX, '').replace(AdminPage.COMMA_REGEX, '').trim().split('.')[0];
  }

  async verifyProvenCollateral(expectedAmount: string) {
    const collateralElement = this.page
      .locator('div.space-y-1')
      .filter({
        has: this.page.locator('span.font-medium.text-muted-foreground.text-sm', {
          hasText: 'Proven collateral',
        }),
      })
      .locator('div.text-md');

    await collateralElement.waitFor({ state: 'visible', timeout: 30000 });
    const actualAmount = await collateralElement.textContent();

    if (!actualAmount) {
      throw new Error('Could not find proven collateral amount');
    }

    const formattedActual = this.formatAmount(actualAmount);
    const formattedExpected = this.formatAmount(expectedAmount);

    if (formattedActual !== formattedExpected) {
      throw new Error(`Expected proven collateral to be ${formattedExpected} but found ${formattedActual}`);
    }
  }

  async mintToken(options: { sidebarAssetTypes: string; name: string; user: string; amount: string; pincode: string }) {
    await this.chooseAssetTypeFromSidebar({ sidebarAssetTypes: options.sidebarAssetTypes });
    await this.chooseAssetFromTable({ name: options.name, sidebarAssetTypes: options.sidebarAssetTypes });
    await this.page.getByRole('button', { name: 'Manage Stablecoin' }).click();
    const mintTokensButton = this.page.getByRole('button', { name: 'Mint tokens' });
    await mintTokensButton.waitFor({ state: 'visible' });
    await mintTokensButton.click();
    await this.page.getByRole('button', { name: 'Search for a user' }).click();
    await this.page.getByPlaceholder('Search for a user...').click();
    await this.page.getByPlaceholder('Search for a user...').fill(options.user);
    await this.page.getByRole('option', { name: `Avatar ${options.user}` }).click();
    await this.page.getByRole('button', { name: 'Go to next step' }).click();
    await this.page.getByLabel('Amount').fill(options.amount);
    await this.page.getByRole('button', { name: 'Go to next step' }).click();
    await this.page.getByRole('textbox').click();
    await this.page.getByRole('textbox').fill(options.pincode);
    await this.page.getByRole('button', { name: 'Mint' }).click();
  }

  async verifyTotalSupply(expectedAmount: string) {
    const totalSupplyElement = this.page
      .locator('div.space-y-1')
      .filter({
        has: this.page.locator('span.font-medium.text-muted-foreground.text-sm', {
          hasText: 'Total supply',
        }),
      })
      .locator('div.text-md');

    await expect(totalSupplyElement).toBeVisible();

    const actualAmount = await totalSupplyElement.textContent();

    if (!actualAmount) {
      throw new Error('Could not find total supply amount');
    }

    const normalizedActual = this.formatAmount(actualAmount);
    const normalizedExpected = expectedAmount;

    await expect(normalizedActual).toBe(normalizedExpected);
  }

  async verifySuccessMessage(partialMessage: string) {
    await this.page.waitForSelector(
      `[data-sonner-toast][data-type="success"][data-mounted="true"][data-visible="true"] [data-title]`,
      { state: 'visible' }
    );
    const toastTitle = await this.page.locator('[data-sonner-toast][data-type="success"] [data-title]').textContent();

    if (!toastTitle?.toLowerCase().includes(partialMessage.toLowerCase())) {
      throw new Error(`Expected successmessage to contain "${partialMessage}" but found "${toastTitle}"`);
    }
  }

  async chooseAssetTypeFromSidebar(options: { sidebarAssetTypes: string }) {
    await this.page.getByRole('button', { name: options.sidebarAssetTypes }).click();
    const viewAllLink = this.page
      .locator(`a[data-sidebar="menu-sub-button"][href="/admin/${options.sidebarAssetTypes.toLowerCase()}"]`)
      .filter({ hasText: 'View all' });
    await viewAllLink.click();
    await this.page.waitForURL(`**/${options.sidebarAssetTypes.toLowerCase()}`);
    await Promise.all([
      this.page.waitForSelector('table tbody'),
      this.page.waitForSelector('[data-testid="data-table-search-input"]'),
    ]);
  }

  async chooseAssetFromTable(options: { name: string; sidebarAssetTypes: string }) {
    await this.page.getByPlaceholder('Search...').fill(options.name);
    const detailsLink = this.page
      .locator('tr')
      .filter({ has: this.page.getByText(options.name, { exact: true }) })
      .getByRole('link', { name: 'Details' });

    await detailsLink.click();
    await this.page.waitForURL(new RegExp(`.*/${options.sidebarAssetTypes.toLowerCase()}/0x[a-fA-F0-9]{40}`));
  }
}
