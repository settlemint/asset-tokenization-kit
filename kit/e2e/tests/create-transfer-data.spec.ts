import { test } from '@playwright/test';
import { Pages } from '../pages/pages';
import { bondData } from '../test-data/asset-data';
import { adminUser } from '../test-data/user-data';

test.describe('Create assets', () => {
  test.beforeEach('Sign in', async ({ page }) => {
    const pages = Pages(page);
    await pages.signInPage.signInAsAdmin(adminUser);
  });

  test('Create a bond', async ({ page }) => {
    const pages = Pages(page);

    await pages.adminPage.goto();
    await pages.adminPage.createAsset(bondData);
  });
});
