import { type BrowserContext, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { cryptocurrencyData } from "../test-data/asset-data";
import {
  errorMessageData,
  successMessageData,
} from "../test-data/message-data";
import { adminUser } from "../test-data/user-data";
import { ensureUserIsAdmin } from "../utils/db-utils";

test.describe("Cryptocurrency Creation Validation", () => {
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
      await createAssetForm.selectAssetType(cryptocurrencyData.assetType);
    });
    test("validates name field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "",
        symbol: "TCC",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageName
      );
    });
    test("validates symbol field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Cryptocurrency",
        symbol: "",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageSymbol
      );
    });
    test("validates symbol field is with lower case", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Cryptocurrency",
        symbol: "tcc",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageSymbol
      );
    });
    test("validates symbol field can not contain special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Cryptocurrency",
        symbol: "TCC$",
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
        name: "Test Cryptocurrency",
        symbol: "TCC",
        isin: "invalid-isin",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageISIN
      );
    });
    test("validates ISIN no special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Cryptocurrency",
        symbol: "TCC",
        isin: "SR03$833%005",
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

  test.describe("Second Screen - Cryptocurrency Details", () => {
    test.beforeAll(async () => {
      await createAssetForm.fillBasicFields({
        name: cryptocurrencyData.name,
        symbol: cryptocurrencyData.symbol,
        isin: cryptocurrencyData.isin,
      });
      await createAssetForm.clickOnNextButton();
    });
    test("validates decimals field is empty", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        decimals: "",
        initialSupply: "1",
        price: "1",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimals
      );
    });
    test("validates large number in decimals field", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        decimals: "20",
        initialSupply: "1",
        price: "1",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimals
      );
    });
    test("validates negative number in decimals field", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        decimals: "-1",
        initialSupply: "1",
        price: "1",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimals
      );
    });
    test("validates no signs in decimals field", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        initialSupply: "1",
        price: "1",
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="decimals"]',
        "18-"
      );
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimals
      );
    });
    test("validates initial supply field is empty", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        decimals: "18",
        initialSupply: "",
        price: "1",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageOnlyValidNumber
      );
    });
    //TODO: Remove skip after this ticket is fixed https://linear.app/settlemint/issue/ENG-3131/cryptocurrencymissing-error-when-entered-0-in-initial-supply
    test.skip("validates inital supply field is 0", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        decimals: "18",
        initialSupply: "0",
        price: "10",
      });
      await createAssetForm.expectErrorMessage(
        "Expected number to be greater or equal to 0.000001"
      );
    });
    test("validates large number for initial supply fields", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        decimals: "18",
        initialSupply: "10000000000000000000",
        price: "1",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageGreaterThanMax
      );
    });
    test("validates initial supply field can not contain special characters", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        decimals: "18",
        price: "1",
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="initialSupply"]',
        "1-"
      );
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageOnlyValidNumber
      );
    });
    test("validates price field is empty", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        decimals: "18",
        initialSupply: "1",
        price: "",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageOnlyValidNumber
      );
    });

    test("validates large number for price field", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        decimals: "18",
        initialSupply: "1",
        price: "10000000000000000000",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageGreaterThanMax
      );
    });
    test("validates price field can not contain special characters", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        decimals: "18",
        initialSupply: "1",
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="price.amount"]',
        "1-"
      );
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageOnlyValidNumber
      );
    });
    test("verifies default currency is EUR", async () => {
      await createAssetForm.verifyCurrencyValue("EUR");
    });
  });
  test.describe("Create cryptocurrency asset", () => {
    test("Create Cryptocurrency asset", async () => {
      await adminPages.adminPage.goto();
      await adminPages.adminPage.createCryptocurrency(cryptocurrencyData);
      await adminPages.adminPage.verifySuccessMessage(
        successMessageData.successMessageCryptocurrency
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: cryptocurrencyData.sidebarAssetTypes,
        name: cryptocurrencyData.name,
        totalSupply: cryptocurrencyData.initialSupply,
      });
    });
  });
});
