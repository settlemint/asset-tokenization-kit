import { type BrowserContext, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { depositData } from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
import { adminUser } from "../test-data/user-data";
import { ensureUserIsAdmin } from "../utils/db-utils";
test.describe("Deposit Creation Validation", () => {
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
      await createAssetForm.selectAssetType(depositData.assetType);
    });
    test("validates name field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "",
        symbol: "TDEP",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Please enter at least 1 characters"
      );
    });
    test("validates symbol field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Deposit",
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
        name: "Test Deposit",
        symbol: "tdep",
        isin: "",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Please enter a valid asset symbol (uppercase letters and numbers)"
      );
    });
    test("validates symbol field can not contain special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Deposit",
        symbol: "TDEP$",
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
        name: "Test Deposit",
        symbol: "TDEP",
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
  test.describe("Second Screen - Deposit Details", () => {
    test.beforeAll(async () => {
      await createAssetForm.fillBasicFields({
        name: depositData.name,
        symbol: depositData.symbol,
        isin: depositData.isin,
      });
      await createAssetForm.clickOnNextButton();
    });
    test("validates decimals field is empty", async () => {
      await createAssetForm.clearField("Decimals");
      await createAssetForm.fillStablecoinConfigurationFields({
        decimals: "",
        price: depositData.price,
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 18"
      );
    });
    test("validates large number in decimals field", async () => {
      await createAssetForm.fillStablecoinConfigurationFields({
        decimals: "19",
        price: depositData.price,
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 18"
      );
    });
    test("validates negative number in decimals field", async () => {
      await createAssetForm.fillStablecoinConfigurationFields({
        decimals: "-1",
        price: depositData.price,
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a value between 0 and 18"
      );
    });
    test("validates no signs in decimals field", async () => {
      await createAssetForm.fillStablecoinConfigurationFields({
        decimals: "",
        price: depositData.price,
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
      await createAssetForm.clearField("Price");
      await createAssetForm.fillStablecoinConfigurationFields({
        decimals: "18",
        price: "",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage("Please enter a valid number");
    });
    test("validates large number in price field", async () => {
      await createAssetForm.fillStablecoinConfigurationFields({
        decimals: "18",
        price: "10000000000000000000",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a number no greater than 9007199254740991"
      );
    });
    test("validates price field can not contain special characters", async () => {
      await createAssetForm.clearField("Price");
      await createAssetForm.fillStablecoinConfigurationFields({
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
    test("validates collateral proof validity field is empty", async () => {
      await createAssetForm.clearField("Collateral proof validity");
      await createAssetForm.fillStablecoinConfigurationFields({
        collateralProofValidity: "",
        collateralProofValidityTimeUnit: "months",
        price: "1",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage("Please enter a valid number");
    });
    test("validates collateral proof validity field is less than 1", async () => {
      await createAssetForm.fillStablecoinConfigurationFields({
        collateralProofValidity: "0",
        collateralProofValidityTimeUnit: "months",
        price: "1",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Please enter a number no less than 1"
      );
    });
    //Remove skip after this issue is fixed https://linear.app/settlemint/issue/ENG-3152/asset-designerdeposit-missing-error-on-large-number-on-collateral
    test.skip("validates large number for collateral proof validity field", async () => {
      await createAssetForm.fillStablecoinConfigurationFields({
        collateralProofValidity: "10000000000000000000",
        collateralProofValidityTimeUnit: "months",
        price: "1",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Please enter a number no greater than 9007199254740991"
      );
    });
  });
  test.describe("Create Deposit asset", () => {
    test("Create Deposit asset", async () => {
      await adminPages.adminPage.goto();
      await adminPages.adminPage.createDeposit(depositData);
      await adminPages.adminPage.verifySuccessMessage(
        assetMessage.successMessageDeposit
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: depositData.sidebarAssetTypes,
        name: depositData.name,
        totalSupply: depositData.initialSupply,
      });
    });
  });
});
