import type { Page } from '@playwright/test';

export async function searchAndSelectFromDialog(
  page: Page,
  walletAddress: string,
  displayName: string,
  optionSelector = '[role="option"]'
): Promise<void> {
  await page.waitForSelector('[role="dialog"][data-state="open"]', {
    timeout: 30_000,
  });

  const triggerButton = page.locator(
    '[role="dialog"][data-state="open"] button[data-slot="popover-trigger"]'
  );
  if (await triggerButton.isVisible()) {
    await triggerButton.click();

    await page.waitForSelector(
      '[role="dialog"][data-state="open"] input:visible, [data-slot="command-input"]:visible',
      {
        timeout: 15_000,
        state: 'visible',
      }
    );
  }

  const searchInput = page.locator(
    '[role="dialog"][data-state="open"] input, [data-slot="command-input"]'
  );
  await searchInput.waitFor({ state: 'visible', timeout: 20_000 });
  await searchInput.click();
  await searchInput.fill(walletAddress);
  await page.waitForSelector(
    `${optionSelector}, [data-slot="command-item"], [role="option"]`,
    {
      timeout: 20_000,
      state: 'visible',
    }
  );

  try {
    const option = page
      .locator(optionSelector)
      .filter({ hasText: displayName })
      .first();

    await option.waitFor({ state: 'visible', timeout: 10_000 });
    await option.click();
  } catch (_error) {
    try {
      const commandOption = page
        .locator('[data-slot="command-item"]')
        .filter({ hasText: displayName })
        .first();
      await commandOption.click();
    } catch (_e) {
      const fallbackOption = page
        .locator('[role="option"]')
        .filter({ hasText: displayName })
        .first();
      await fallbackOption.waitFor({ state: 'visible', timeout: 10_000 });
      await fallbackOption.click();
    }
  }
}

export async function selectRecipientFromDialog(
  page: Page,
  walletAddress: string,
  user: string,
  optionSelector = '[role="option"]'
) {
  await page.waitForSelector('[role="dialog"][data-state="open"]');

  const searchInput = page.locator('[role="dialog"][data-state="open"] input');
  await searchInput.waitFor({ state: 'visible' });
  await searchInput.fill(walletAddress);

  await page.locator(optionSelector).filter({ hasText: user }).first().click();
}

export function formatAmount(
  amount: string,
  currencyRegex: RegExp = /[A-Z]+$/,
  commaRegex: RegExp = /,/g
): string {
  return amount
    .replace(currencyRegex, '')
    .replace(commaRegex, '')
    .trim()
    .split('.')[0]
    .replace(/(\d+).*/s, '$1')
    .trim();
}

export function parseAmountString(text: string): number {
  if (!text) {
    throw new Error('Cannot parse empty amount string');
  }

  let numericValue: number | null = null;

  const matchInParens = text.match(/\(([^)]+)\)/);
  if (matchInParens?.[1]) {
    const valueInParens = matchInParens[1].replace(/[€$£,]/g, '').trim();
    numericValue = Number.parseFloat(valueInParens);
  } else {
    let cleanedAmount = text.replace(/[€$£,]/g, '').trim();

    const kiloMatch = cleanedAmount.match(/^([\d.]+)\s*K$/i);
    if (kiloMatch?.[1]) {
      numericValue = Number.parseFloat(kiloMatch[1]) * 1000;
    } else {
      cleanedAmount = cleanedAmount.replace(/[^\d.]/g, '');
      numericValue = Number.parseFloat(cleanedAmount);
    }
  }

  if (numericValue === null || Number.isNaN(numericValue)) {
    throw new Error(`Could not parse amount from text: "${text}"`);
  }

  return numericValue;
}

export async function clickAssetDetailTab(
  page: Page,
  tabName: string
): Promise<void> {
  const tabSelector = page
    .locator('nav[data-slot="navigation-menu"] a')
    .filter({ hasText: tabName });

  await tabSelector.waitFor({ state: 'visible', timeout: 10_000 });
  await tabSelector.scrollIntoViewIfNeeded();
  await tabSelector.click();

  if (tabName === 'Details') {
    await page.waitForURL(
      (url) => {
        const urlStr = url.toString();
        return (
          urlStr.includes('/assets/') &&
          !urlStr.includes('/holders') &&
          !urlStr.includes('/events') &&
          !urlStr.includes('/permissions') &&
          !urlStr.includes('/allowlist')
        );
      },
      { timeout: 10_000 }
    );
  } else {
    const tabPath = getTabPathSegment(tabName);
    if (tabPath) {
      await page.waitForURL(new RegExp(`.*/${tabPath}.*`), { timeout: 10_000 });
    }
  }
}

function getTabPathSegment(tabName: string): string | undefined {
  const tabMap: Record<string, string> = {
    Details: '',
    Holders: 'holders',
    Events: 'events',
    Permissions: 'permissions',
    'Allow list': 'allowlist',
  };

  return tabMap[tabName];
}
