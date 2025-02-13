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
    await this.page.getByLabel('Choose a secure wallet PIN code').fill(options.pincode);
    await this.page.getByLabel('Confirm wallet PIN code').fill(options.pincode);

    await this.page.getByRole('button', { name: 'Create Account' }).click();
    await expect(this.page.getByText(options.name)).toBeVisible({ timeout: 10000 });
  }
}
