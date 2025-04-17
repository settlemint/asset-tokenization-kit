import { type BrowserContext, test } from "@playwright/test";
import { Pages } from "../pages/pages";
import {
  bondData,
  bondMintTokenData,
  bondTransferData,
  stableCoinMintTokenData,
  stableCoinUpdateCollateralData,
  stablecoinData,
  topUpData,
} from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
import { adminUser, signUpTransferUserData } from "../test-data/user-data";
import { ensureUserIsAdmin, fetchWalletAddressFromDB } from "../utils/db-utils";

const testData = {
  userName: "",
  transferUserEmail: "",
  transferUserWalletAddress: "",
  transferUserName: "",
  stablecoinName: "",
  bondName: "",
};

test.describe("Create, top up, mint and transfer bonds", () => {
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

  test("Admin user creates stablecoin", async () => {
    await adminPages.adminPage.createStablecoin(stablecoinData);
    testData.stablecoinName = stablecoinData.name;
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
      name: testData.stablecoinName,
      totalSupply: stablecoinData.initialSupply,
    });
  });

  test("Admin user creates bond", async () => {
    const bondDataWithStablecoin = {
      ...bondData,
      underlyingAsset: testData.stablecoinName,
    };
    await adminPages.adminPage.createBond(bondDataWithStablecoin);
    testData.bondName = bondDataWithStablecoin.name;

    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: bondData.sidebarAssetTypes,
      name: testData.bondName,
      totalSupply: bondData.initialSupply,
    });
  });

  test("Admin user update collateral and mint stablecoin", async () => {
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
      name: testData.stablecoinName,
      totalSupply: stablecoinData.initialSupply,
    });
    await adminPages.adminPage.clickAssetDetails(testData.stablecoinName);
    await adminPages.adminPage.updateCollateral({
      sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
      name: testData.stablecoinName,
      ...stableCoinUpdateCollateralData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.verifyCollateral(
      stableCoinUpdateCollateralData.amount
    );

    await adminPages.adminPage.mintAsset({
      sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
      user: adminUser.name,
      ...stableCoinMintTokenData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.verifyTotalSupply(
      stableCoinMintTokenData.amount
    );
  });

  test("Admin user top up and mint bond", async () => {
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
      assetMessage.successMessage
    );
    await adminPages.adminPage.mintAsset({
      sidebarAssetTypes: bondData.sidebarAssetTypes,
      user: adminUser.name,
      ...bondMintTokenData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.verifyTotalSupply(topUpData.amount);
  });

  test("Admin user transfer bonds to user and verify balance", async () => {
    await adminPages.portfolioPage.transferAsset({
      asset: testData.bondName,
      walletAddress: testData.transferUserWalletAddress,
      user: testData.transferUserName,
      ...bondTransferData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );

    const mintAmount = Number.parseFloat(bondMintTokenData.amount);
    const transferAmount = Number.parseFloat(bondTransferData.transferAmount);
    const expectedBalance = (mintAmount - transferAmount).toString();
    await adminPages.adminPage.clickSidebarMenuItem("My assets");

    await adminPages.adminPage.filterAssetByName({
      name: testData.bondName,
      totalSupply: expectedBalance,
    });
  });

  test("Verify transfer user received bonds", async () => {
    await transferUserPages.portfolioPage.goto();
    await transferUserPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: bondTransferData.transferAmount,
      price: bondData.price,
    });
  });
});
