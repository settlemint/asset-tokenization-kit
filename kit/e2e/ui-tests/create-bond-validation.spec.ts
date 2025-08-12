import { type BrowserContext, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { bondData, stablecoinData } from "../test-data/asset-data";
import {
  errorMessageData,
  successMessageData,
} from "../test-data/message-data";
import { adminUser } from "../test-data/user-data";
import { ensureUserIsAdmin } from "../utils/db-utils";

const testData = {
  stablecoinName: "",
};

test.describe.serial("Bond Creation Validation", () => {
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
      await createAssetForm.selectAssetType(bondData.assetType);
    });
    test("validates name field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "",
        symbol: "TBO",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageName
      );
    });
    test("validates symbol field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Bond",
        symbol: "",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageSymbol
      );
    });
    test("validates symbol field is with lower case", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Bond",
        symbol: "tbo",
      });
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageSymbol
      );
    });
    test("validates symbol field can not contain special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Bond",
        symbol: "TBO$",
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
        name: "Test Bond",
        symbol: "TBO",
        isin: "invalid-isin",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        errorMessageData.errorMessageISIN
      );
    });
    test("validates ISIN no special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Bond",
        symbol: "TBO",
        isin: "BE03$833%005",
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

  test.describe("Second Screen - Bond Details", () => {
    test.beforeAll(async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        isin: bondData.isin,
      });
      await createAssetForm.clickOnNextButton();
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
      await createAssetForm.fillAssetFields({
        name: stablecoinData.name,
        symbol: stablecoinData.symbol,
        decimals: stablecoinData.decimals,
        isin: stablecoinData.isin,
        country: stablecoinData.country,
        pincode: stablecoinData.pincode,
      });
      testData.stablecoinName = stablecoinData.name;
      await adminPages.adminPage.verifySuccessMessage(
        successMessageData.successMessageStablecoin
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
        name: stablecoinData.name,
      });
    });

    test("Create Bond asset", async () => {
      const bondDataWithStablecoin = {
        ...bondData,
        denominationAsset: testData.stablecoinName,
      };
      await adminPages.adminPage.createBond(bondDataWithStablecoin);
      await adminPages.adminPage.verifySuccessMessage(
        successMessageData.successMessageBond
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: bondDataWithStablecoin.sidebarAssetTypes,
        name: bondDataWithStablecoin.name,
        totalSupply: bondDataWithStablecoin.initialSupply,
      });
    });
  });
});
