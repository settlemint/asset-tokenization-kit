import { expect } from '@playwright/test';
import { BasePage } from './base-page';

export class SignInPage extends BasePage {
  async goto() {
    await this.page.goto('/auth/signin');
  }

  async signIn(options: { email: string; password: string; name: string }) {
    await this.page.getByLabel('Email').fill(options.email);
    await this.page.getByLabel('Password').fill(options.password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
    await expect(this.page.getByText(options.name)).toBeVisible();
  }
}
