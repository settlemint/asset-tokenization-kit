import { type BrowserContext, test } from "@playwright/test";
import { Pages } from "../pages/pages";
import {
  fundBurnData,
  fundData,
  fundMintData,
  fundTransferData,
} from "../test-data/asset-data";
import { successMessageData } from "../test-data/message-data";
import { adminUser, signUpTransferUserData } from "../test-data/user-data";
import { ensureUserIsAdmin, fetchWalletAddressFromDB } from "../utils/db-utils";

const testData = {
  transferUserEmail: "",
  transferUserWalletAddress: "",
  transferUserName: "",
  fundName: "",
  currentTotalSupply: 0,
};

test.describe("Create, mint, burn and transfer fund", () => {
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
  test("Admin user creates, mints and burns fund", async () => {
    await adminPages.adminPage.createFund(fundData);
    testData.fundName = fundData.name;
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageFund
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: fundData.sidebarAssetTypes,
      name: testData.fundName,
      totalSupply: fundData.initialSupply,
    });
    await adminPages.adminPage.clickAssetDetails(testData.fundName);
    await adminPages.adminPage.mintAsset({
      user: adminUser.name,
      ...fundMintData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageFund
    );
    await adminPages.adminPage.verifyTotalSupply(fundMintData.amount);
    await adminPages.adminPage.redeemBurnAsset({
      ...fundBurnData,
    });
    const mintAmount = Number.parseFloat(fundMintData.amount);
    const burnAmount = Number.parseFloat(fundBurnData.amount);
    const newTotal = mintAmount - burnAmount;
    testData.currentTotalSupply = newTotal;
    await adminPages.adminPage.verifyTotalSupply(newTotal.toString());
  });
  test("Admin user transfers fund to regular transfer user", async () => {
    await adminPages.portfolioPage.transferAsset({
      asset: testData.fundName,
      walletAddress: testData.transferUserWalletAddress,
      user: testData.transferUserName,
      ...fundTransferData,
    });
    await adminPages.adminPage.verifySuccessMessage(
      successMessageData.successMessageFund
    );

    const transferAmount = Number.parseFloat(fundTransferData.transferAmount);
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
