import { type BrowserContext, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { adminUser } from "../test-data/user-data";
import { ensureUserIsAdmin } from "../utils/db-utils";
import { Pages } from "../pages/pages";
import { bondData, stablecoinData } from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";

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
    await adminPages.signInPage.signInAsAdmin(adminUser);
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
        decimals: "18",
        isin: "",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter text");
    });
    test("validates symbol field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Bond",
        symbol: "",
        decimals: "18",
        isin: "",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter text");
    });
    test("validates symbol field is with lower case", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Bond",
        symbol: "tbo",
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
        isin: "invalid-isin",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Please enter text in the correct isin format"
      );
    });
    test("validates ISIN length constraints", async () => {
      await createAssetForm.fillBasicFields({
        isin: "US0000000000000",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Please enter text in the correct isin format"
      );
    });
    test("validates empty decimals", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Bond",
        symbol: "TBO",
        decimals: "",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid value");
    });
    test("validates decimals range", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Bond",
        symbol: "TBO",
        decimals: "19",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid value");
    });
    test("validates default decimals field", async () => {
      await createAssetForm.verifyInputAttribute("Decimals", "value", "18");
    });
  });

  test.describe("Second Screen - Bond Details", () => {
    test.beforeAll(async () => {
      await createAssetForm.fillBasicFields({
        name: bondData.name,
        symbol: bondData.symbol,
        decimals: bondData.decimals,
        isin: bondData.isin,
      });
      await createAssetForm.clickOnContinueButton();
    });

    test("validates required fields are empty", async () => {
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Please enter a valid number");
      await createAssetForm.expectErrorMessage(
        "Please provide all required information"
      );
    });

    test("validates numeric field value for maximum supply", async () => {
      await createAssetForm.fillBondDetails({
        maximumSupply: "0",
        faceValue: "50",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Please enter a number no less than 1e-12"
      );
    });

    test("validates numeric field value for face value", async () => {
      await createAssetForm.fillBondDetails({
        maximumSupply: "1",
        faceValue: "0",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Please enter a number no less than 1e-12"
      );
    });

    test("validates underlying asset is required", async () => {
      await createAssetForm.fillBondDetails({
        maximumSupply: "1000",
        faceValue: "100",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Please provide all required information"
      );
    });
    test("validates maturity date", async () => {
      await createAssetForm.fillBondDetails({
        maximumSupply: "1000",
        faceValue: "100",
        maturityDate: createAssetForm.getMaturityDate({ isPast: true }),
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Maturity date must be at least 1 hour in the future"
      );
    });

    test("validates large number in maximum supply field", async () => {
      await createAssetForm.fillBondDetails({
        maximumSupply: "10000000000000000000",
        faceValue: "1",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a number no greater than 9007199254740991"
      );
    });
    test("validates large number in face field", async () => {
      await createAssetForm.fillBondDetails({
        maximumSupply: "1",
        faceValue: "10000000000000000000",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a number no greater than 9007199254740991"
      );
    });
  });
});

test.describe
  .serial("Dependent assets, first create stablecoin and then create dependent bond", () => {
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
  test("Create Stablecoin asset", async () => {
    await adminPages.adminPage.createStablecoin(stablecoinData);
    testData.stablecoinName = stablecoinData.name;
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: stablecoinData.sidebarAssetTypes,
      name: stablecoinData.name,
      totalSupply: stablecoinData.initialSupply,
    });
  });

  test("Create Bond asset", async () => {
    const bondDataWithStablecoin = {
      ...bondData,
      underlyingAsset: testData.stablecoinName,
    };
    await adminPages.adminPage.createBond(bondDataWithStablecoin);
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: bondDataWithStablecoin.sidebarAssetTypes,
      name: bondDataWithStablecoin.name,
      totalSupply: bondDataWithStablecoin.initialSupply,
    });
  });
});
