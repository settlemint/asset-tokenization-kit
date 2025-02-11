import { type Page, expect, test } from '@playwright/test';
import { createDbClient, getUserRole, updateUserRole } from '../utils/db-utils';

test.describe('Issuer Portal Sign Up', () => {
  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    await page.goto('http://localhost:3000');
  });

  test('should complete the signup flow and update to admin', async () => {
    const testEmail = 'test4@example.com';

    await page.getByRole('link', { name: 'Issuer Portal' }).click();
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByLabel('Choose a secure wallet PIN code').fill('123456');
    await page.getByLabel('Confirm wallet PIN code').fill('123456');

    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Test User')).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(2000);
    await createDbClient();

    await updateUserRole(testEmail, 'admin');

    const role = await getUserRole(testEmail);
    expect(role).toBe('admin');
  });
});
