import { expect } from "@playwright/test";
import { confirmPinCode } from "../utils/form-utils";
import { BasePage } from "./base-page";

export class ClaimManagementPage extends BasePage {
  async navigateTo(): Promise<void> {
    await this.page.goto("/admin/platform-settings/claim-topics-issuers");
    await this.waitForReactStateSettle();
  }

  async addClaimTopic(name: string, signature: string): Promise<void> {
    await this.page.getByRole("button", { name: "Add claim topic" }).click();
    await this.page.getByLabel("Name").fill(name);
    await this.page.getByLabel("Signature").fill(signature);
    await this.page.getByRole("button", { name: "Add topic" }).click();
    await expect(this.page.getByText("Topic created successfully")).toBeVisible(
      { timeout: 10000 }
    );
  }

  async addTrustedIssuerByUser(
    userName: string,
    topicNames: string[],
    pin: string
  ): Promise<void> {
    await this.page.getByRole("button", { name: "Add trusted issuer" }).click();
    const dialog = this.page.getByRole("dialog", {
      name: "Add trusted issuer",
    });
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await this.waitForReactStateSettle();

    const searchTerm = userName.split(/\s+/)[0] ?? userName;
    const userTrigger = dialog.getByRole("combobox").first();

    await this.selectFromRadixCommandPalette({
      trigger: userTrigger,
      dialog: this.page
        .getByRole("dialog")
        .filter({ has: this.page.getByPlaceholder("Search addresses") })
        .first(),
      searchInput: this.page.getByPlaceholder("Search addresses"),
      searchTerm,
      optionLocator: this.page
        .getByRole("option", {
          name: new RegExp(`^${this.escapeRegex(userName)}$`, "i"),
        })
        .first(),
      expectedSelection: userName,
      context: `trusted issuer '${userName}'`,
      typingDelay: 60,
    });

    await expect(userTrigger).toHaveText(userName, { timeout: 10000 });

    const topicsInput = dialog.getByPlaceholder("Select topics...");
    await expect(topicsInput).toBeVisible({ timeout: 15000 });

    const listbox = dialog.locator('[role="listbox"]').first();
    const removeButtons = dialog.getByRole("button", { name: "Remove" });
    const sheetTitle = dialog.getByRole("heading", {
      name: "Add trusted issuer",
    });

    for (const topic of topicNames) {
      const escaping = this.escapeRegex(topic);
      await this.ensureRadixMultiSelectOption({
        value: topic,
        input: topicsInput,
        listbox,
        sheetTitle,
        removeButtons,
        typingDelay: 40,
        context: `topic '${topic}'`,
        chipLocator: dialog.getByText(new RegExp(`^${escaping}$`, "i")),
        optionLocator: dialog
          .getByRole("option", { name: new RegExp(`^${escaping}$`, "i") })
          .first(),
      });
    }

    await sheetTitle.click();
    await expect(listbox).toBeHidden({ timeout: 3000 });
    await dialog.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await this.waitForReactStateSettle();

    const addIssuerBtn = dialog
      .getByRole("button", { name: /Add issuer|Add trusted issuer/i })
      .first();
    await expect(addIssuerBtn).toBeEnabled({ timeout: 30000 });
    await addIssuerBtn.click();

    await confirmPinCode(this.page, pin, "Confirm issuer addition");

    await expect(dialog).toBeHidden({ timeout: 30000 });
    await this.waitForReactStateSettle();
    await expect(
      this.page
        .getByText(
          /Issuer added successfully|Trusted issuer added successfully/i
        )
        .first()
    ).toBeVisible({ timeout: 15000 });
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
