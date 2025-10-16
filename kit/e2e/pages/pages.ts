import type { Page } from "@playwright/test";
import { AdminPage } from "./admin-page";
import { CreateAssetForm } from "./create-asset-form";
import { OnboardingPage } from "./onboarding-page";
import { PortfolioPage } from "./portfolio-page";
import { SignInPage } from "./sign-in-page";
import { SignUpPage } from "./sign-up-page";
import { ThemeSettingsPage } from "./theme-settings-page";
import { XvpSettlementPage } from "./xvp-settlement-page";

export function Pages(page: Page) {
  return {
    adminPage: new AdminPage(page),
    createAssetForm: new CreateAssetForm(page),
    onboardingPage: new OnboardingPage(page),
    portfolioPage: new PortfolioPage(page),
    signInPage: new SignInPage(page),
    signUpPage: new SignUpPage(page),
    themeSettingsPage: new ThemeSettingsPage(page),
    xvpSettlementPage: new XvpSettlementPage(page),
  };
}

export type PagesType = ReturnType<typeof Pages>;
