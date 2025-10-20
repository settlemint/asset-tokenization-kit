import { type BrowserContext, type Page, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import {
  assetPermissions,
  bondData,
  stablecoinData,
} from "../test-data/asset-data";
import { errorMessageData } from "../test-data/message-data";
import { getSetupUser } from "../utils/setup-user";

test.describe.serial("Bond Creation Validation", () => {
  let adminContext: BrowserContext;
  let adminPages: ReturnType<typeof Pages>;
  let createAssetForm: CreateAssetForm;
  let adminPage: Page;

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
      await createAssetForm.selectAssetType(bondData.assetType);
    });
    test("validates empty name field prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        symbol: bondData.symbol,
        decimals: bondData.decimals,
        isin: bondData.isin,
      });

      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates empty symbol field prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: "",
        decimals: bondData.decimals,
        isin: bondData.isin,
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates symbol field with lowercase letters prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: "tbo",
        decimals: bondData.decimals,
        isin: bondData.isin,
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates symbol field with special characters prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: "TBO$",
        decimals: bondData.decimals,
        isin: bondData.isin,
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates symbol field does not allow more than 12 characters", async () => {
      const longSymbol = "VERYLONGSYMBOL123";

      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: longSymbol,
        decimals: "18",
      });

      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageSymbolLength
      );
      await createAssetForm.expectNextButtonDisabled();
    });
    //Update this check name constraint after this ticket is fixed https://linear.app/settlemint/issue/ENG-4131/atk-asset-name-fieldimplement-correct-error-message-for-name-field
    test.skip("verifies name field length constraints", async () => {
      await createAssetForm.verifyInputAttribute("Name", "maxlength", "50");
    });
    test("validates decimals field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        decimals: "",
        isin: bondData.isin,
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates large number in decimals field", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        decimals: "20",
        isin: bondData.isin,
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimalsHigh
      );
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates  decimal field with negative number prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        decimals: "-20",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimalsNegative
      );
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates ISIN format prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        decimals: bondData.decimals,
        isin: "invalid-isin",
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates ISIN with special characters prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        decimals: bondData.decimals,
        isin: "BE03$833%005",
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates ISIN field does not allow more than 12 characters", async () => {
      const longISIN = "VERYLONGISIN1234";

      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        decimals: bondData.decimals,
        isin: longISIN,
      });

      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageISINLength
      );
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates Country field", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        decimals: bondData.decimals,
        isin: bondData.isin,
      });
      await createAssetForm.expectNextButtonDisabled();
    });
  });

  test.describe("Second Screen - Bond Details", () => {
    test.beforeAll(async () => {
      await adminPage.goto("/");
      await createAssetForm.openAssetDesigner();
      await createAssetForm.selectAssetClass("Fixed Income");
      await createAssetForm.selectAssetTypeFromDialog("Bond");

      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        decimals: bondData.decimals,
        isin: bondData.isin,
        country: bondData.country,
      });
      await createAssetForm.clickNextButton();
      await adminPage.waitForTimeout(1000);
    });

    test("validates maximum limit field is empty", async () => {
      await createAssetForm.fillBondConfigurationFields({
        maximumLimit: "",
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates maximum limit field with special characters prevents submission", async () => {
      await createAssetForm.fillBondConfigurationFields({
        maximumLimit: "1$",
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates maturity date should be chosen", async () => {
      await createAssetForm.fillBondConfigurationFields({
        maximumLimit: bondData.maximumLimit,
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates denomination asset is required", async () => {
      await createAssetForm.fillBondConfigurationFields({
        maximumLimit: bondData.maximumLimit,
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.expectNextButtonDisabled();
    });
  });
  test.describe
    .serial("Dependent assets, first create stablecoin and then create dependent bond", () => {
    const stableCoinTestData = {
      stablecoinName: "",
      name: "",
      symbol: "",
      decimals: "",
    };
    test("Create Stablecoin asset", async () => {
      const setupUser = getSetupUser();
      await adminPage.goto("/");
      await createAssetForm.openAssetDesigner();
      await createAssetForm.selectAssetClass("Cash Equivalent");
      await createAssetForm.selectAssetTypeFromDialog("Stablecoin");

      await createAssetForm.fillAssetDetails({
        name: stablecoinData.name,
        symbol: stablecoinData.symbol,
        decimals: stablecoinData.decimals,
        isin: stablecoinData.isin,
        basePrice: stablecoinData.basePrice,
        country: stablecoinData.country,
      });

      stableCoinTestData.stablecoinName = stablecoinData.name;

      await createAssetForm.completeAssetCreation(
        setupUser.pincode,
        "stablecoin"
      );
      await createAssetForm.verifyAssetCreated({
        name: stablecoinData.name,
        symbol: stablecoinData.symbol,
        decimals: stablecoinData.decimals,
      });
      await adminPages.adminPage.clickAssetDetails(
        stableCoinTestData.stablecoinName
      );
      await adminPages.adminPage.grantAssetPermissions({
        user: setupUser.name,
        permissions: assetPermissions,
        pincode: setupUser.pincode,
        assetName: stableCoinTestData.stablecoinName,
      });
      await adminPages.adminPage.unpauseAsset({
        pincode: setupUser.pincode,
      });
    });

    test("Create Bond asset", async () => {
      const bondTestData = {
        name: "",
        symbol: "",
        decimals: "",
      };
      const setupUser = getSetupUser();
      await adminPage.goto("/");
      await createAssetForm.openAssetDesigner();
      await createAssetForm.selectAssetClass("Fixed Income");
      await createAssetForm.selectAssetTypeFromDialog("Bond");

      const bondDataWithStablecoin = {
        ...bondData,
        denominationAsset: stableCoinTestData.stablecoinName,
      };

      await createAssetForm.fillBasicFields({
        name: bondDataWithStablecoin.name,
        symbol: bondDataWithStablecoin.symbol,
        decimals: bondDataWithStablecoin.decimals,
        isin: bondDataWithStablecoin.isin,
        country: bondDataWithStablecoin.country,
      });

      await createAssetForm.clickNextButton();
      await adminPage.waitForLoadState("networkidle");
      await createAssetForm.fillBondConfigurationFields({
        maximumLimit: bondDataWithStablecoin.maximumLimit,
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
        denominationAsset: stableCoinTestData.stablecoinName,
        faceValue: bondDataWithStablecoin.faceValue,
      });

      await createAssetForm.clickNextButton();

      bondTestData.name = bondDataWithStablecoin.name;
      bondTestData.symbol = bondDataWithStablecoin.symbol;
      bondTestData.decimals = bondDataWithStablecoin.decimals;

      await createAssetForm.completeAssetCreation(setupUser.pincode, "bond");
      await createAssetForm.verifyAssetCreated({
        name: bondTestData.name,
        symbol: bondTestData.symbol,
        decimals: bondTestData.decimals,
      });
      await adminPages.adminPage.clickAssetDetails(bondTestData.name);
      await adminPages.adminPage.grantAssetPermissions({
        user: setupUser.name,
        permissions: assetPermissions,
        pincode: setupUser.pincode,
        assetName: bondTestData.name,
      });
      await adminPages.adminPage.unpauseAsset({
        pincode: setupUser.pincode,
      });
    });
  });
});
