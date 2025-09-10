import { type BrowserContext, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { fundData } from "../test-data/asset-data";
import { errorMessageData } from "../test-data/message-data";
import { getSetupUser } from "../utils/setup-user";

test.describe.serial("Fund Creation Validation", () => {
  let adminContext: BrowserContext;
  let adminPages: ReturnType<typeof Pages>;
  let createAssetForm: CreateAssetForm;
  let adminPage: any;

  test.beforeAll(async ({ browser }) => {
    const setupUser = getSetupUser();
    adminContext = await browser.newContext();
    adminPage = await adminContext.newPage();
    adminPages = Pages(adminPage);
    createAssetForm = new CreateAssetForm(adminPage);
    await adminPages.signInPage.goto();
    await adminPages.signInPage.fillSignInForm(
      setupUser.email,
      setupUser.password
    );
    await adminPages.signInPage.submitSignInForm();
    await adminPages.signInPage.expectSuccessfulSignIn();
  });

  test.afterAll(async () => {
    await adminContext.close();
  });

  test.describe("First Screen - Basic Fields", () => {
    test.beforeAll(async () => {
      await createAssetForm.selectAssetType(fundData.assetType);
    });
    test("validates empty name field prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        symbol: fundData.symbol,
        decimals: fundData.decimals,
      });

      await createAssetForm.expectNextButtonDisabled();
    });
    test.skip("verifies name field length constraints", async () => {
      await createAssetForm.verifyInputAttribute("Name", "maxlength", "50");
    });
    test("validates empty symbol field prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: "",
        decimals: fundData.decimals,
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates symbol field with lowercase letters prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: "tsc",
        decimals: fundData.decimals,
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageSymbol
      );
      await createAssetForm.expectNextButtonDisabled();
    });

    test("validates symbol field with special characters prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: "TSC$",
        decimals: fundData.decimals,
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageSymbol
      );
      await createAssetForm.expectNextButtonDisabled();
    });

    test("validates symbol field does not allow more than 12 characters", async () => {
      const longSymbol = "VERYLONGSYMBOL123";

      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: longSymbol,
        decimals: "18",
      });

      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageSymbolLength
      );
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates empty decimal field prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: fundData.symbol,
        decimals: "",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimalsEmpty
      );
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates  decimal field with negative number prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: fundData.symbol,
        decimals: "-20",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimalsNegative
      );
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates  decimal field with high number prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: fundData.symbol,
        decimals: "320",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimalsHigh
      );
      await createAssetForm.expectNextButtonDisabled();
    });

    test("validates ISIN format", async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: fundData.symbol,
        decimals: fundData.decimals,
        isin: "invalid-isin",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageISIN
      );
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates ISIN format short", async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: fundData.symbol,
        decimals: fundData.decimals,
        isin: "U",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageISINLength
      );
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates ISIN invalid", async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: fundData.symbol,
        decimals: fundData.decimals,
        isin: "US1234567890",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageISINInvalid
      );
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates ISIN length", async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: fundData.symbol,
        decimals: fundData.decimals,
        isin: "US12345678901234",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageISINLength
      );
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates Country field", async () => {
      await createAssetForm.fillBasicFields({
        name: fundData.name,
        symbol: fundData.symbol,
        decimals: fundData.decimals,
        isin: fundData.isin,
      });
      await createAssetForm.expectNextButtonDisabled();
    });
  });
  test.describe.serial("Create Fund asset", () => {
    const testData = {
      name: "",
      symbol: "",
      decimals: "",
      timestamp: new Date().toISOString(),
    };

    test("Create Fund asset", async () => {
      const setupUser = getSetupUser();

      await adminPage.waitForLoadState("networkidle");
      await adminPage.waitForTimeout(2000);
      await createAssetForm.fillAssetFields({
        name: fundData.name,
        symbol: fundData.symbol,
        decimals: fundData.decimals,
        isin: fundData.isin,
        country: fundData.country,
        basePrice: fundData.basePrice,
        assetType: fundData.assetType,
        managementFee: fundData.managementFee,
        pincode: setupUser.pincode,
      });

      testData.name = fundData.name;
      testData.symbol = fundData.symbol;
      testData.decimals = fundData.decimals;

      await createAssetForm.verifyAssetCreated({
        name: testData.name,
        symbol: testData.symbol,
        decimals: testData.decimals,
      });
    });
  });
});
