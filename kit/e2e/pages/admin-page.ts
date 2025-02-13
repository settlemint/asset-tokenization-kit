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

    // First locate the table cell containing our target date
    const dateCell = this.page.locator('td[role="presentation"]', {
      has: this.page.locator(`button:text("${day}")`),
    });

    await dateCell.locator('button').click();
  }

  async createAsset(options: {
    assetType: string;
    name: string;
    symbol: string;
    decimals: string;
    isin: string;
    faceValueCurrency: string;
    faceValue: string;
    couponRate: string;
    paymentFrequency: string;
    pincode: string;
  }) {
    await this.page.getByRole('button', { name: 'Asset Designer' }).click();
    await this.page.getByRole('menuitem', { name: options.assetType }).click();
    await this.page.getByLabel('Name').fill(options.name);
    await this.page.getByLabel('Symbol').fill(options.symbol);
    await this.page.getByLabel('Decimals').fill(options.decimals);
    await this.page.getByLabel('ISIN').fill(options.isin);
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
    await this.page.locator('input[name="pincode"][data-input-otp="true"]').fill(options.pincode);
    await this.page.getByRole('button', { name: 'Create' }).click();
  }
}
