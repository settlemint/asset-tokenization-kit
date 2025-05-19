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
        "Please enter at least 1 characters"
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
        "Please enter a valid asset symbol (uppercase letters and numbers)"
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
        "Please enter a valid asset symbol (uppercase letters and numbers)"
      );
    });
    test("validates symbol field can not contain special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ$",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a valid asset symbol (uppercase letters and numbers)"
      );
    });
    //Update this check name constraint after this ticket is fixed https://linear.app/settlemint/issue/ENG-3136/asset-designererror-message-is-wrong-for-asset-name-field
    test("verifies name field length constraints", async () => {
      await createAssetForm.verifyInputAttribute("Name", "maxlength", "50");
    });
    test("verifies symbol field length constraints", async () => {
      await createAssetForm.verifyInputAttribute("Symbol", "maxlength", "10");
    });
    test("validates ISIN format", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ",
        isin: "invalid-isin",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Please enter a valid ISIN. Format: 2 letters (country code), 9 alphanumeric characters, and 1 check digit (e.g., US0378331005)"
      );
    });
    test("validates ISIN field length constraints", async () => {
      await createAssetForm.verifyInputAttribute("ISIN", "maxlength", "12");
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
    test("validates decimals field is empty", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        decimals: "",
        price: equityData.price,
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 18"
      );
    });
    test("validates large number in decimals field", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        decimals: "19",
        price: equityData.price,
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 18"
      );
    });
    test("validates negative number in decimals field", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        decimals: "-1",
        price: equityData.price,
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 18"
      );
    });
    test("validates no signs in decimals field", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        decimals: "",
        price: equityData.price,
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="decimals"]',
        "18-"
      );
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 18"
      );
    });
    test("validates price field is empty", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        decimals: "18",
        price: "",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage("Please enter a valid number");
    });
    test("validates large number in price field", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        decimals: "18",
        price: "10000000000000000000",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a number no greater than 9007199254740991"
      );
    });
    test("validates price field can not contain special characters", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        decimals: "18",
        price: "",
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="price"]',
        "1-"
      );
      await createAssetForm.expectErrorMessage("Please enter a valid number");
    });
    test("verifies default currency is EUR", async () => {
      await createAssetForm.verifyCurrencyValue("EUR");
    });
    test("validates equity class selection", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        decimals: "18",
        price: "1",
        equityCategory: equityData.equityCategory,
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Please enter at least 1 characters"
      );
    });
  });
  test.describe("Create equity asset", () => {
    test("Create Equity asset", async () => {
      await adminPages.adminPage.goto();
      await adminPages.adminPage.createEquity(equityData);
      await adminPages.adminPage.verifySuccessMessage(
        assetMessage.successMessageEquity
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: equityData.sidebarAssetTypes,
        name: equityData.name,
        totalSupply: equityData.initialSupply,
      });
    });
  });
});
