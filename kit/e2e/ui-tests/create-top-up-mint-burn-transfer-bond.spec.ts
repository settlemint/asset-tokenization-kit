import { type BrowserContext, test } from '@playwright/test';
import { Pages } from '../pages/pages';
import {
  bondBurnData,
  bondData,
  bondMintData,
  bondTransferData,
  stableCoinMintData,
  stableCoinUpdateCollateralData,
  stablecoinData,
  topUpData,
} from '../test-data/asset-data';
import { successMessageData } from '../test-data/message-data';
import { adminUser, signUpTransferUserData } from '../test-data/user-data';
import { ensureUserIsAdmin, fetchWalletAddressFromDB } from '../utils/db-utils';

const testData = {
  transferUserEmail: '',
  transferUserWalletAddress: '',
  transferUserName: '',
  stablecoinName: '',
  bondName: '',
  currentTotalSupply: 0,
};

test.describe('Create, top up, mint and transfer bonds', () => {
  test.describe.configure({ mode: 'serial' });
  let transferUserContext: BrowserContext | undefined;
  let adminContext: BrowserContext | undefined;
  let transferUserPages: ReturnType<typeof Pages>;
  let adminPages: ReturnType<typeof Pages>;

  test.beforeAll(async ({ browser }) => {
    try {
      transferUserContext = await browser.newContext();
      const transferUserPage = await transferUserContext.newPage();
      transferUserPages = Pages(transferUserPage);
      await transferUserPage.goto('/');
      await transferUserPages.signUpPage.signUp(signUpTransferUserData);
      testData.transferUserEmail = signUpTransferUserData.email;
      testData.transferUserName = signUpTransferUserData.name;
      const transferUserWalletAddress = await fetchWalletAddressFromDB(
        signUpTransferUserData.email
      );
      testData.transferUserWalletAddress = transferUserWalletAddress;

      await ensureUserIsAdmin(adminUser.email);
      adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      adminPages = Pages(adminPage);
      await adminPage.goto('/');
      await adminPages.signInPage.signInAsAdmin(adminUser);
      await adminPages.adminPage.goto();
    } catch (error) {
      if (transferUserContext) {
        await transferUserContext.close();
      }
      if (adminContext) {
        await adminContext.close();
      }
      throw error;
    }
  });

  test.afterAll(async () => {
    if (transferUserContext) {
      await transferUserContext.close();
    }
    if (adminContext) {
      await adminContext.close();
    }
  });

  test('Admin user creates stablecoin', async () => {
    await adminPages.adminPage.createStablecoin(stablecoinData);
    testData.stablecoinName = stablecoinData.name;
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageStablecoin
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
      name: testData.stablecoinName,
      totalSupply: stablecoinData.initialSupply,
    });
  });

  test('Admin user creates bond', async () => {
    const bondDataWithStablecoin = {
      ...bondData,
      underlyingAsset: testData.stablecoinName,
    };
    await adminPages.adminPage.createBond(bondDataWithStablecoin);
    testData.bondName = bondDataWithStablecoin.name;

    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageBond
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: bondData.sidebarAssetTypes,
      name: testData.bondName,
      totalSupply: bondData.initialSupply,
    });
  });

  test('Admin user updates collateral and mints stablecoin', async () => {
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
      name: testData.stablecoinName,
      totalSupply: stablecoinData.initialSupply,
    });
    await adminPages.adminPage.clickAssetDetails(testData.stablecoinName);
    await adminPages.adminPage.updateCollateral({
      ...stableCoinUpdateCollateralData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageStablecoin
    );
    await adminPages.adminPage.verifyCollateral(
      stableCoinUpdateCollateralData.amount
    );

    await adminPages.adminPage.mintAsset({
      user: adminUser.name,
      ...stableCoinMintData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageStablecoin
    );
    await adminPages.adminPage.verifyTotalSupply(stableCoinMintData.amount);
  });

  test('Admin user top up, mints and burns bond', async () => {
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: bondData.sidebarAssetTypes,
      name: testData.bondName,
      totalSupply: bondData.initialSupply,
    });
    await adminPages.adminPage.clickAssetDetails(testData.bondName);
    await adminPages.adminPage.topUpAsset({
      sidebarAssetTypes: bondData.sidebarAssetTypes,
      name: testData.bondName,
      amount: topUpData.amount,
      pincode: topUpData.pincode,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageBond
    );
    await adminPages.adminPage.mintAsset({
      user: adminUser.name,
      ...bondMintData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageBond
    );
    await adminPages.adminPage.verifyTotalSupply(topUpData.amount);
    await adminPages.adminPage.redeemBurnAsset({
      ...bondBurnData,
    });
    const mintAmount = Number.parseFloat(bondMintData.amount);
    const burnAmount = Number.parseFloat(bondBurnData.amount);
    const newTotal = mintAmount - burnAmount;
    testData.currentTotalSupply = newTotal;
    await adminPages.adminPage.verifyTotalSupply(newTotal.toString());
  });

  test('Admin user transfers bonds to regular transfer user', async () => {
    await adminPages.portfolioPage.transferAsset({
      asset: testData.bondName,
      walletAddress: testData.transferUserWalletAddress,
      user: testData.transferUserName,
      ...bondTransferData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageBond
    );

    const transferAmount = Number.parseFloat(bondTransferData.transferAmount);
    const expectedBalance = (
      testData.currentTotalSupply - transferAmount
    ).toString();
    await adminPages.adminPage.chooseSidebarMenuOption({
      sidebarOption: 'My assets',
      expectedUrlPattern: '**/portfolio/my-assets',
      expectedLocatorsToWaitFor: [
        adminPages.adminPage.getTableBodyLocator(),
        adminPages.adminPage.getFilterButtonLocator(),
      ],
    });
    await adminPages.adminPage.filterAssetByName({
      name: testData.bondName,
      totalSupply: expectedBalance,
    });
  });

  test('Verify regular transfer user received bonds', async () => {
    await transferUserPages.portfolioPage.goto();
    await transferUserPages.adminPage.chooseSidebarMenuOption({
      sidebarOption: 'My assets',
      expectedUrlPattern: '**/portfolio/my-assets',
      expectedLocatorsToWaitFor: [
        transferUserPages.adminPage.getTableBodyLocator(),
        transferUserPages.adminPage.getFilterButtonLocator(),
      ],
    });
    await transferUserPages.adminPage.filterAssetByName({
      name: testData.bondName,
      totalSupply: bondTransferData.transferAmount,
    });
  });
});
