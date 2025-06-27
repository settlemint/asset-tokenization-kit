import { type BrowserContext, test } from '@playwright/test';
import { Pages } from '../pages/pages';
import {
  equityBurnData,
  equityData,
  equityMintData,
  equityTransferData,
} from '../test-data/asset-data';
import { successMessageData } from '../test-data/message-data';
import { adminUser, signUpTransferUserData } from '../test-data/user-data';
import { ensureUserIsAdmin, fetchWalletAddressFromDB } from '../utils/db-utils';

const testData = {
  transferUserEmail: '',
  transferUserWalletAddress: '',
  transferUserName: '',
  equityName: '',
  currentTotalSupply: 0,
};

test.describe('Create, mint, burn and transfer equity', () => {
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
  test('Admin user creates, mints and burns equity', async ({ browser }) => {
    await adminPages.adminPage.createEquity(equityData);
    testData.equityName = equityData.name;
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageEquity
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: equityData.sidebarAssetTypes,
      name: testData.equityName,
      totalSupply: equityData.initialSupply,
    });
    await adminPages.adminPage.clickAssetDetails(testData.equityName);
    await adminPages.adminPage.mintAsset({
      user: adminUser.name,
      ...equityMintData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageEquity
    );
    await adminPages.adminPage.verifyTotalSupply(equityMintData.amount);
    await adminPages.adminPage.redeemBurnAsset({
      ...equityBurnData,
    });
    const mintAmount = Number.parseFloat(equityMintData.amount);
    const burnAmount = Number.parseFloat(equityBurnData.amount);
    const newTotal = mintAmount - burnAmount;
    testData.currentTotalSupply = newTotal;
    await adminPages.adminPage.verifyTotalSupply(newTotal.toString());
  });
  test('Admin user transfers equity to regular transfer user', async () => {
    await adminPages.portfolioPage.transferAsset({
      asset: testData.equityName,
      walletAddress: testData.transferUserWalletAddress,
      user: testData.transferUserName,
      ...equityTransferData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageEquity
    );

    const transferAmount = Number.parseFloat(equityTransferData.transferAmount);
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
      name: testData.equityName,
      totalSupply: expectedBalance,
    });
  });

  test('Verify regular transfer user received equity', async () => {
    await transferUserPages.portfolioPage.goto();
    await transferUserPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: equityTransferData.transferAmount,
      price: equityData.price,
    });
  });
});
