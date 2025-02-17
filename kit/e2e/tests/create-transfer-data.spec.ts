import { test } from '@playwright/test';
import { Pages } from '../pages/pages';
import { bondData, cryptocurrencyData, equityData, fundData, stablecoinData } from '../test-data/asset-data';
import { adminUser } from '../test-data/user-data';

test.describe('Create assets', () => {
  test.beforeEach('Sign in', async ({ page }) => {
    const pages = Pages(page);
    await pages.signInPage.signInAsAdmin(adminUser);
  });

  test('Create Bond asset', async ({ page }) => {
    const pages = Pages(page);

    await pages.adminPage.goto();
    await pages.adminPage.createBond(bondData);
  });

  test('Create Cryptocurrency asset', async ({ page }) => {
    const pages = Pages(page);
    await pages.adminPage.goto();
    await pages.adminPage.createCryptocurrency(cryptocurrencyData);
    await pages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: cryptocurrencyData.sidebarAssetTypes,
      name: cryptocurrencyData.name,
      totalSupply: cryptocurrencyData.initialSupply,
    });
  });
  test('Create Equity asset', async ({ page }) => {
    const pages = Pages(page);
    await pages.adminPage.goto();
    await pages.adminPage.createEquity(equityData);
    await pages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: equityData.sidebarAssetTypes,
      name: equityData.name,
      totalSupply: equityData.initialSupply,
    });
  });
  test('Create Fund asset', async ({ page }) => {
    const pages = Pages(page);
    await pages.adminPage.goto();
    await pages.adminPage.createFund(fundData);
    await pages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: fundData.sidebarAssetTypes,
      name: fundData.name,
      totalSupply: fundData.initialSupply,
    });
    test('Create Stablecoin asset', async ({ page }) => {
      const pages = Pages(page);
      await pages.adminPage.goto();
      await pages.adminPage.createStablecoin(stablecoinData);
      await pages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
        name: stablecoinData.name,
        totalSupply: stablecoinData.initialSupply,
      });
    });
  });
});
