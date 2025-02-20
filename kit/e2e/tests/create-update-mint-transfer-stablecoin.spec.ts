import { type BrowserContext, test } from '@playwright/test';
import { Pages } from '../pages/pages';
import {
  stableCoinMintTokenData,
  stableCoinTransferData,
  stableCoinUpdateProvenCollateralData,
  stablecoinData,
} from '../test-data/asset-data';
import { assetMessage, stableCoinMintTokenMessage, stableCoinTransferMessage } from '../test-data/success-msg-data';
import { adminUser, signUpTransferUserData, signUpUserData } from '../test-data/user-data';
import { fetchWalletAddressFromDB } from '../utils/db-utils';

const testData = {
  userName: '',
  transferUserEmail: '',
  transferUserWalletAddress: '',
  stablecoinName: '',
};

test.describe('Update collateral, mint and transfer assets', () => {
  test.describe.configure({ mode: 'serial' });
  let userContext: BrowserContext | undefined;
  let transferUserContext: BrowserContext | undefined;
  let userPages: ReturnType<typeof Pages>;
  let transferUserPages: ReturnType<typeof Pages>;
  test.beforeAll(async ({ browser }) => {
    try {
      userContext = await browser.newContext();
      const userPage = await userContext.newPage();
      userPages = Pages(userPage);
      await userPage.goto('/');
      await userPages.signUpPage.signUp(signUpUserData);
      testData.userName = signUpUserData.name;
      transferUserContext = await browser.newContext();
      const transferUserPage = await transferUserContext.newPage();
      transferUserPages = Pages(transferUserPage);
      await transferUserPage.goto('/');
      await transferUserPages.signUpPage.signUp(signUpTransferUserData);
      testData.transferUserEmail = signUpTransferUserData.email;

      const transferUserWalletAddress = await fetchWalletAddressFromDB(signUpTransferUserData.email);
      testData.transferUserWalletAddress = transferUserWalletAddress;
    } catch (error) {
      if (userContext) {
        await userContext.close();
      }
      if (transferUserContext) {
        await transferUserContext.close();
      }
      throw error;
    }
  });
  test.afterAll(async () => {
    if (userContext) {
      await userContext.close();
    }
    if (transferUserContext) {
      await transferUserContext.close();
    }
  });
  test('Admin user creates stablecoin, updates proven collateral and mints tokens', async ({ browser }) => {
    const adminContext = await browser.newContext();
    try {
      const adminPage = await adminContext.newPage();
      const adminPages = Pages(adminPage);
      await adminPage.goto('/');
      await adminPages.signInPage.signInAsAdmin(adminUser);
      await adminPages.adminPage.goto();
      await adminPages.adminPage.createStablecoin(stablecoinData);
      testData.stablecoinName = stablecoinData.name;
      await adminPages.adminPage.verifySuccessMessage(assetMessage.successMessage);
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
        name: testData.stablecoinName,
        totalSupply: stablecoinData.initialSupply,
      });
      await adminPages.adminPage.updateProvenCollateral({
        sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
        name: testData.stablecoinName,
        ...stableCoinUpdateProvenCollateralData,
      });
      await adminPages.adminPage.verifySuccessMessage(assetMessage.successMessage);
      await adminPages.adminPage.verifyProvenCollateral(stableCoinUpdateProvenCollateralData.amount);
      await adminPages.adminPage.mintToken({
        sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
        name: testData.stablecoinName,
        user: testData.userName,
        ...stableCoinMintTokenData,
      });
      await adminPages.adminPage.verifySuccessMessage(stableCoinMintTokenMessage.successMessage);
      await adminPages.adminPage.verifyTotalSupply(stableCoinMintTokenData.amount);
    } finally {
      await adminContext.close();
    }
  });
  test('Transfer assets to user and verify balance', async () => {
    await userPages.portfolioPage.goto();
    await userPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: stableCoinMintTokenData.amount,
    });
    await userPages.portfolioPage.transferAsset({
      assetName: testData.stablecoinName,
      walletAddress: testData.transferUserWalletAddress,
      ...stableCoinTransferData,
    });
    await userPages.adminPage.verifySuccessMessage(stableCoinTransferMessage.successMessage);

    const mintAmount = Number.parseFloat(stableCoinMintTokenData.amount);
    const transferAmount = Number.parseFloat(stableCoinTransferData.transferAmount);
    const expectedBalance = (mintAmount - transferAmount).toString();
    await userPages.portfolioPage.verifyAssetBalance(stableCoinMintTokenData.amount, expectedBalance);
  });
  test('Verify transfer user received the assets', async () => {
    await transferUserPages.portfolioPage.goto();
    await transferUserPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: stableCoinTransferData.transferAmount,
    });
  });
});
