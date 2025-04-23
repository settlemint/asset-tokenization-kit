import { type BrowserContext, test } from "@playwright/test";
import { Pages } from "../pages/pages";
import {
  stableCoinMintTokenData,
  stableCoinTransferData,
  stableCoinUpdateCollateralData,
  stablecoinData,
} from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
import {
  adminUser,
  signUpTransferUserData,
  signUpUserData,
} from "../test-data/user-data";
import { ensureUserIsAdmin, fetchWalletAddressFromDB } from "../utils/db-utils";

const testData = {
  userName: "",
  transferUserEmail: "",
  transferUserWalletAddress: "",
  transferUserName: "",
  stablecoinName: "",
};

test.describe("Create, update collateral, mint and transfer stablecoin", () => {
  test.describe.configure({ mode: "serial" });
  let userContext: BrowserContext | undefined;
  let transferUserContext: BrowserContext | undefined;
  let userPages: ReturnType<typeof Pages>;
  let transferUserPages: ReturnType<typeof Pages>;
  test.beforeAll(async ({ browser }) => {
    try {
      userContext = await browser.newContext();
      const userPage = await userContext.newPage();
      userPages = Pages(userPage);
      await userPage.goto("/");
      await userPages.signUpPage.signUp(signUpUserData);
      testData.userName = signUpUserData.name;
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
  test("Admin user creates stablecoin, updates proven collateral and mints tokens", async ({
    browser,
  }) => {
    await ensureUserIsAdmin(adminUser.email);
    const adminContext = await browser.newContext();
    try {
      const adminPage = await adminContext.newPage();
      const adminPages = Pages(adminPage);
      await adminPage.goto("/");
      await adminPages.signInPage.signInAsAdmin(adminUser);
      await adminPages.adminPage.goto();
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
        user: testData.userName,
        ...stableCoinMintTokenData,
      });
      await adminPages.adminPage.verifySuccessMessage(
        assetMessage.successMessage
      );
      await adminPages.adminPage.verifyTotalSupply(
        stableCoinMintTokenData.amount
      );
    } finally {
      await adminContext.close();
    }
  });
  test("Transfer stablecoin to regular transfer user", async () => {
    const [firstName, lastName] = testData.transferUserName
      .split(" ")
      .slice(0, 2);
    const contactName = `${firstName} ${lastName}`.trim();

    await userPages.portfolioPage.goto();
    await userPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: stableCoinMintTokenData.amount,
      price: stablecoinData.price,
    });

    await userPages.portfolioPage.addContact({
      address: testData.transferUserWalletAddress,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
    });

    await userPages.portfolioPage.verifyContactExists({
      name: contactName,
      walletAddress: testData.transferUserWalletAddress,
    });

    await userPages.portfolioPage.transferAsset({
      asset: testData.stablecoinName,
      walletAddress: testData.transferUserWalletAddress,
      user: contactName,
      ...stableCoinTransferData,
    });
    await userPages.adminPage.verifySuccessMessage(assetMessage.successMessage);

    const mintAmount = Number.parseFloat(stableCoinMintTokenData.amount);
    const transferAmount = Number.parseFloat(
      stableCoinTransferData.transferAmount
    );
    const expectedBalance = (mintAmount - transferAmount).toString();
    await userPages.portfolioPage.verifyAssetBalance(
      stableCoinMintTokenData.amount,
      expectedBalance,
      stablecoinData.price
    );
  });
  test("Verify transfer user received stablecoins", async () => {
    await transferUserPages.portfolioPage.goto();
    await transferUserPages.portfolioPage.verifyPortfolioAssetAmount({
      expectedAmount: stableCoinTransferData.transferAmount,
      price: stablecoinData.price,
    });
  });
});
