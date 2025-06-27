import type { Page } from '@playwright/test';
import { AdminPage } from './admin-page';
import { CreateAssetForm } from './create-asset-form';
import { PortfolioPage } from './portfolio-page';
import { SignInPage } from './sign-in-page';
import { SignUpPage } from './sign-up-page';
import { XvpSettlementPage } from './xvp-settlement-page';
export const Pages = (page: Page) => {
  return {
    adminPage: new AdminPage(page),
    createAssetForm: new CreateAssetForm(page),
    portfolioPage: new PortfolioPage(page),
    signInPage: new SignInPage(page),
    signUpPage: new SignUpPage(page),
    xvpSettlementPage: new XvpSettlementPage(page),
  };
};

export type PagesType = ReturnType<typeof Pages>;
