import type { Page } from '@playwright/test';
import { AdminPage } from './admin-page';
import { PortfolioPage } from './portfolio-page';
import { SignInPage } from './sign-in-page';
import { SignUpPage } from './sign-up-page';

export const Pages = (page: Page) => {
  return {
    signInPage: new SignInPage(page),
    signUpPage: new SignUpPage(page),
    adminPage: new AdminPage(page),
    portfolioPage: new PortfolioPage(page),
  };
};

export type PagesType = ReturnType<typeof Pages>;
