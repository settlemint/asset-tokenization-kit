import type { Page } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async confirmPincode(pincode: string): Promise<void> {
    await this.page.getByRole('dialog').waitFor({ state: 'visible' });
    await this.page.locator('[data-input-otp="true"]').fill(pincode);
    await this.page.getByRole('button', { name: 'Yes, confirm' }).click();
  }
}

export type { Page } from '@playwright/test';
export { expect } from '@playwright/test';
