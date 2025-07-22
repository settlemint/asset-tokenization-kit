import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { searchAndSelectFromDialog } from "../utils/page-utils";
import { BasePage } from "./base-page";
export interface XvpAssetFlow {
  fromUser: string;
  toUser: string;
  assetName: string;
  amount: string;
}

export class XvpSettlementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickCreateNewXvpSettlementButton(): Promise<void> {
    const createXvpButton = this.page.getByRole("button", {
      name: "Create a new XvP Settlement",
    });
    await createXvpButton.click();
  }

  async configureXvpAssetFlows(options: {
    flows: XvpAssetFlow[];
  }): Promise<void> {
    for (let i = 0; i < options.flows.length; i++) {
      const flow = options.flows[i];

      if (i > 0) {
        const addButton = this.page
          .getByRole("button", { name: /Add/i })
          .filter({
            has: this.page.locator("svg.lucide-plus"),
          });
        await expect(
          addButton,
          `Add button for new flow should be visible`
        ).toBeVisible();
        await addButton.click();
        await this.page
          .locator(`button#flows\\.${i}\\.from`)
          .waitFor({ state: "visible", timeout: 5000 });
      }

      const fromButtonId = `button#flows\\.${i}\\.from`;
      const toButtonId = `button#flows\\.${i}\\.to`;
      const assetButtonId = `button#flows\\.${i}\\.asset`;
      const amountInputId = `input#flows\\.${i}\\.amount`;

      const fromButton = this.page.locator(fromButtonId);
      await expect(
        fromButton,
        `From button for flow ${i} should be visible`
      ).toBeVisible();
      await fromButton.click();
      await searchAndSelectFromDialog(this.page, flow.fromUser, flow.fromUser);

      const toButton = this.page.locator(toButtonId);
      await expect(
        toButton,
        `To button for flow ${i} should be visible`
      ).toBeVisible();
      await toButton.click();
      await searchAndSelectFromDialog(this.page, flow.toUser, flow.toUser);

      const assetButton = this.page.locator(assetButtonId);
      await expect(
        assetButton,
        `Asset button for flow ${i} should be visible`
      ).toBeVisible();
      await assetButton.click();
      await searchAndSelectFromDialog(
        this.page,
        flow.assetName,
        flow.assetName
      );

      const amountInput = this.page.locator(amountInputId);
      await expect(
        amountInput,
        `Amount input for flow ${i} should be visible`
      ).toBeVisible();
      await amountInput.fill(flow.amount);
    }

    await this.clickNextButton();
  }

  async configureXvpSettlementConfiguration(options: {
    expiryDateTime: string;
    autoExecute?: boolean;
  }): Promise<void> {
    const configurationHeader = this.page
      .locator("h2")
      .filter({ hasText: "Configuration" });
    await expect(
      configurationHeader,
      "Configuration screen header should be visible"
    ).toBeVisible({ timeout: 10000 });

    const expiryInput = this.page.locator("input#expiry");
    await expect(expiryInput, "Expiry input should be visible").toBeVisible();
    await expiryInput.fill(options.expiryDateTime);

    if (options.autoExecute !== undefined) {
      const autoExecuteSwitch = this.page.locator("button#autoExecute");
      await expect(
        autoExecuteSwitch,
        "Auto execute switch should be visible"
      ).toBeVisible();
      const currentState =
        (await autoExecuteSwitch.getAttribute("aria-checked")) === "true";
      if (currentState !== options.autoExecute) {
        await autoExecuteSwitch.click();
      }
    }
    await this.clickNextButton();
  }

  async reviewAndConfirmXvpSettlement(options: {
    pincode: string;
  }): Promise<void> {
    const summaryHeader = this.page
      .locator("h2")
      .filter({ hasText: "Summary" });
    await expect(
      summaryHeader,
      "Summary screen header should be visible"
    ).toBeVisible({ timeout: 10000 });

    const createSettlementButton = this.page.getByRole("button", {
      name: "Create a new XvP Settlement",
    });
    await expect(
      createSettlementButton,
      "'Create a new XvP Settlement' button on summary should be visible"
    ).toBeVisible();
    await createSettlementButton.click();
    this.confirmPincode(options.pincode);
  }

  async clickNextButton(): Promise<void> {
    const nextButton = this.page.getByRole("button", { name: "Next" });
    await nextButton.click();
  }

  private async getColumnIndices(
    headers: string[]
  ): Promise<Record<string, number>> {
    const indices: Record<string, number> = {};
    const headerCells = this.page.locator(
      "table[data-slot='table'] thead[data-slot='table-header'] th[data-slot='table-head']"
    );
    const headerCount = await headerCells.count();

    for (const headerName of headers) {
      let found = false;
      for (let i = 0; i < headerCount; i++) {
        const cell = headerCells.nth(i);
        const cellText = (await cell.textContent())?.trim();
        if (cellText?.toLowerCase().includes(headerName.toLowerCase())) {
          indices[headerName] = i;
          found = true;
          break;
        }
      }
      if (!found) {
        console.warn(
          `Header column '${headerName}' not found. This might lead to errors.`
        );
        indices[headerName] = -1;
      }
    }
    return indices;
  }

  async chooseCreatedXvpSettlement(options: {
    settlementStatus: string;
    settlementExpiry: string;
    maxCreationAgeInMinutes?: number;
    timeout?: number;
  }): Promise<void> {
    const tableBody = this.page.locator(
      "table[data-slot='table'] tbody[data-slot='table-body']"
    );
    await expect(
      tableBody,
      "XvP settlements table body should be visible"
    ).toBeVisible({ timeout: options?.timeout || 30000 });

    const columnNames = ["Status", "Expiry", "Created at"];
    const indices = await this.getColumnIndices(columnNames);

    if (
      indices["Status"] === -1 ||
      indices["Expiry"] === -1 ||
      indices["Created at"] === -1
    ) {
      throw new Error(
        "Required columns (Status, Expiry, or Created at) not found in the table header."
      );
    }

    await expect
      .poll(
        async () => {
          const rows = tableBody.locator("tr[data-slot='table-row']");
          const rowCount = await rows.count();
          if (rowCount === 0) {
            return false;
          }

          const now = new Date();

          for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const statusCell = row
              .locator("td[data-slot='table-cell']")
              .nth(indices["Status"]);
            const expiryCell = row
              .locator("td[data-slot='table-cell']")
              .nth(indices["Expiry"]);
            const createdAtCell = row
              .locator("td[data-slot='table-cell']")
              .nth(indices["Created at"]);

            const statusText = (await statusCell.textContent())?.trim();
            const expiryText = (await expiryCell.textContent())?.trim();
            const createdAtText = (await createdAtCell.textContent())
              ?.trim()
              .toLowerCase();

            let meetsCreationTimeCriteria = true;
            if (
              options.maxCreationAgeInMinutes !== undefined &&
              createdAtText
            ) {
              meetsCreationTimeCriteria = false;
              let createdAtDate: Date | null = null;

              if (createdAtText.includes("minutes ago")) {
                const minutesAgoMatch =
                  createdAtText.match(/(\d+)\s+minutes ago/);
                if (minutesAgoMatch && minutesAgoMatch[1]) {
                  const minutes = parseInt(minutesAgoMatch[1], 10);
                  if (
                    !isNaN(minutes) &&
                    minutes <= options.maxCreationAgeInMinutes
                  ) {
                    meetsCreationTimeCriteria = true;
                  }
                }
              } else if (createdAtText.includes("a minute ago")) {
                if (options.maxCreationAgeInMinutes >= 1) {
                  meetsCreationTimeCriteria = true;
                }
              } else if (createdAtText.includes("today at")) {
                const timeMatch = createdAtText.match(
                  /today at (\d{1,2}):(\d{2}) (am|pm)/
                );
                if (timeMatch) {
                  let hours = parseInt(timeMatch[1], 10);
                  const minutes = parseInt(timeMatch[2], 10);
                  const isPm = timeMatch[3] === "pm";

                  if (isPm && hours < 12) {
                    hours += 12;
                  }
                  if (!isPm && hours === 12) {
                    hours = 0;
                  }

                  createdAtDate = new Date();
                  createdAtDate.setHours(hours, minutes, 0, 0);

                  const diffInMilliseconds =
                    now.getTime() - createdAtDate.getTime();
                  const diffInMinutes = diffInMilliseconds / (1000 * 60);
                  if (
                    diffInMinutes <= options.maxCreationAgeInMinutes &&
                    diffInMinutes >= 0
                  ) {
                    meetsCreationTimeCriteria = true;
                  }
                }
              }
            }

            if (
              statusText?.includes(options.settlementStatus) &&
              expiryText?.includes(options.settlementExpiry) &&
              meetsCreationTimeCriteria
            ) {
              const detailsButton = row
                .locator("td[data-slot='table-cell']")
                .getByRole("button", { name: "Details" });
              const actionCellWithButton = row.locator(
                "td[data-slot='table-cell']:has(button:has-text('Details'))"
              );

              if (
                (await actionCellWithButton.isVisible()) &&
                (await detailsButton.isVisible())
              ) {
                await detailsButton.click();
                return true;
              }
            }
          }
          return false;
        },
        {
          message: `Waiting for a ${options.settlementStatus} settlement, expiring ${options.settlementExpiry}, created within ${options.maxCreationAgeInMinutes || "any"} minutes, to appear and click 'Details'`,
          timeout: options?.timeout || 60000,
          intervals: [1000, 2000, 5000],
        }
      )
      .toBe(true);
  }

  async approveXvpSettlement(options: { pincode: string }): Promise<void> {
    await this.page.getByRole("button", { name: "Manage" }).click();
    const approveOption = this.page.getByRole("menuitem", {
      name: "Approve",
    });

    await approveOption.waitFor({ state: "visible" });
    await approveOption.click();

    const finalApproveButton = this.page.getByRole("button", {
      name: "Approve",
    });
    await expect(
      finalApproveButton,
      "Final Approve button should be visible"
    ).toBeVisible({ timeout: 10000 });
    await finalApproveButton.click();
    await this.confirmPincode(options.pincode);
  }

  async verifySettlementStatus(options: {
    status: string;
    timeout?: number;
  }): Promise<void> {
    const statusContainer = this.page.locator(
      "div.ml-2.flex.items-center.gap-2.font-normal.text-base"
    );
    const statusBadge = statusContainer.locator("span[data-slot='badge']");

    await expect
      .poll(
        async () => {
          await this.page.reload();
          await expect(
            statusBadge,
            "Status badge should eventually become visible"
          ).toBeVisible({ timeout: 5000 });
          const statusText = (await statusBadge.textContent())?.trim();
          return statusText === options.status;
        },
        {
          message: `Waiting for settlement status to become ${options.status}`,
          timeout: options?.timeout || 60000,
          intervals: [2000, 5000, 10000],
        }
      )
      .toBe(true);
  }
}
