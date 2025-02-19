import { test } from '@playwright/test';
import { Pages } from '../pages/pages';
import { bondData, cryptocurrencyData, equityData, fundData, stablecoinData } from '../test-data/asset-data';
import { adminUser } from '../test-data/user-data';

test.describe('Create assets', () => {
  test.describe.configure({ mode: 'serial' });
  let createdStablecoinName: string;

  test.beforeEach('Sign in', async ({ page }) => {
    const pages = Pages(page);
    await pages.signInPage.signInAsAdmin(adminUser);
  });

  test('Create Stablecoin asset', async ({ page }) => {
    const pages = Pages(page);
    await pages.adminPage.goto();
    await pages.adminPage.createStablecoin(stablecoinData);
    createdStablecoinName = stablecoinData.name;
    await pages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
      name: stablecoinData.name,
      totalSupply: stablecoinData.initialSupply,
    });
  });

  test('Create Bond asset', async ({ page }) => {
    const pages = Pages(page);
    const bondDataWithStablecoin = {
      ...bondData,
      faceValueCurrency: createdStablecoinName,
    };

    await pages.adminPage.goto();
    await pages.adminPage.createBond(bondDataWithStablecoin);
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
  });
});
