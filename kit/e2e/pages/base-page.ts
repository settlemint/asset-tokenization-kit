import type { Page } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}

export { expect } from '@playwright/test';
export type { Page } from '@playwright/test';
