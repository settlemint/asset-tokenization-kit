import { type BrowserContext, test } from "@playwright/test";
import { Pages } from "../pages/pages";
import {
  equityData,
  equityMintTokenData,
  equityTransferData,
} from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
import { adminUser, signUpTransferUserData } from "../test-data/user-data";
import { ensureUserIsAdmin, fetchWalletAddressFromDB } from "../utils/db-utils";

const testData = {
  transferUserEmail: "",
  transferUserWalletAddress: "",
  transferUserName: "",
  equityName: "",
};

test.describe("Create, mint and transfer equity", () => {
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
  test("Admin user creates, mint equity and transfer to user", async ({
    browser,
  }) => {
    await adminPages.adminPage.createEquity(equityData);
    testData.equityName = equityData.name;
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: equityData.sidebarAssetTypes,
      name: testData.equityName,
      totalSupply: equityData.initialSupply,
    });
    await adminPages.adminPage.clickAssetDetails(testData.equityName);
    await adminPages.adminPage.mintAsset({
      sidebarAssetTypes: equityData.sidebarAssetTypes,
      user: adminUser.name,
      ...equityMintTokenData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.verifyTotalSupply(equityMintTokenData.amount);
  });
  test("Admin user transfer equity to regular tranfer user and verify balance", async () => {
    await adminPages.portfolioPage.transferAsset({
      asset: testData.equityName,
      walletAddress: testData.transferUserWalletAddress,
      user: testData.transferUserName,
      ...equityTransferData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );

    const mintAmount = Number.parseFloat(equityMintTokenData.amount);
    const transferAmount = Number.parseFloat(equityTransferData.transferAmount);
    const expectedBalance = (mintAmount - transferAmount).toString();
    await adminPages.adminPage.clickSidebarMenuItem("My assets");

    await adminPages.adminPage.filterAssetByName({
      name: testData.equityName,
      totalSupply: expectedBalance,
    });
  });

  test("Verify regular transfer user received equity", async () => {
    await transferUserPages.portfolioPage.goto();
    await transferUserPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: equityTransferData.transferAmount,
      price: equityData.price,
    });
  });
});
