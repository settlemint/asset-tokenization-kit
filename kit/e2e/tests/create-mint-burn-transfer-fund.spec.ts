import { type BrowserContext, test } from "@playwright/test";
import { Pages } from "../pages/pages";
import {
  fundBurnData,
  fundData,
  fundMintTokenData,
  fundTransferData,
} from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
import { adminUser, signUpTransferUserData } from "../test-data/user-data";
import { ensureUserIsAdmin, fetchWalletAddressFromDB } from "../utils/db-utils";

const testData = {
  transferUserEmail: "",
  transferUserWalletAddress: "",
  transferUserName: "",
  fundName: "",
  currentTotalSupply: 0,
};

const supplyTracking = {
  currentTotalSupply: "",
};

test.describe("Create, mint, transfer and burn fund", () => {
  test.describe.configure({ mode: "serial" });
  let userContext: BrowserContext | undefined;
  let transferUserContext: BrowserContext | undefined;
  let adminContext: BrowserContext | undefined;
  let transferUserPages: ReturnType<typeof Pages>;
  let adminPages: ReturnType<typeof Pages>;

  test.beforeAll(async ({ browser }) => {
    try {
      transferUserContext = await browser.newContext();
      const transferUserPage = await transferUserContext.newPage();
      transferUserPages = Pages(transferUserPage);
      await transferUserPage.goto("/");
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
      await adminPage.goto("/");
      await adminPages.signInPage.signInAsAdmin(adminUser);
      await adminPages.adminPage.goto();
    } catch (error) {
      if (userContext) {
        await userContext.close();
      }
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
    if (userContext) {
      await userContext.close();
    }
    if (transferUserContext) {
      await transferUserContext.close();
    }
    if (adminContext) {
      await adminContext.close();
    }
  });
  test("Admin user creates, mint and burn fund", async ({ browser }) => {
    await adminPages.adminPage.createFund(fundData);
    testData.fundName = fundData.name;
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: fundData.sidebarAssetTypes,
      name: testData.fundName,
      totalSupply: fundData.initialSupply,
    });
    await adminPages.adminPage.clickAssetDetails(testData.fundName);
    await adminPages.adminPage.mintAsset({
      user: adminUser.name,
      ...fundMintTokenData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.verifyTotalSupply(fundMintTokenData.amount);
    await adminPages.adminPage.redeemBurnAsset({
      ...fundBurnData,
    });
    const mintAmount = Number.parseFloat(fundMintTokenData.amount);
    const burnAmount = Number.parseFloat(fundBurnData.amount);
    const newTotal = mintAmount - burnAmount;
    testData.currentTotalSupply = newTotal;
    await adminPages.adminPage.verifyTotalSupply(newTotal.toString());
  });
  test("Admin user transfer, burn  to regular transfer user and verify balance", async () => {
    await adminPages.portfolioPage.transferAsset({
      asset: testData.fundName,
      walletAddress: testData.transferUserWalletAddress,
      user: testData.transferUserName,
      ...fundTransferData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );

    const transferAmount = Number.parseFloat(fundTransferData.transferAmount);
    const expectedBalance = (
      testData.currentTotalSupply - transferAmount
    ).toString();
    await adminPages.adminPage.clickSidebarMenuItem("My assets");

    await adminPages.adminPage.filterAssetByName({
      name: testData.fundName,
      totalSupply: expectedBalance,
    });
  });

  test("Verify regular transfer user received fund", async () => {
    await transferUserPages.portfolioPage.goto();
    await transferUserPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: fundTransferData.transferAmount,
      price: fundData.price,
    });
  });
});
