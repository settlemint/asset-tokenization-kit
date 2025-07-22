import { type BrowserContext, test } from "@playwright/test";
import { Pages } from "../pages/pages";
import {
  stableCoinBurnData,
  stableCoinMintData,
  stableCoinTransferData,
  stableCoinUpdateCollateralData,
  stablecoinData,
} from "../test-data/asset-data";
import { successMessageData } from "../test-data/message-data";
import { adminUser, signUpTransferUserData } from "../test-data/user-data";
import { ensureUserIsAdmin, fetchWalletAddressFromDB } from "../utils/db-utils";

const testData = {
  transferUserEmail: "",
  transferUserWalletAddress: "",
  transferUserName: "",
  stablecoinName: "",
  currentTotalSupply: 0,
};

test.describe("Create, update collateral, mint, burn and transfer stablecoin", () => {
  test.describe.configure({ mode: "serial" });
  let transferUserContext: BrowserContext | undefined;
  let transferUserPages: ReturnType<typeof Pages>;
  let adminContext: BrowserContext | undefined;
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
  test("Admin user creates stablecoin, updates proven collateral, mints and burns stablecoins", async ({
    browser: _browser,
  }) => {
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
    await adminPages.adminPage.redeemBurnAsset({
      ...stableCoinBurnData,
    });
    const mintAmount = Number.parseFloat(stableCoinMintData.amount);
    const burnAmount = Number.parseFloat(stableCoinBurnData.amount);
    const newTotal = mintAmount - burnAmount;
    testData.currentTotalSupply = newTotal;
    await adminPages.adminPage.verifyTotalSupply(newTotal.toString());
  });
  test("Admin user transfers stablecoin to regular transfer user", async () => {
    await adminPages.portfolioPage.transferAsset({
      asset: testData.stablecoinName,
      walletAddress: testData.transferUserWalletAddress,
      user: testData.transferUserName,
      ...stableCoinTransferData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageStablecoin
    );

    const transferAmount = Number.parseFloat(
      stableCoinTransferData.transferAmount
    );
    const expectedBalance = (
      testData.currentTotalSupply - transferAmount
    ).toString();
    await adminPages.adminPage.chooseSidebarMenuOption({
      sidebarOption: "My assets",
      expectedUrlPattern: "**/portfolio/my-assets",
      expectedLocatorsToWaitFor: [
        adminPages.adminPage.getTableBodyLocator(),
        adminPages.adminPage.getFilterButtonLocator(),
      ],
    });
    await adminPages.adminPage.filterAssetByName({
      name: testData.stablecoinName,
      totalSupply: expectedBalance,
    });
  });
  test("Verify regular transfer user received stablecoins", async () => {
    await transferUserPages.portfolioPage.goto();
    await transferUserPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: stableCoinTransferData.transferAmount,
      price: stablecoinData.price,
    });
  });
});
