import { type BrowserContext, test } from '@playwright/test';
import { Pages } from '../pages/pages';
import {
  cryptocurrencyData,
  cryptocurrencyDataAmountAfterMint,
  cryptocurrencyMintData,
  equityData,
  equityMintData,
  xvpSettlementData,
} from '../test-data/asset-data';
import { successMessageData } from '../test-data/message-data';
import {
  adminRecipient,
  adminUser,
  userRecipient,
} from '../test-data/user-data';
import { ensureUserIsAdmin } from '../utils/db-utils';

const testData = {
  xvpUserEmail: '',
  xvpUserWalletAddress: '',
  xvpUserName: '',
  cryptocurrencyName: '',
  currentTotalSupply: 0,
  equityName: '',
};

test.describe('Create and approve XvP settlement', () => {
  test.describe.configure({ mode: 'serial' });
  let adminContext: BrowserContext | undefined;
  let adminRecipientContext: BrowserContext | undefined;
  let userRecipientContext: BrowserContext | undefined;
  let adminPages: ReturnType<typeof Pages>;
  let adminRecipientPages: ReturnType<typeof Pages>;
  let userRecipientPages: ReturnType<typeof Pages>;

  test.beforeAll(async ({ browser }) => {
    try {
      await ensureUserIsAdmin(adminUser.email);
      adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      adminPages = Pages(adminPage);
      await adminPage.goto('/');
      await adminPages.signInPage.signInAsAdmin(adminUser);
      await adminPages.adminPage.goto();

      adminRecipientContext = await browser.newContext();
      const adminRecipientPage = await adminRecipientContext.newPage();
      adminRecipientPages = Pages(adminRecipientPage);
      await adminRecipientPage.goto('/');
      await adminRecipientPages.signUpPage.signUp(adminRecipient);
      await ensureUserIsAdmin(adminRecipient.email);

      userRecipientContext = await browser.newContext();
      const userRecipientPage = await userRecipientContext.newPage();
      userRecipientPages = Pages(userRecipientPage);
      await userRecipientPage.goto('/');
      await userRecipientPages.signUpPage.signUp(userRecipient);
    } catch (error) {
      if (adminContext) {
        await adminContext.close();
      }
      if (adminRecipientContext) {
        await adminRecipientContext.close();
      }
      if (userRecipientContext) {
        await userRecipientContext.close();
      }
      throw error;
    }
  });

  test.afterAll(async () => {
    if (adminContext) {
      await adminContext.close();
    }
    if (adminRecipientContext) {
      await adminRecipientContext.close();
    }
    if (userRecipientContext) {
      await userRecipientContext.close();
    }
  });
  test('Admin user creates and mints cryptocurrency', async () => {
    await adminPages.adminPage.createCryptocurrency(cryptocurrencyData);
    testData.cryptocurrencyName = cryptocurrencyData.name;
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageCryptocurrency
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: cryptocurrencyData.sidebarAssetTypes,
      name: testData.cryptocurrencyName,
      totalSupply: cryptocurrencyData.initialSupply,
    });
    await adminPages.adminPage.clickAssetDetails(testData.cryptocurrencyName);
    await adminPages.adminPage.mintAsset({
      user: adminUser.name,
      ...cryptocurrencyMintData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessage
    );
    await adminPages.adminPage.verifyTotalSupply(
      cryptocurrencyDataAmountAfterMint.amount
    );
  });
  test('Admin user creates and mints equity', async () => {
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
      successMessageData.successMessage
    );
    await adminPages.adminPage.verifyTotalSupply(equityMintData.amount);
  });
  test('Admin user creates XvP settlement with auto execute', async () => {
    await adminPages.adminPage.selectFooterDropdownOption('My portfolio');
    await adminPages.adminPage.chooseSidebarMenuOption({
      sidebarOption: 'XvP',
      expectedUrlPattern: '**/trades/xvp',
      expectedLocatorsToWaitFor: [
        adminPages.adminPage.getTableBodyLocator(),
        adminPages.adminPage.getFilterButtonLocator(),
      ],
    });
    await adminPages.xvpSettlementPage.clickCreateNewXvpSettlementButton();
    await adminPages.xvpSettlementPage.configureXvpAssetFlows({
      flows: [
        {
          fromUser: adminUser.name,
          toUser: adminRecipient.name,
          assetName: testData.cryptocurrencyName,
          amount: xvpSettlementData.cryptocurrencyAmount,
        },
        {
          fromUser: adminUser.name,
          toUser: userRecipient.name,
          assetName: testData.equityName,
          amount: xvpSettlementData.equityAmount,
        },
      ],
    });
    await adminPages.xvpSettlementPage.configureXvpSettlementConfiguration({
      expiryDateTime: xvpSettlementData.expiryDateTime,
      autoExecute: xvpSettlementData.autoExecute,
    });
    await adminPages.xvpSettlementPage.reviewAndConfirmXvpSettlement({
      pincode: xvpSettlementData.pincode,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessage
    );
    await adminPages.xvpSettlementPage.chooseCreatedXvpSettlement({
      settlementStatus: 'Pending',
      settlementExpiry: 'tomorrow',
    });
    await adminPages.xvpSettlementPage.approveXvpSettlement({
      pincode: adminRecipient.pincode,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessage
    );
    await adminPages.xvpSettlementPage.verifySettlementStatus({
      status: 'Executed',
    });
  });
  test('Verify Admin recipient receives cryptocurrency', async () => {
    await adminRecipientPages.portfolioPage.goto();
    await adminRecipientPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: xvpSettlementData.cryptocurrencyAmount,
      price: cryptocurrencyData.price,
    });
  });
  test('Verify User recipient receives equity', async () => {
    await userRecipientPages.portfolioPage.goto();
    await userRecipientPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: xvpSettlementData.equityAmount,
      price: equityData.price,
    });
  });
});
