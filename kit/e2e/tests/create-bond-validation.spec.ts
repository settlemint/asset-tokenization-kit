import { type BrowserContext, test } from "@playwright/test";
import { CreateAssetForm } from "../pages/create-asset-form";
import { Pages } from "../pages/pages";
import { bondData } from "../test-data/asset-data";
import { adminUser } from "../test-data/user-data";
import { ensureUserIsAdmin } from "../utils/db-utils";

test.describe("Bond Creation Validation", () => {
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
      await createAssetForm.selectAssetType(bondData.assetType);
      await createAssetForm.fillBasicFields({
        name: "",
        symbol: "",
        decimals: "18",
        isin: "",
      });
      await createAssetForm.clickNext();
      await createAssetForm.expectErrorMessage("Please enter text");
    });

    test("verifies input length restrictions", async () => {
      await createAssetForm.verifyInputAttribute("Name", "maxlength", "50");
      await createAssetForm.verifyInputAttribute("Symbol", "maxlength", "10");
    });

    test("validates ISIN format", async () => {
      await createAssetForm.fillBasicFields({
        isin: "invalid-isin",
      });
      await createAssetForm.clickNext();
      await createAssetForm.expectErrorMessage(
        "Please enter text in the correct isin format"
      );
    });

    test("validates decimals range", async () => {
      await createAssetForm.fillBasicFields({
        decimals: "19",
      });
      await createAssetForm.clickNext();
      await createAssetForm.expectErrorMessage("Please enter a valid value");
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
      await createAssetForm.clickNext();
    });

    test("validates required fields are empty", async () => {
      await createAssetForm.clickNext();
      await createAssetForm.expectErrorMessage("Please enter a valid number");
      await createAssetForm.expectErrorMessage(
        "Please provide all required information"
      );
    });

    test("validates numeric field values", async () => {
      await createAssetForm.fillBondDetails({
        maximumSupply: "-100",
        faceValue: "-50",
        price: "-10",
      });
      await createAssetForm.clickNext();
      await createAssetForm.expectErrorMessage("Please enter a valid number");
    });

    test("validates underlying asset is required", async () => {
      await createAssetForm.fillBondDetails({
        maximumSupply: "1000",
        faceValue: "100",
        maturityDate: createAssetForm.getMaturityDate({ daysOffset: 365 }),
        price: "1",
      });
      await createAssetForm.clickNext();
      await createAssetForm.expectErrorMessage(
        "Please provide all required information"
      );
    });

    //Unskip this test once the issue is fixed https://linear.app/settlemint/issue/ENG-2830/[bond]possible-to-type-date-in-the-past
    test.skip("validates maturity date", async () => {
      await createAssetForm.fillBondDetails({
        maturityDate: createAssetForm.getMaturityDate({ isPast: true }),
      });
      await createAssetForm.expectErrorMessage("Please enter a valid date");
    });

    test("validates large numbers", async () => {
      await createAssetForm.fillBondDetails({
        maximumSupply: "10000000000000000000",
        faceValue: "10000000000000000000",
      });
      await createAssetForm.expectErrorMessage(
        "Please enter a number no greater than 9007199254740991"
      );
    });
  });
});
