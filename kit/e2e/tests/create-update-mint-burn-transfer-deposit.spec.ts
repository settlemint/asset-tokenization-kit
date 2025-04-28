import { type BrowserContext, test } from "@playwright/test";
import { Pages } from "../pages/pages";
import {
  depositData,
  depositUpdateCollateralData,
  depositMintTokenData,
  depositBurnData,
  depositTransferData,
} from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
import {
  adminUser,
  signUpTransferUserData,
  signUpUserData,
} from "../test-data/user-data";
import { ensureUserIsAdmin, fetchWalletAddressFromDB } from "../utils/db-utils";

const testData = {
  transferUserEmail: "",
  transferUserWalletAddress: "",
  transferUserName: "",
  depositName: "",
  currentTotalSupply: 0,
};

test.describe("Create, update collateral, mint and transfer deposit", () => {
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
  test("Admin user creates deposit, updates proven collateral, mints, burn deposits and allows user to transfer deposits", async ({
    browser,
  }) => {
    await adminPages.adminPage.createDeposit(depositData);
    testData.depositName = depositData.name;
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: depositData.sidebarAssetTypes,
      name: testData.depositName,
      totalSupply: depositData.initialSupply,
    });
    await adminPages.adminPage.clickAssetDetails(testData.depositName);
    await adminPages.adminPage.updateCollateral({
      ...depositUpdateCollateralData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.verifyCollateral(
      depositUpdateCollateralData.amount
    );
    await adminPages.adminPage.mintAsset({
      user: adminUser.name,
      ...depositMintTokenData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.verifyTotalSupply(depositMintTokenData.amount);
    await adminPages.adminPage.redeemBurnAsset({
      ...depositBurnData,
    });
    const mintAmount = Number.parseFloat(depositMintTokenData.amount);
    const burnAmount = Number.parseFloat(depositBurnData.amount);
    const newTotal = mintAmount - burnAmount;
    testData.currentTotalSupply = newTotal;
    await adminPages.adminPage.verifyTotalSupply(newTotal.toString());
    await adminPages.adminPage.allowUser({
      walletAddress: testData.transferUserWalletAddress,
      user: testData.transferUserName,
      pincode: depositData.pincode,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
  });
  test("Admin user transfer deposits to regular transfer user", async () => {
    await adminPages.portfolioPage.transferAsset({
      asset: testData.depositName,
      walletAddress: testData.transferUserWalletAddress,
      user: testData.transferUserName,
      ...depositTransferData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );

    const transferAmount = Number.parseFloat(
      depositTransferData.transferAmount
    );
    const expectedBalance = (
      testData.currentTotalSupply - transferAmount
    ).toString();
    await adminPages.adminPage.clickSidebarMenuItem("My assets");

    await adminPages.adminPage.filterAssetByName({
      name: testData.depositName,
      totalSupply: expectedBalance,
    });
  });
  test("Verify regular transfer user received deposits", async () => {
    await transferUserPages.portfolioPage.goto();
    await transferUserPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: depositTransferData.transferAmount,
      price: depositData.price,
    });
  });
});
