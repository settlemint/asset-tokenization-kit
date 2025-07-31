import { type BrowserContext, test } from "@playwright/test";
import { Pages } from "../pages/pages";
import {
  cryptocurrencyBurnData,
  cryptocurrencyData,
  cryptocurrencyDataAmountAfterMint,
  cryptocurrencyMintData,
  cryptocurrencyTransferData,
} from "../test-data/asset-data";
import { successMessageData } from "../test-data/message-data";
import { adminUser, signUpTransferUserData } from "../test-data/user-data";
import { ensureUserIsAdmin, fetchWalletAddressFromDB } from "../utils/db-utils";

const testData = {
  transferUserEmail: "",
  transferUserWalletAddress: "",
  transferUserName: "",
  cryptocurrencyName: "",
  currentTotalSupply: 0,
};

test.describe("Create, mint, burn and transfer cryptocurrency", () => {
  test.describe.configure({ mode: "serial" });
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
  test("Admin user creates, mints and burns cryptocurrency", async ({
    browser: _browser,
  }) => {
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
      successMessageData.successMessageCryptocurrency
    );
    await adminPages.adminPage.verifyTotalSupply(
      cryptocurrencyDataAmountAfterMint.amount
    );
    await adminPages.adminPage.redeemBurnAsset({
      ...cryptocurrencyBurnData,
    });
    const mintAmount = Number.parseFloat(
      cryptocurrencyDataAmountAfterMint.amount
    );
    const burnAmount = Number.parseFloat(cryptocurrencyBurnData.amount);
    const newTotal = mintAmount - burnAmount;
    testData.currentTotalSupply = newTotal;
    await adminPages.adminPage.verifyTotalSupply(newTotal.toString());
  });
  test("Admin user transfers cryptocurrency to regular transfer user", async () => {
    await adminPages.portfolioPage.transferAsset({
      asset: testData.cryptocurrencyName,
      walletAddress: testData.transferUserWalletAddress,
      user: testData.transferUserName,
      ...cryptocurrencyTransferData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageCryptocurrency
    );

    const transferAmount = Number.parseFloat(
      cryptocurrencyTransferData.transferAmount
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
