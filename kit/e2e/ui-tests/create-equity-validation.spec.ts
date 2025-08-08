import { type BrowserContext, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { equityData } from "../test-data/asset-data";
import {
  successMessageData,
  errorMessageData,
} from "../test-data/message-data";
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
        errorMessageData.errorMessageName
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
        errorMessageData.errorMessageSymbol
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
        errorMessageData.errorMessageSymbol
      );
    });
    test("validates symbol field can not contain special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ$",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageSymbol
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
        errorMessageData.errorMessageISIN
      );
    });
    test("validates ISIN no special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Equity",
        symbol: "TEQ",
        isin: "RO03$833%005",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageISIN
      );
    });
    test("validates ISIN field length constraints", async () => {
      await createAssetForm.verifyInputAttribute("ISIN", "maxlength", "12");
    });
    // Additional steps after this ticket is fixed https://linear.app/settlemint/issue/ENG-3160/internalidwhen-enter-internalid-failed-to-create-asset
    test("validates Internal ID field length constraints", async () => {
      await createAssetForm.verifyInputAttribute(
        "Internal ID",
        "maxlength",
        "12"
      );
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
        errorMessageData.errorMessageDecimals
      );
    });
    test("validates large number in decimals field", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        decimals: "19",
        price: equityData.price,
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimals
      );
    });
    test("validates negative number in decimals field", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        decimals: "-1",
        price: equityData.price,
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimals
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
        errorMessageData.errorMessageDecimals
      );
    });
    test("validates price field is empty", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        decimals: "18",
        price: "",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageOnlyValidNumber
      );
    });
    test("validates large number in price field", async () => {
      await createAssetForm.fillEquityConfigurationFields({
        decimals: "18",
        price: "10000000000000000000",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageGreaterThanMax
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
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageOnlyValidNumber
      );
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
        errorMessageData.errorMessageName
      );
    });
  });
  test.describe("Create equity asset", () => {
    test("Create Equity asset", async () => {
      await adminPages.adminPage.goto();
      await adminPages.adminPage.createEquity(equityData);
      await adminPages.adminPage.verifySuccessMessage(
        successMessageData.successMessageEquity
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: equityData.sidebarAssetTypes,
        name: equityData.name,
        totalSupply: equityData.initialSupply,
      });
    });
  });
});
