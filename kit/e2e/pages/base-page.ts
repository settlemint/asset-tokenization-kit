import { expect, type Locator, type Page } from "@playwright/test";

export class BasePage {
  protected page: Page;
  protected readonly calendarMonthTokens = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  constructor(page: Page) {
    this.page = page;
  }

  public async confirmPincode(pincode: string): Promise<void> {
    await this.page.getByRole("dialog").waitFor({ state: "visible" });
    await this.page.locator('[data-input-otp="true"]').fill(pincode);
    await this.page.getByRole("button", { name: "Yes, confirm" }).click();
  }

  public async waitForReactStateSettle(): Promise<void> {
    await this.page.waitForTimeout(100);
    await this.page.waitForLoadState("networkidle");
  }

  protected async selectDateFromRadixCalendar(
    triggerSelector: string,
    year: string,
    month: string,
    day: string,
    context: string
  ): Promise<void> {
    const popover = await this.openCalendarPopover(triggerSelector);
    const monthIndex = this.resolveCalendarMonth(month, year);

    await this.pickCalendarMonth(popover, monthIndex, month, context);
    await this.pickCalendarYear(popover, year, context);
    await this.pickCalendarDay(popover, monthIndex, day, month, year, context);

    await popover
      .waitFor({ state: "detached", timeout: 20000 })
      .catch((error) => {
        console.warn(
          "[WARN] calendar popover did not detach within timeout",
          error
        );
      });
    await this.waitForReactStateSettle();
  }

  private async openCalendarPopover(triggerSelector: string): Promise<Locator> {
    const trigger = this.page.locator(triggerSelector);
    await expect(trigger).toBeVisible({ timeout: 20000 });
    await expect(trigger).toBeEnabled({ timeout: 20000 });
    await trigger.click();
    await this.waitForReactStateSettle();

    const popover = this.page
      .locator('[data-slot="popover-content"][data-state="open"]')
      .filter({ has: this.page.locator('[data-slot="calendar"]') })
      .first();
    await expect(popover).toBeVisible({ timeout: 20000 });
    return popover;
  }

  private resolveCalendarMonth(month: string, year: string): number {
    const normalized = month.toLowerCase().slice(0, 3);
    const directIndex = this.calendarMonthTokens.findIndex(
      (token) => token.toLowerCase() === normalized
    );
    if (directIndex >= 0) {
      return directIndex;
    }

    const fallback = new Date(`${month} 1, ${year}`);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback.getMonth();
    }

