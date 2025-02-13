import { expect, test } from '@playwright/test';
import { Pages } from '../pages/pages';
import { signUpData } from '../test-data/user-data';
import { createDbClient, getUserRole, updateUserRole } from '../utils/db-utils';
test.describe('Issuer Portal Sign Up', () => {
  test.beforeEach(async ({ page }) => {
    const pages = Pages(page);
    await pages.signUpPage.goto();
  });

  test('should complete the signup flow and update to admin', async ({ page }) => {
    const pages = Pages(page);
    await pages.signUpPage.signUp(signUpData);
    await createDbClient();

    await updateUserRole(signUpData.email, 'admin');

    const role = await getUserRole(signUpData.email);
    expect(role).toBe('admin');
  });
});
