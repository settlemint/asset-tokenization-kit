import { type BrowserContext, test } from "@playwright/test";
import { Pages } from "../pages/pages";
import {
  bondData,
  cryptocurrencyData,
  equityData,
  fundData,
  stablecoinData,
} from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
import { adminUser } from "../test-data/user-data";
import { ensureUserIsAdmin } from "../utils/db-utils";

const testData = {
  stablecoinName: "",
};

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

  test.describe
    .serial("Dependent assets, first create stablecoin and then create dependent bond", () => {
    test("Create Stablecoin asset", async () => {
      await adminPages.adminPage.createStablecoin(stablecoinData);
      testData.stablecoinName = stablecoinData.name;
      await adminPages.adminPage.verifySuccessMessage(
        assetMessage.successMessage
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
        name: stablecoinData.name,
        totalSupply: stablecoinData.initialSupply,
      });
    });

    test("Create Bond asset", async () => {
      const bondDataWithStablecoin = {
        ...bondData,
        underlyingAsset: testData.stablecoinName,
      };
      await adminPages.adminPage.createBond(bondDataWithStablecoin);
      await adminPages.adminPage.verifySuccessMessage(
        assetMessage.successMessage
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: bondDataWithStablecoin.sidebarAssetTypes,
        name: bondDataWithStablecoin.name,
        totalSupply: bondDataWithStablecoin.initialSupply,
      });
    });
  });

  test.describe("Create independent assets", () => {
    test("Create Cryptocurrency asset", async () => {
      await adminPages.adminPage.createCryptocurrency(cryptocurrencyData);
      await adminPages.adminPage.verifySuccessMessage(
        assetMessage.successMessage
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: cryptocurrencyData.sidebarAssetTypes,
        name: cryptocurrencyData.name,
        totalSupply: cryptocurrencyData.initialSupply,
      });
    });

    test("Create Equity asset", async () => {
      await adminPages.adminPage.createEquity(equityData);
      await adminPages.adminPage.verifySuccessMessage(
        assetMessage.successMessage
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: equityData.sidebarAssetTypes,
        name: equityData.name,
        totalSupply: equityData.initialSupply,
      });
    });

    test("Create Fund asset", async () => {
      await adminPages.adminPage.createFund(fundData);
      await adminPages.adminPage.verifySuccessMessage(
        assetMessage.successMessage
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: fundData.sidebarAssetTypes,
        name: fundData.name,
        totalSupply: fundData.initialSupply,
      });
    });
  });
});