    return 0;
  }

  private async pickCalendarMonth(
    popover: Locator,
    monthIndex: number,
    monthLabel: string,
    context: string
  ): Promise<void> {
    const monthSelect = popover.locator("select.rdp-months_dropdown").first();
    await expect(monthSelect).toBeVisible({ timeout: 20000 });
    const options = await monthSelect.locator("option").allTextContents();
    if (monthIndex >= 0 && monthIndex < options.length) {
      await monthSelect.selectOption(monthIndex.toString());
      await expect(monthSelect).toHaveValue(monthIndex.toString(), {
        timeout: 5000,
      });
    } else {
      console.warn(
        `[WARN] (${context}) Target month '${monthLabel}' not found in options:`,
        options
      );
      throw new Error(
        `[Calendar] (${context}) could not set month '${monthLabel}'.`
      );
    }
  }

  private async pickCalendarYear(
    popover: Locator,
    year: string,
    context: string
  ): Promise<void> {
    const yearSelect = popover.locator("select.rdp-years_dropdown").first();
    await expect(yearSelect).toBeVisible({ timeout: 20000 });
    const options = await yearSelect.locator("option").allTextContents();
    if (options.includes(year)) {
      await yearSelect.selectOption(year);
      await expect(yearSelect).toHaveValue(year, { timeout: 5000 });
    } else {
      console.warn(
        `[WARN] (${context}) Target year '${year}' not found in options:`,
        options
      );
      throw new Error(`[Calendar] (${context}) could not set year '${year}'.`);
    }
  }

  private async pickCalendarDay(
    popover: Locator,
    monthIndex: number,
    day: string,
    monthLabel: string,
    year: string,
    context: string
  ): Promise<void> {
    const numericDay = Number.parseInt(day, 10);
    if (Number.isNaN(numericDay)) {
      throw new Error(`Invalid day '${day}' supplied for ${context}`);
    }

    const effectiveMonth = monthIndex >= 0 && monthIndex <= 11 ? monthIndex : 0;
    const ariaLabels = this.buildCalendarAriaLabels(
      effectiveMonth,
      numericDay,
      monthLabel,
      year
    );

    for (const label of ariaLabels) {
      const candidate = popover
        .locator(`button[aria-label="${label}"]`)
        .first();
      if ((await candidate.count()) > 0 && (await candidate.isVisible())) {
        await candidate.scrollIntoViewIfNeeded();
        await candidate.click();
        return;
      }
    }

    const fallback = popover
      .locator(
        `button[data-day="${this.formatCalendarDay(effectiveMonth, numericDay, year)}"]`
      )
      .first();
    if ((await fallback.count()) > 0 && (await fallback.isVisible())) {
      await fallback.scrollIntoViewIfNeeded();
      await fallback.click();
      return;
    }

    const availableLabels = await popover
      .locator('button[data-slot="button"][aria-label]')
      .evaluateAll((buttons) =>
        buttons.map((button) => button.getAttribute("aria-label") ?? "")
      );
    console.warn(
      `[WARN] (${context}) Target day '${day}' not found. Available aria-labels:`,
      availableLabels
    );
    throw new Error(
      `[Calendar] (${context}) could not select day '${day}' for ${monthLabel} ${year}.`
    );
  }

  private buildCalendarAriaLabels(
    monthIndex: number,
    day: number,
    monthLabel: string,
    year: string
  ): string[] {
    const targetDate = new Date(Number.parseInt(year, 10), monthIndex, day);
    const weekday = targetDate.toLocaleDateString("en-US", { weekday: "long" });
    const fullMonth = targetDate.toLocaleDateString("en-US", { month: "long" });
    const suffix = (value: number) =>
      (value > 3 && value < 21) || value % 10 > 3
        ? "th"
        : (["st", "nd", "rd"][(value % 10) - 1] ?? "th");

    return [
      `${weekday}, ${fullMonth} ${day}${suffix(day)}, ${year}`,
      `${weekday}, ${monthLabel} ${day}${suffix(day)}, ${year}`,
      `${weekday}, ${fullMonth} ${day}, ${year}`,
      `${weekday}, ${monthLabel} ${day}, ${year}`,
    ];
  }

  private formatCalendarDay(
    monthIndex: number,
    day: number,
    year: string
  ): string {
    const paddedDay = day.toString().padStart(2, "0");
    const paddedMonth = (monthIndex + 1).toString().padStart(2, "0");
    return `${paddedDay}/${paddedMonth}/${year}`;
  }

  protected async ensureRadixMultiSelectOption(params: {
    value: string;
    input: Locator;
    listbox: Locator;
    sheetTitle: Locator;
    removeButtons: Locator;
    chipLocator: Locator;
    optionLocator: Locator;
    typingDelay?: number;
    context: string;
  }): Promise<void> {
    const {
      value,
      input,
      listbox,
      sheetTitle,
      removeButtons,
      chipLocator,
      optionLocator,
      typingDelay = 40,
      context,
    } = params;

    if ((await chipLocator.count()) > 0) {
      return;
    }

    const previousCount = await removeButtons.count();

    await input.click();
    await expect(listbox).toBeVisible({ timeout: 5000 });

    await input.evaluate((el: HTMLInputElement) => {
      el.value = "";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await input.type(value, { delay: typingDelay });

    await expect(optionLocator).toBeVisible({ timeout: 10000 });
    await optionLocator.click();

    await expect
      .poll(async () => removeButtons.count(), {
        timeout: 10000,
        message: `Waiting for chip count to increase after selecting ${context}`,
      })
      .toBe(previousCount + 1);

    await sheetTitle.click();
    await expect(listbox).toBeHidden({ timeout: 3000 });
    await this.waitForReactStateSettle();
  }

  protected async selectFromRadixCommandPalette(params: {
    trigger: Locator;
    dialog: Locator;
    searchInput: Locator;
    searchTerm: string;
    optionLocator: Locator;
    expectedSelection?: string;
    typingDelay?: number;
    context: string;
    triggerLabelFor?: string;
  }): Promise<void> {
    const {
      trigger,
      dialog,
      searchInput,
      searchTerm,
      optionLocator,
      expectedSelection,
      typingDelay = 50,
      context,
      triggerLabelFor,
    } = params;

    let resolvedTrigger = trigger;
    if ((await resolvedTrigger.count()) === 0 && triggerLabelFor) {
      resolvedTrigger = this.page
        .locator(
          `label[for="${triggerLabelFor}"] + p + button[role="combobox"]`
        )
        .first();
    }

    let resolvedDialog = dialog;
    if ((await resolvedDialog.count()) === 0) {
      resolvedDialog = this.page
        .locator('[data-slot="popover-content"][role="dialog"]')
        .first();
    }

    let resolvedSearchInput = searchInput;
    if ((await resolvedSearchInput.count()) === 0) {
      resolvedSearchInput = this.page
        .locator(
          'input[placeholder="Search for an asset..."], input[placeholder="Search addresses"]'
        )
        .first();
    }

    await expect(resolvedTrigger).toBeVisible({ timeout: 20000 });
    await expect(resolvedTrigger).toBeEnabled({ timeout: 20000 });
    await resolvedTrigger.click();

    await expect(resolvedDialog).toBeVisible({ timeout: 20000 });

    await resolvedSearchInput.fill("");
    if (searchTerm.length > 0) {
      await resolvedSearchInput.type(searchTerm, { delay: typingDelay });
    }

    await expect(optionLocator).toBeVisible({ timeout: 20000 });
    await optionLocator.click();

    await expect(resolvedDialog).toBeHidden({ timeout: 20000 });
    await this.waitForReactStateSettle();

    if (expectedSelection) {
      await expect(resolvedTrigger).toContainText(expectedSelection, {
        timeout: 20000,
      });
    }
  }
}

export { expect } from "@playwright/test";
export type { Page } from "@playwright/test";
