import { type BrowserContext, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { bondData, stablecoinData } from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
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
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Please enter at least 1 characters"
      );
    });
    test("validates symbol field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Bond",
        symbol: "",
      });
      await createAssetForm.clickOnNextButton();
      await createAssetForm.expectErrorMessage(
        "Please enter a valid asset symbol (uppercase letters and numbers)"
      );
    });
    test("validates symbol field is with lower case", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Bond",
        symbol: "tbo",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a valid asset symbol (uppercase letters and numbers)"
      );
    });
    test("validates symbol field can not contain special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Bond",
        symbol: "TBO$",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a valid asset symbol (uppercase letters and numbers)"
      );
    });
    //Update this check name constraint after this ticket is fixed jelena/eng-3108-asset-designerno-constraint-in-asset-name-field
    test("verifies Symbol field length constraints", async () => {
      // await createAssetForm.verifyInputAttribute("Name", "maxlength", "50");
      await createAssetForm.verifyInputAttribute("Symbol", "maxlength", "10");
    });
    //Unskip this test after this ticket is fixed https://linear.app/settlemint/issue/ENG-3127/asset-designerno-error-message-for-isin-field
    test.skip("validates ISIN format", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Bond",
        symbol: "TBO",
        isin: "invalid-isin",
      });
      await createAssetForm.expectErrorMessage(
        "Expected string to match 'isin' format"
      );
    });
    test("validates ISIN field length constraints", async () => {
      await createAssetForm.verifyInputAttribute("ISIN", "maxlength", "12");
    });
    test("validates Internal ID field length constraints", async () => {
      await createAssetForm.verifyInputAttribute(
        "Internal ID",
        "maxlength",
        "12"
      );
    });
    test.describe("Second Screen - Bond Details", () => {
      test.beforeAll(async () => {
        await createAssetForm.fillBasicFields({
          name: bondData.name,
          symbol: bondData.symbol,
          internalId: bondData.internalId,
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
        await createAssetForm.expectErrorMessage(
          "Please enter a value between 0 and 18"
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
          "Please enter a value between 0 and 18"
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
          "Please enter a value between 0 and 18"
        );
      });
      test("validates maximum supply field is empty", async () => {
        await createAssetForm.fillBondDetails({
          decimals: "18",
          maximumSupply: "",
          faceValue: "0",
          maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
        });
        await createAssetForm.expectErrorMessage("Please enter a valid number");
      });
      //Unskip this test after this ticket is fixed https://linear.app/settlemint/issue/ENG-3128/bondno-error-when-enter-0-in-maximum-supply
      test.skip("validates small number value for maximum supply field", async () => {
        await createAssetForm.fillBondDetails({
          decimals: "18",
          maximumSupply: "0",
          faceValue: "1",
          maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
        });
        await createAssetForm.expectErrorMessage(
          "Expected number to be greater or equal to 1"
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
          "Please enter a number no greater than 9007199254740991"
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

        await createAssetForm.expectErrorMessage("Please enter a valid number");
      });
      test("validates face value field is empty", async () => {
        await createAssetForm.fillBondDetails({
          decimals: "18",
          maximumSupply: "9",
          faceValue: "",
          maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
        });
        await createAssetForm.expectErrorMessage("Please enter a valid number");
      });
      //Unskip this test after this ticket is fixed https://linear.app/settlemint/issue/ENG-3130/bond-no-error-when-enter-0-in-face-value
      test.skip("validates small number value for face value field", async () => {
        await createAssetForm.fillBondDetails({
          decimals: "18",
          maximumSupply: "10",
          faceValue: "0",
          maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
        });
        await createAssetForm.expectErrorMessage(
          "Expected number to be greater or equal to 1"
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
          "Please enter a number no greater than 9007199254740991"
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

        await createAssetForm.expectErrorMessage("Please enter a valid number");
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
          "Maturity date must be at least 1 hour in the future"
        );
      });
      test("validates underlying asset is required", async () => {
        await createAssetForm.fillBondDetails({
          decimals: "18",
          maximumSupply: "1000",
          faceValue: "100",
          maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
        });
        await createAssetForm.clickOnNextButton();
        await createAssetForm.expectErrorMessage(
          "Please provide all required information"
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
        assetMessage.successMessageStablecoin
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
        assetMessage.successMessageBond
      );
      await adminPages.adminPage.checkIfAssetExists({
        sidebarAssetTypes: bondDataWithStablecoin.sidebarAssetTypes,
        name: bondDataWithStablecoin.name,
        totalSupply: bondDataWithStablecoin.initialSupply,
      });
    });
  });
});
