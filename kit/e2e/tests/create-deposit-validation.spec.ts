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
        decimals: "18",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter text");
    });
    test("validates symbol field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Deposit",
        symbol: "",
        decimals: "18",
        isin: "",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter text");
    });
    test("validates symbol field is with lower case", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Deposit",
        symbol: "tdep",
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
        name: "Test Deposit",
        symbol: "TDEP",
        decimals: "18",
        isin: "invalid-isin",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid value");
    });
    test("validates ISIN length constraints", async () => {
      await createAssetForm.fillBasicFields({
        isin: "US0000000000000",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid value");
    });
    test("validates empty decimals", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Deposit",
        symbol: "TDEP",
        isin: "US1234567890",
        decimals: "",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid value");
    });
    test("validates decimals range", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Deposit",
        symbol: "TDEP",
        isin: "US1234567890",
        decimals: "19",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid value");
    });
    test("verifies default decimals field", async () => {
      await createAssetForm.verifyInputAttribute("Decimals", "value", "6");
    });
  });
  test.describe("Second Screen - Stablecoin Details", () => {
    test.beforeAll(async () => {
      await createAssetForm.fillBasicFields({
        name: depositData.name,
        symbol: depositData.symbol,
        decimals: depositData.decimals,
        isin: depositData.isin,
      });
      await createAssetForm.clickOnContinueButton();
    });

    test("validates collateral proof validity field is empty", async () => {
      await createAssetForm.clearField("Collateral proof validity");
      await createAssetForm.fillStablecoinConfigurationFields({
        collateralProofValidity: "",
        collateralProofValidityTimeUnit: "months",
        priceAmount: "1",
        priceCurrency: "EUR",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid number");
    });
    test("validates collateral proof validity field is less than 1", async () => {
      await createAssetForm.fillStablecoinConfigurationFields({
        collateralProofValidity: "0",
        collateralProofValidityTimeUnit: "months",
        priceAmount: "1",
        priceCurrency: "EUR",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Please enter a number no less than 1"
      );
    });

    // Remove skip after this issue is fixed jelena/eng-2931-create-stablecoin-formlimit-collateral-proof-validity-field
    test.skip("validates large number for collateral proof validity field", async () => {
      await createAssetForm.fillStablecoinConfigurationFields({
        collateralProofValidity: "10000000000000000000",
        collateralProofValidityTimeUnit: "months",
        priceAmount: "1",
        priceCurrency: "EUR",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Please enter a number no greater than 9007199254740991"
      );
    });
    test("validates price amount field is empty", async () => {
      await createAssetForm.clearField("Price");
      await createAssetForm.fillStablecoinConfigurationFields({
        collateralProofValidity: "1",
        priceAmount: "",
        priceCurrency: "EUR",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid number");
    });
    test("validates large number for price amount field", async () => {
      await createAssetForm.fillStablecoinConfigurationFields({
        collateralProofValidity: "1",
        priceAmount: "10000000000000000000",
        priceCurrency: "EUR",
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

test.describe("Create Deposit asset", () => {
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
