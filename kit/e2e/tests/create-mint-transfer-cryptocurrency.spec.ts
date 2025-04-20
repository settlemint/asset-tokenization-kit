import { type BrowserContext, test } from "@playwright/test";
import { Pages } from "../pages/pages";
import {
  cryptocurrencyData,
  cryptocurrencyMintTokenData,
  cryptocurrencyTransferData,
  cryptocurrencyDataAmountAfterMint,
} from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
import { adminUser, signUpTransferUserData } from "../test-data/user-data";
import { ensureUserIsAdmin, fetchWalletAddressFromDB } from "../utils/db-utils";

const testData = {
  transferUserEmail: "",
  transferUserWalletAddress: "",
  transferUserName: "",
  cryptocurrencyName: "",
};

test.describe("Create, mint and transfer cryptocurrency", () => {
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
  test("Admin user creates, mint cryptocurrency and transfer to user", async ({
    browser,
  }) => {
    await adminPages.adminPage.createCryptocurrency(cryptocurrencyData);
    testData.cryptocurrencyName = cryptocurrencyData.name;
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: cryptocurrencyData.sidebarAssetTypes,
      name: testData.cryptocurrencyName,
      totalSupply: cryptocurrencyData.initialSupply,
    });
    await adminPages.adminPage.clickAssetDetails(testData.cryptocurrencyName);
    await adminPages.adminPage.mintAsset({
      sidebarAssetTypes: cryptocurrencyData.sidebarAssetTypes,
      user: adminUser.name,
      ...cryptocurrencyMintTokenData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.verifyTotalSupply(
      cryptocurrencyDataAmountAfterMint.amount
    );
  });
  test("Admin user transfer cryptocurrency to regular tranfer user and verify balance", async () => {
    await adminPages.portfolioPage.transferAsset({
      asset: testData.cryptocurrencyName,
      walletAddress: testData.transferUserWalletAddress,
      user: testData.transferUserName,
      ...cryptocurrencyTransferData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );

    const mintAmount = Number.parseFloat(
      cryptocurrencyDataAmountAfterMint.amount
    );
    const transferAmount = Number.parseFloat(
      cryptocurrencyTransferData.transferAmount
    );
    const expectedBalance = (mintAmount - transferAmount).toString();
    await adminPages.adminPage.clickSidebarMenuItem("My assets");

    await adminPages.adminPage.filterAssetByName({
      name: testData.cryptocurrencyName,
      totalSupply: expectedBalance,
    });
  });

  test("Verify regular transfer user received cryptocurrency", async () => {
    await transferUserPages.portfolioPage.goto();
    await transferUserPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: cryptocurrencyTransferData.transferAmount,
      price: cryptocurrencyData.price,
    });
  });
});
