import { type BrowserContext, type Page, expect, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { bondData, stablecoinData } from "../test-data/asset-data";
import { errorMessageData } from "../test-data/message-data";
import { getSetupUser } from "../utils/setup-user";

const testData = {
  stablecoinName: "",
  name: "",
  symbol: "",
  decimals: "",
};

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
      await adminPage.goto("/");
      await createAssetForm.openAssetDesigner();
      await createAssetForm.selectAssetClass("Fixed Income");
      await createAssetForm.selectAssetTypeFromDialog("Bond");
    });
    test("validates empty name field prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        symbol: bondData.symbol,
        decimals: bondData.decimals,
        isin: bondData.isin,
        country: bondData.country,
      });

      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates empty symbol field prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        decimals: bondData.decimals,
        isin: bondData.isin,
        country: bondData.country,
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates symbol field with lowercase letters prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: "tbo",
        decimals: bondData.decimals,
        isin: bondData.isin,
        country: bondData.country,
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates symbol field with special characters prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: "TBO$",
        decimals: bondData.decimals,
        isin: bondData.isin,
        country: bondData.country,
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    //Update this check name constraint after this ticket is fixed https://linear.app/settlemint/issue/ENG-3136/asset-designererror-message-is-wrong-for-asset-name-field
    test("verifies name field length constraints", async () => {
      await createAssetForm.verifyInputAttribute("Name", "maxlength", "50");
    });
    test("verifies symbol field length constraints", async () => {
      await createAssetForm.verifyInputAttribute("Symbol", "maxlength", "10");
    });
    test("validates ISIN format prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        decimals: bondData.decimals,
        isin: "invalid-isin",
        country: bondData.country,
      });
      await createAssetForm.expectNextButtonDisabled();
    });
    test("validates ISIN with special characters prevents submission", async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        decimals: bondData.decimals,
        isin: "BE03$833%005",
        country: bondData.country,
      });
      await createAssetForm.expectNextButtonDisabled();
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

  test.describe("Second Screen - Bond Details", () => {
    test.beforeAll(async () => {
      await adminPage.goto("/");
      await createAssetForm.openAssetDesigner();
      await createAssetForm.selectAssetClass("Fixed Income");
      await createAssetForm.selectAssetTypeFromDialog("Bond");

      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        isin: bondData.isin,
        country: bondData.country,
      });
      await createAssetForm.clickNextButton();
      await adminPage.waitForTimeout(1000);
    });

    test("validates decimals field is empty", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "",
        maximumSupply: "1",
        faceValue: "0",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimals
      );
    });
    test("validates large number in decimals field", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "20",
        maximumSupply: "1",
        faceValue: "0",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimals
      );
    });
    test("validates no signs in decimals field", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "18",
        maximumSupply: "1",
        faceValue: "0",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="decimals"]',
        "18-"
      );
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDecimals
      );
    });
    test("validates maximum supply field is empty", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "18",
        maximumSupply: "",
        faceValue: "0",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageOnlyValidNumber
      );
    });
    test("validates small number value for maximum supply field", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "18",
        maximumSupply: "0",
        faceValue: "1",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageLessThanMin
      );
    });
    test("validates large number value for maximum supply field", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "18",
        maximumSupply: "100000000000000000000000000",
        faceValue: "50",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageGreaterThanMax
      );
    });
    test("validates no signs in maximum supply field", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "18",
        maximumSupply: "",
        faceValue: "0",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="maximumSupply"]',
        "1-"
      );

      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageOnlyValidNumber
      );
    });
    test("validates face value field is empty", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "18",
        maximumSupply: "9",
        faceValue: "",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageOnlyValidNumber
      );
    });
    test("validates small number value for face value field", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "18",
        maximumSupply: "10",
        faceValue: "0",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageLessThanMin
      );
    });
    test("validates large number value for face value field", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "18",
        maximumSupply: "10",
        faceValue: "5000000000000000000000",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageGreaterThanMax
      );
    });
    test("validates no signs in face value field", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "18",
        maximumSupply: "10",
        faceValue: "0",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="faceValue"]',
        "0-"
      );

      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageOnlyValidNumber
      );
    });
    test("validates maturity date", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "18",
        maximumSupply: "1000",
        faceValue: "100",
        maturityDate: createAssetForm.getMaturityDate({ isPast: true }),
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageMaturityDate
      );
    });
    test("validates denomination asset is required", async () => {
      await createAssetForm.fillBondDetails({
        decimals: "18",
        maximumSupply: "1000",
        faceValue: "100",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageDenominationAsset
      );
    });
  });
  test.describe
    .serial("Dependent assets, first create stablecoin and then create dependent bond", () => {
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

      testData.stablecoinName = stablecoinData.name;

      await createAssetForm.completeAssetCreation(
        setupUser.pincode,
        "stablecoin"
      );
      await createAssetForm.verifyAssetCreated({
        name: stablecoinData.name,
        symbol: stablecoinData.symbol,
        decimals: stablecoinData.decimals,
      });
    });

    test("Create Bond asset", async () => {
      const setupUser = getSetupUser();
      await adminPage.goto("/");
      await createAssetForm.openAssetDesigner();
      await createAssetForm.selectAssetClass("Fixed Income");
      await createAssetForm.selectAssetTypeFromDialog("Bond");

      const bondDataWithStablecoin = {
        ...bondData,
        denominationAsset: testData.stablecoinName,
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
      await expect(
        adminPage.getByRole("heading", { name: "Bond Details" })
      ).toBeVisible({ timeout: 10000 });

      await createAssetForm.fillBondDetails({
        decimals: bondDataWithStablecoin.decimals,
        maximumSupply: bondDataWithStablecoin.maximumSupply,
        faceValue: bondDataWithStablecoin.faceValue,
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
        denominationAsset: bondDataWithStablecoin.denominationAsset,
      });

      await createAssetForm.clickNextButton();

      testData.name = bondDataWithStablecoin.name;
      testData.symbol = bondDataWithStablecoin.symbol;
      testData.decimals = bondDataWithStablecoin.decimals;

      await createAssetForm.completeAssetCreation(setupUser.pincode, "bond");
      await createAssetForm.verifyAssetCreated({
        name: testData.name,
        symbol: testData.symbol,
        decimals: testData.decimals,
      });
    });
  });
});
