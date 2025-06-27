import { expect } from '@playwright/test';
import { BasePage } from './base-page';

export class SignUpPage extends BasePage {
  async goto() {
    await this.page.goto('/');
  }

  async signUp(options: {
    name: string;
    email: string;
    password: string;
    pincodeName: string;
    pincode: string;
  }) {
    await this.page.getByRole('link', { name: 'Issuer portal' }).click();
    await this.page.getByRole('link', { name: 'Sign Up' }).click();
    await this.page.getByLabel('Name').fill(options.name);
    await this.page.getByLabel('Email').fill(options.email);
    await this.page
      .getByPlaceholder('Enter your password', { exact: true })
      .fill(options.password);
    await this.page
      .getByPlaceholder('Confirm Password', { exact: true })
      .fill(options.password);
    await this.page.getByRole('button', { name: 'Create an account' }).click();
    await this.page.waitForURL(
      (url) =>
        url.pathname.includes('/portfolio') || url.pathname.includes('/assets'),
      { timeout: 10_000 }
    );
    await this.secureWallet({ pincode: options.pincode });
    await expect(
      this.page.locator('div.grid span.truncate.font-semibold', {
        hasText: options.name,
      })
    ).toBeVisible({ timeout: 30_000 });
  }

  async secureWallet(options: { pincode: string }) {
    const dialogSelector = 'div[role="dialog"][data-state="open"]';

    const isDialogVisible = await this.page
      .isVisible(dialogSelector, { timeout: 30_000 })
      .catch(() => false);

    if (isDialogVisible) {
      await this.page.getByRole('button', { name: 'Secure my wallet' }).click();
      await this.page.getByRole('button', { name: 'PIN-code' }).click();
      await this.page.locator('[data-input-otp="true"]').fill(options.pincode);
      await this.page.getByRole('button', { name: 'Next' }).click();
      await this.page.waitForSelector('button[title="Copy to clipboard"]', {
        state: 'visible',
        timeout: 30_000,
      });
      await this.page.getByRole('button', { name: 'Next' }).click();
      await this.page
        .getByRole('button', { name: 'Start using my wallet' })
        .click();
    }
  }
}
