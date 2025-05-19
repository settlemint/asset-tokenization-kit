import { type BrowserContext, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { fundData } from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
import { adminUser } from "../test-data/user-data";
import { ensureUserIsAdmin } from "../utils/db-utils";
test.describe("Fund Creation Validation", () => {
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
      await createAssetForm.selectAssetType(fundData.assetType);
    });
    test("validates name field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "",
        symbol: "TFU",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Please enter at least 1 characters"
      );
    });
    test("validates symbol field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Fund",
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
        name: "Test Fund",
        symbol: "tfu",
        isin: "",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a valid asset symbol (uppercase letters and numbers)"
      );
    });
    test("validates symbol field can not contain special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Fund",
        symbol: "TFU^",
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
        name: "Test Fund",
        symbol: "TFU",
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

  test.describe("Second Screen - Fund Configuration", () => {
    test.beforeAll(async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: fundData.symbol,
        isin: fundData.isin,
      });
      await createAssetForm.clickOnNextButton();
    });
    test("validates decimals field is empty", async () => {
      await createAssetForm.clearField("Decimals");
      await createAssetForm.fillFundConfigurationFields({
        decimals: "",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 18"
      );
    });
    test("validates large number in decimals field", async () => {
      await createAssetForm.fillFundConfigurationFields({
        decimals: "19",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 18"
      );
    });
    test("validates negative number in decimals field", async () => {
      await createAssetForm.fillFundConfigurationFields({
        decimals: "-1",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 18"
      );
    });
    test("validates no signs in decimals field", async () => {
      await createAssetForm.clearField("Decimals");
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
    test("validates management fee is required", async () => {
      await createAssetForm.clearField("Management fee");
      await createAssetForm.fillFundConfigurationFields({
        price: "1",
        managementFeeBps: "",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 10000"
      );
    });
    test("validates large number for management fee", async () => {
      await createAssetForm.fillFundConfigurationFields({
        price: "1",
        managementFeeBps: "9007199254740992",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 10000"
      );
    });
    test("validates management fee field can not contain special characters", async () => {
      await createAssetForm.fillFundConfigurationFields({
        managementFeeBps: "1",
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="managementFeeBps"]',
        "1-"
      );
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 10000"
      );
    });
    test("validates fund class selection", async () => {
      await createAssetForm.fillFundConfigurationFields({
        fundCategory: "Activist",
        managementFeeBps: "1",
        price: "1",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter at least 1 characters"
      );
    });
  });
  test.describe("Create fund asset", () => {
    test("Create Fund asset", async () => {
      await adminPages.adminPage.goto();
      await adminPages.adminPage.createFund(fundData);
      await adminPages.adminPage.verifySuccessMessage(
        assetMessage.successMessageFund
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: fundData.sidebarAssetTypes,
        name: fundData.name,
        totalSupply: fundData.initialSupply,
      });
    });
  });
});
