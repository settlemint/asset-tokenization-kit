import { test, type BrowserContext, type Page } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { assetPermissions, fundData } from "../test-data/asset-data";
import { errorMessageData } from "../test-data/message-data";
import { getSetupUser } from "../utils/setup-user";

test.describe.serial("Fund Creation Validation", () => {
  let adminContext: BrowserContext;
  let adminPages: ReturnType<typeof Pages>;
  let createAssetForm: CreateAssetForm;
  let adminPage: Page;

  test.beforeAll(async ({ browser }) => {
    const setupUser = getSetupUser("admin");
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
      name: fundData.name,
      symbol: fundData.symbol,
      decimals: fundData.decimals,
    };

    test("Create Fund asset", async () => {
      const setupUser = getSetupUser("admin");
      await adminPage.goto("/");
      await createAssetForm.openAssetDesigner();
      await createAssetForm.selectAssetClass("Flexible Income");
      await createAssetForm.selectAssetTypeFromDialog("Fund");
      await createAssetForm.fillAssetDetails({
        name: testData.name,
        symbol: testData.symbol,
        decimals: testData.decimals,
        isin: fundData.isin,
        country: fundData.country,
        basePrice: fundData.basePrice,
      });
      await createAssetForm.fillFundConfigurationFields({
        fundClass: fundData.fundClass,
        fundCategory: fundData.fundCategory,
        managementFeeBps: fundData.managementFeeBps,
      });

      await createAssetForm.completeAssetCreation(setupUser.pincode, "fund");

      await createAssetForm.verifyAssetCreated({
        name: testData.name,
        symbol: testData.symbol,
        decimals: testData.decimals,
      });
      await adminPages.adminPage.clickAssetDetails(testData.name);
      await adminPages.adminPage.grantAssetPermissions({
        user: setupUser.name,
        permissions: assetPermissions,
        pincode: setupUser.pincode,
        assetName: testData.name,
      });
      await adminPages.adminPage.unpauseAsset({
        pincode: setupUser.pincode,
      });

      const transferUser = getSetupUser("transfer-primary");
      const adminRecipient = setupUser.name ?? setupUser.email;

      await adminPages.adminPage.mintAsset({
        assetName: testData.name,
        userName: adminRecipient,
        amount: "1000",
        pincode: setupUser.pincode,
      });

      await adminPages.adminPage.verifySuccessMessage("Changes saved");
      await adminPages.adminPage.verifyTotalSupply("1000");

      const transferRecipient = transferUser.name ?? transferUser.email;

      await adminPages.adminPage.transferAsset({
        amount: "300",
        recipient: transferRecipient,
        pincode: setupUser.pincode,
      });

      await adminPages.adminPage.verifySuccessMessage("Changes saved");
      await adminPages.adminPage.expectCurrentAvailableBalance({
        expectedAmount: "700",
      });

      await adminPages.portfolioPage.signOut();
      await adminPages.portfolioPage.expectSignOutSuccess();

      const transferContext = await adminContext.browser()?.newContext();
      if (!transferContext) {
        throw new Error("Unable to create transfer user browser context");
      }

      const transferPage = await transferContext.newPage();
      const transferPages = Pages(transferPage);

      try {
        await transferPages.signInPage.goto();
        await transferPages.signInPage.fillSignInForm(
          transferUser.email,
          transferUser.password
        );
        await transferPages.signInPage.submitSignInForm();
        await transferPages.signInPage.expectSuccessfulSignIn();

        await transferPages.portfolioPage.goto();
        await transferPages.portfolioPage.verifyAssetBalance("0", "300");
      } finally {
        await transferPages.portfolioPage.signOut().catch(() => {});
        await transferContext.close();
      }
    });
  });
});
