import { expect } from '@playwright/test';
import { BasePage } from './base-page';

export class SignUpPage extends BasePage {
  async goto() {
    await this.page.goto('/');
  }

  async signUp(options: { name: string; email: string; password: string; pincode: string }) {
    await this.page.getByRole('link', { name: 'Issuer Portal' }).click();
    await this.page.getByRole('link', { name: 'Sign Up' }).click();
    await this.page.getByLabel('Name').fill(options.name);
    await this.page.getByLabel('Email').fill(options.email);
    await this.page.getByLabel('Password').fill(options.password);
    await this.page.waitForSelector('label:has-text("Choose a secure wallet PIN code")', { state: 'visible' });
    await this.page.locator('[data-input-otp="true"]').first().fill(options.pincode);
    await this.page.locator('[data-input-otp="true"]').last().fill(options.pincode);

    await this.page.getByRole('button', { name: 'Create Account' }).click();
    await this.page.waitForURL('**/admin');
    await expect(this.page.locator('div.grid span.truncate.font-semibold', { hasText: options.name })).toBeVisible();
  }
}
