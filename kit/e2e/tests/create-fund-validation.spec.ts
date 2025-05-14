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
        decimals: "18",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Expected string length greater or equal to 1"
      );
    });
    test("validates symbol field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Fund",
        symbol: "",
        decimals: "18",
        isin: "",
      });
      await createAssetForm.expectErrorMessage(
        "Expected string to match 'asset-symbol' format"
      );
    });
    test("validates symbol field is with lower case", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Fund",
        symbol: "tfu",
        decimals: "18",
        isin: "",
      });
      await createAssetForm.expectErrorMessage(
        "Expected string to match 'asset-symbol' format"
      );
    });
    test("validates symbol field can not contain special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Fund",
        symbol: "TFU^",
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
        name: "Test Fund",
        symbol: "TFU",
        isin: "invalid-isin",
      });
      await createAssetForm.expectErrorMessage(
        "Expected string to match 'isin' format"
      );
    });
    test("validates ISIN fieldlength constraints", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Fund",
        symbol: "TFU",
        isin: "US0000000000000",
      });

      await createAssetForm.verifyInputAttribute("ISIN", "maxlength", "12");
    });
    test("validates decimals field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Fund",
        symbol: "TFU",
        decimals: "",
      });
      await createAssetForm.expectErrorMessage("Expected union value");
    });
    test("validates large number in decimals field", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Fund",
        symbol: "TFU",
        decimals: "20",
      });
      await createAssetForm.expectErrorMessage("Expected union value");
    });
    test("validates negative number in decimals field", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Fund",
        symbol: "TFU",
        decimals: "-18",
      });
      await createAssetForm.expectErrorMessage("Expected union value");
    });
    test("validates no signs in decimals field", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Fund",
        symbol: "TFU",
        decimals: "-18",
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="decimals"]',
        "18-"
      );
      await createAssetForm.expectErrorMessage("Expected union value");
    });
  });

  test.describe("Second Screen - Fund Configuration", () => {
    test.beforeAll(async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: fundData.symbol,
        decimals: fundData.decimals,
        isin: fundData.isin,
      });
      await createAssetForm.clickOnContinueButton();
    });
    test("validates required fields are empty", async () => {
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Expected string length greater or equal to 1"
      );
    });
    test("validates fund class selection", async () => {
      await createAssetForm.fillFundConfigurationFields({
        fundCategory: "Activist",
        managementFeeBps: "1",
        price: "1",
      });
      await createAssetForm.expectErrorMessage(
        "Expected string length greater or equal to 1"
      );
    });
    test("validates management fee is required", async () => {
      await createAssetForm.clearField("Management fee");
      await createAssetForm.fillFundConfigurationFields({
        fundCategory: "Activist",
        fundClass: "Absolute Return",
        managementFeeBps: "",
        price: "1",
      });
      await createAssetForm.expectErrorMessage("Expected union value");
    });
    test("validates management fee maximum value", async () => {
      await createAssetForm.fillFundConfigurationFields({
        fundCategory: "Activist",
        fundClass: "Absolute Return",
        managementFeeBps: "9007199254740992",
        price: "1",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Expected number to be less or equal to 9007199254740991"
      );
    });
    test("validates management fee field can not contain special characters", async () => {
      await createAssetForm.fillFundConfigurationFields({
        fundCategory: "Activist",
        fundClass: "Absolute Return",
        managementFeeBps: "1",
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="managementFeeBps"]',
        "1-"
      );
      await createAssetForm.expectErrorMessage("Expected number");
    });
    test("validates price is required", async () => {
      await createAssetForm.clearField("Price");
      await createAssetForm.fillFundConfigurationFields({
        fundCategory: "Activist",
        fundClass: "Absolute Return",
        managementFeeBps: "1",
        price: "",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid number");
    });
    test("validates price maximum value", async () => {
      await createAssetForm.fillFundConfigurationFields({
        fundCategory: "Activist",
        fundClass: "Absolute Return",
        managementFeeBps: "1",
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

test.describe("Create fund asset", () => {
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
