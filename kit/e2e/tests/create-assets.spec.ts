import { type BrowserContext, test } from "@playwright/test";
import { Pages } from "../pages/pages";
import {
  cryptocurrencyData,
  depositData,
  equityData,
  fundData,
} from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
import { adminUser } from "../test-data/user-data";
import { ensureUserIsAdmin } from "../utils/db-utils";

test.describe("Create assets", () => {
  let adminContext: BrowserContext;
  let adminPages: ReturnType<typeof Pages>;

  test.beforeAll(async ({ browser }) => {
    await ensureUserIsAdmin(adminUser.email);

    adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    adminPages = Pages(adminPage);
    await adminPages.signInPage.signInAsAdmin(adminUser);
    await adminPages.adminPage.goto();
  });

  test.afterAll(async () => {
    await adminContext.close();
  });

  test.describe("Create independent assets", () => {
    test("Create Deposit asset", async () => {
      await adminPages.adminPage.createDeposit(depositData);
      await adminPages.adminPage.verifySuccessMessage(
        assetMessage.successMessage
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: depositData.sidebarAssetTypes,
        name: depositData.name,
        totalSupply: depositData.initialSupply,
      });
    });
  });
});
