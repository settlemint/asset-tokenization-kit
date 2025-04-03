import { type BrowserContext, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { cryptocurrencyData } from "../test-data/asset-data";
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
    test("validates required fields are empty", async () => {
      await createAssetForm.selectAssetType(cryptocurrencyData.assetType);
      await createAssetForm.fillBasicFields({
        name: "",
        symbol: "",
        decimals: "18",
      });
      await createAssetForm.clickNext();
      await createAssetForm.expectErrorMessage("Please enter text");
    });

    test("verifies input length restrictions", async () => {
      await createAssetForm.verifyInputAttribute("Name", "maxlength", "50");
      await createAssetForm.verifyInputAttribute("Symbol", "maxlength", "10");
    });

    test("validates decimals range", async () => {
      await createAssetForm.fillBasicFields({
        decimals: "19",
      });
      await createAssetForm.clickNext();
      await createAssetForm.expectErrorMessage("Please enter a valid value");
    });

    test("validates default decimals value", async () => {
      await createAssetForm.verifyInputAttribute("Decimals", "value", "18");
    });
  });

  test.describe("Second Screen - Cryptocurrency Details", () => {
    test.beforeAll(async () => {
      await createAssetForm.fillBasicFields({
        name: cryptocurrencyData.name,
        symbol: cryptocurrencyData.symbol,
        decimals: cryptocurrencyData.decimals,
      });
      await createAssetForm.clickNext();
    });

    test("validates required fields are empty", async () => {
      await createAssetForm.clickNext();
      await createAssetForm.expectErrorMessage("Please enter a valid number");
    });

    test("validates numeric field values", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        initialSupply: "-100",
        price: "-10",
      });
      await createAssetForm.clickNext();
      await createAssetForm.expectErrorMessage("Please enter a valid number");
    });

    test("validates large number for initialSupply", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        initialSupply: "10000000000000000000",
        price: "1",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a number no greater than 9007199254740991"
      );
    });
    test("validates large number for price", async () => {
      await createAssetForm.fillCryptocurrencyDetails({
        initialSupply: "1",
        price: "10000000000000000000",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a number no greater than 9007199254740991"
      );
    });
  });
});
