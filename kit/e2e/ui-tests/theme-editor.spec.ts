import { test, expect } from "@playwright/test";
import { Pages } from "../pages/pages";
import { getSetupUser } from "../utils/setup-user";

test.describe("Theme editor", () => {
  test("updates palette tokens and logos with persistence", async ({
    page,
    request,
  }) => {
    const setupUser = getSetupUser();
    const pages = Pages(page);

    await pages.signInPage.goto();
    await pages.signInPage.fillSignInForm(setupUser.email, setupUser.password);
    await pages.signInPage.submitSignInForm();
    await pages.signInPage.expectSuccessfulLoginWithDashboard();

    await pages.themeSettingsPage.goto();
    await pages.themeSettingsPage.openEditorTab("Light palette");

    const originalPrimary =
      await pages.themeSettingsPage.getColorTokenValue("primary");
    const newPrimary =
      originalPrimary === "oklch(0.48 0.08 120.0)"
        ? "oklch(0.42 0.06 140.0)"
        : "oklch(0.48 0.08 120.0)";

    await pages.themeSettingsPage.setColorToken("primary", newPrimary);
    await pages.themeSettingsPage.expectColorSwatchValue("primary", newPrimary);

    await pages.themeSettingsPage.openEditorTab("Logos");
    const originalLightLogo =
      await pages.themeSettingsPage.getLogoValue("light");
    const originalDarkLogo = await pages.themeSettingsPage.getLogoValue("dark");

    const lightLogo = "https://cdn.example.com/theme-light.svg";
    const darkLogo = "https://cdn.example.com/theme-dark.svg";

    await pages.themeSettingsPage.setLogoUrl("light", lightLogo);
    await pages.themeSettingsPage.setLogoUrl("dark", darkLogo);

    await pages.themeSettingsPage.openPreviewTab("Dark preview");
    await pages.themeSettingsPage.openPreviewTab("Light preview");

    await pages.themeSettingsPage.save();
    await pages.themeSettingsPage.expectToast("Theme saved successfully.");

    const themeHash = await pages.themeSettingsPage.getThemeHash();
    if (themeHash) {
      const cssResponse = await request.get(`/api/theme.css?hash=${themeHash}`);
      expect(cssResponse.ok()).toBeTruthy();
      const cssText = await cssResponse.text();
      expect(cssText).toContain(newPrimary);
    }

    await page.reload();
    await pages.themeSettingsPage.waitForLoaded();
    await pages.themeSettingsPage.openEditorTab("Light palette");
    await pages.themeSettingsPage.expectColorInputValue("primary", newPrimary);

    await pages.themeSettingsPage.openEditorTab("Logos");
    const lightLogoInput = await pages.themeSettingsPage.getLogoValue("light");
    const darkLogoInput = await pages.themeSettingsPage.getLogoValue("dark");
    expect(lightLogoInput).toBe(lightLogo);
    expect(darkLogoInput).toBe(darkLogo);

    await pages.themeSettingsPage.openEditorTab("Light palette");
    await pages.themeSettingsPage.setColorToken("primary", originalPrimary);
    await pages.themeSettingsPage.openEditorTab("Logos");
    await pages.themeSettingsPage.setLogoUrl("light", originalLightLogo);
    await pages.themeSettingsPage.setLogoUrl("dark", originalDarkLogo);

    await pages.themeSettingsPage.save();
    await pages.themeSettingsPage.expectToast("Theme saved successfully.");
    await pages.portfolioPage.signOut();
    await pages.portfolioPage.expectSignOutSuccess();
  });
});
