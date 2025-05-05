import { type BrowserContext, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { equityData } from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
import { adminUser } from "../test-data/user-data";
import { ensureUserIsAdmin } from "../utils/db-utils";
test.describe("Equity Creation Validation", () => {
  let adminContext: BrowserContext;
  let adminPages: ReturnType<typeof Pages>;
  let createAssetForm: CreateAssetForm;

  test.beforeAll(async ({ browser }) => {
    await ensureUserIsAdmin(adminUser.email);
    adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    adminPages = Pages(adminPage);
    createAssetForm = new CreateAssetForm(adminPage);
    await adminPages.signInPage.signInAsAdmin(adminUser);
    await adminPages.adminPage.goto();
  });

  test.afterAll(async () => {
    await adminContext.close();
  });

  test.describe("First Screen - Basic Fields", () => {
    test.beforeAll(async () => {
      await createAssetForm.selectAssetType(equityData.assetType);
    });
    test("validates name field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "",
        symbol: "TEQ",
        decimals: "18",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter text");
    });
    test("validates symbol field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "",
        decimals: "18",
        isin: "",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter text");
    });
    test("validates symbol field is with lower case", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "teq",
        decimals: "18",
        isin: "",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Please enter text in the correct asset-symbol format"
      );
    });
    test("verifies input length restrictions", async () => {
      await createAssetForm.verifyInputAttribute("Name", "maxlength", "50");
      await createAssetForm.verifyInputAttribute("Symbol", "maxlength", "10");
    });
    test("validates ISIN format", async () => {
      await createAssetForm.fillBasicFields({
        isin: "invalid-isin",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Please enter text in the correct isin format"
      );
    });
    test("validates ISIN length constraints", async () => {
      await createAssetForm.fillBasicFields({
        isin: "US0000000000000",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Please enter text in the correct isin format"
      );
    });
    test("validates empty decimals", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ",
        decimals: "",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid value");
    });
    test("validates decimals range", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ",
        decimals: "19",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid value");
    });
    test("verifies default decimals field", async () => {
      await createAssetForm.verifyInputAttribute("Decimals", "value", "18");
    });
  });

  test.describe("Second Screen - Configuration", () => {
    test.beforeAll(async () => {
      await createAssetForm.fillBasicFields({
        name: equityData.name,
        symbol: equityData.symbol,
        decimals: equityData.decimals,
        isin: equityData.isin,
      });
      await createAssetForm.clickOnContinueButton();
    });
    test("validates required fields are empty", async () => {
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter text");
    });
    test("validates equity class selection", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        equityCategory: "Common Equity",
        price: "1",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter text");
    });
    test("validates price is required", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        equityClass: "Common Equity",
        equityCategory: "Common Equity",
        price: "",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid number");
    });
    test("validates price maximum value", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        equityClass: "Common Equity",
        equityCategory: "Common Equity",
        price: "9007199254740992",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Please enter a number no greater than 9007199254740991"
      );
    });
    test("verifies default currency is EUR", async () => {
      await createAssetForm.verifyCurrencyValue("EUR");
    });
  });
});

test.describe("Create equity asset", () => {
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
});
