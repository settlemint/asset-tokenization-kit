import { type BrowserContext, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { cryptocurrencyData } from "../test-data/asset-data";
import { assetMessage } from "../test-data/success-msg-data";
import { adminUser } from "../test-data/user-data";
import { ensureUserIsAdmin } from "../utils/db-utils";

test.describe("Cryptocurrency Creation Validation", () => {
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
      await createAssetForm.selectAssetType(cryptocurrencyData.assetType);
    });
    test("validates name field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "",
        symbol: "TCC",
        decimals: "18",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage(
        "Expected string length greater or equal to 1"
      );
    });
    test("validates symbol field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Cryptocurrency",
        symbol: "",
        decimals: "18",
      });
      await createAssetForm.expectErrorMessage(
        "Expected string to match 'asset-symbol' format"
      );
    });
    test("validates symbol field is with lower case", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Cryptocurrency",
        symbol: "tcc",
        decimals: "18",
      });
      await createAssetForm.expectErrorMessage(
        "Expected string to match 'asset-symbol' format"
      );
    });
    test("validates symbol field can not contain special characters", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Cryptocurrency",
        symbol: "TCC$",
        decimals: "18",
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
    test("validates decimals field is empty", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Cryptocurrency",
        symbol: "TCC",
        decimals: "",
      });
      await createAssetForm.expectErrorMessage("Expected union value");
    });
    test("validates large number in decimals field", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Cryptocurrency",
        symbol: "TCC",
        decimals: "20",
      });
      await createAssetForm.expectErrorMessage("Expected union value");
    });
    test("validates negative number in decimals field", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Cryptocurrency",
        symbol: "TCC",
        decimals: "-18",
      });
      await createAssetForm.expectErrorMessage("Expected union value");
    });
    test("validates no signs in decimals field", async () => {
      await createAssetForm.fillBasicFields({
        name: "Test Cryptocurrency",
        symbol: "TCC",
        decimals: "-18",
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="decimals"]',
        "18-"
      );
      await createAssetForm.expectErrorMessage("Expected union value");
    });
  });

  test.describe("Second Screen - Cryptocurrency Details", () => {
    test.beforeAll(async () => {
      await createAssetForm.fillBasicFields({
        name: cryptocurrencyData.name,
        symbol: cryptocurrencyData.symbol,
        decimals: cryptocurrencyData.decimals,
      });
      await createAssetForm.clickOnContinueButton();
    });

    test("validates initial supply field is empty", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        initialSupply: "",
        price: "1",
      });
      await createAssetForm.clickOnContinueButton();
      await createAssetForm.expectErrorMessage("Expected number");
    });
    test("validates inital supply field is 0", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        initialSupply: "0",
        price: "10",
      });
      await createAssetForm.expectErrorMessage(
        "Expected number to be greater or equal to 0.000001"
      );
    });
    test("validates large number for initial supply fields", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        initialSupply: "10000000000000000000",
        price: "1",
      });
      await createAssetForm.expectErrorMessage(
        "Expected number to be less or equal to 9007199254740991"
      );
    });
    test("validates initial supply field can not contain special characters", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        price: "1",
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="initialSupply"]',
        "1-"
      );
      await createAssetForm.expectErrorMessage("Expected number");
    });
    test("validates price field is empty", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        initialSupply: "1",
        price: "",
      });
      await createAssetForm.expectErrorMessage("Expected number");
    });

    test("validates large number for price field", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        initialSupply: "1",
        price: "10000000000000000000",
      });
      await createAssetForm.expectErrorMessage(
        "Expected number to be less or equal to 9007199254740991"
      );
    });
    test("validates price field can not contain special characters", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        initialSupply: "1",
      });
      await createAssetForm.setInvalidValueInNumberInput(
        'input[name="price"]',
        "1-"
      );
      await createAssetForm.expectErrorMessage("Expected number");
    });
    test("verifies default currency is EUR", async () => {
      await createAssetForm.verifyCurrencyValue("EUR");
    });
  });
});

test.describe("Create cryptocurrency asset", () => {
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
  test("Create Cryptocurrency asset", async () => {
    await adminPages.adminPage.createCryptocurrency(cryptocurrencyData);
    await adminPages.adminPage.verifySuccessMessage(
      assetMessage.successMessage
    );
    await adminPages.adminPage.checkIfAssetExists({
      sidebarAssetTypes: cryptocurrencyData.sidebarAssetTypes,
      name: cryptocurrencyData.name,
      totalSupply: cryptocurrencyData.initialSupply,
    });
  });
});
