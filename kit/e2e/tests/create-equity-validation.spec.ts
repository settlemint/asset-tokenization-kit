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
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Expected string length greater or equal to 1"
      );
    });
    test("validates symbol field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "",
        isin: "",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Expected string to match 'asset-symbol' format"
      );
    });
    test("validates symbol field is with lower case", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "teq",
        isin: "",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Expected string to match 'asset-symbol' format"
      );
    });
    test("validates symbol field can not contain special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ$",
      });
      await createAssetForm.expectErrorMessage(
        "Expected string to match 'asset-symbol' format"
      );
    });
    //Update this check name constraint after this ticket is fixed jelena/eng-3108-asset-designerno-constraint-in-asset-name-field
    test("verifies input length restrictions", async () => {
      // await createAssetForm.verifyInputAttribute("Name", "maxlength", "50");
      await createAssetForm.verifyInputAttribute("Symbol", "maxlength", "10");
    });
    test("validates ISIN format", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ",
        isin: "invalid-isin",
      });
      await createAssetForm.expectErrorMessage(
        "Expected string to match 'isin' format"
      );
    });
    test("validates ISIN field length constraints", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ",
        isin: "US0000000000000",
      });
      await createAssetForm.verifyInputAttribute("ISIN", "maxlength", "12");
    });
    test("validates decimals field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ",
      });
      await createAssetForm.expectErrorMessage("Expected union value");
    });
    test("validates large number in decimals field", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ",
      });
      await createAssetForm.expectErrorMessage("Expected union value");
    });
    test("validates negative number in decimals field", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ",
      });
      await createAssetForm.expectErrorMessage("Expected union value");
    });
    test("validates no signs in decimals field", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ",
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="decimals"]',
        "18-"
      );
      await createAssetForm.expectErrorMessage("Expected union value");
    });
  });

  test.describe("Second Screen - Equity Configuration", () => {
    test.beforeAll(async () => {
      await createAssetForm.fillBasicFields({
        name: equityData.name,
        symbol: equityData.symbol,
        isin: equityData.isin,
      });
      await createAssetForm.clickOnNextButton();
    });
    test("validates required fields are empty", async () => {
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Expected string length greater or equal to 1"
      );
    });
    test("validates equity class selection", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        equityCategory: "Dual-Class Shares",
        price: "1",
      });
      await createAssetForm.expectErrorMessage(
        "Expected string length greater or equal to 1"
      );
    });
    test("validates price field is required", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        price: "",
      });
      await createAssetForm.expectErrorMessage("Expected number");
    });

    test("validates large number for price field", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        price: "10000000000000000000",
      });
      await createAssetForm.expectErrorMessage(
        "Expected number to be less or equal to 9007199254740991"
      );
    });
    test("validates price field can not contain special characters", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        equityClass: "Preferred Equity",
        equityCategory: "Dual-Class Shares",
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="price"]',
        "1-"
      );
      await createAssetForm.expectErrorMessage("Expected number");
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
