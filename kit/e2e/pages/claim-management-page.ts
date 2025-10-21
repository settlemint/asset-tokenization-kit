import { expect } from "@playwright/test";
import { confirmPinCode } from "../utils/form-utils";
import { BasePage } from "./base-page";

export class ClaimManagementPage extends BasePage {
  async navigateTo(): Promise<void> {
    await this.page.goto("/platform-settings/claim-topics-issuers");
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
    await expect(userTrigger).toBeVisible({ timeout: 10000 });
    await userTrigger.click();

    const commandDialog = this.page
      .getByRole("dialog")
      .filter({ has: this.page.getByPlaceholder("Search addresses") })
      .first();
    await expect(commandDialog).toBeVisible({ timeout: 10000 });

    const userSearchInput = commandDialog.getByPlaceholder("Search addresses");
    await userSearchInput.fill("");
    await userSearchInput.type(searchTerm, { delay: 60 });

    const escapedUser = this.escapeRegex(userName);
    const userOption = commandDialog
      .getByRole("option", { name: new RegExp(`^${escapedUser}$`, "i") })
      .first();
    await expect(userOption).toBeVisible({ timeout: 15000 });
    await userOption.click();

    await expect(commandDialog).toBeHidden({ timeout: 10000 });
    await this.waitForReactStateSettle();
    await expect(userTrigger).toContainText(userName, { timeout: 10000 });

    const topicsInput = dialog.getByPlaceholder("Select topics...");
    await expect(topicsInput).toBeVisible({ timeout: 15000 });

    const listbox = dialog.locator('[role="listbox"]').first();
    const removeButtons = dialog.getByRole("button", { name: "Remove" });
    const sheetTitle = dialog.getByRole("heading", {
      name: "Add trusted issuer",
    });

    for (const topic of topicNames) {
      const escaping = this.escapeRegex(topic);
      const chip = dialog.getByText(new RegExp(`^${escaping}$`, "i"));
      if ((await chip.count()) > 0) {
        continue;
      }

      const previousCount = await removeButtons.count();

      await topicsInput.click();
      await expect(listbox).toBeVisible({ timeout: 5000 });

      await topicsInput.evaluate((el: HTMLInputElement) => {
        el.value = "";
        el.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await topicsInput.type(topic, { delay: 40 });

      const topicOption = dialog
        .getByRole("option", { name: new RegExp(`^${escaping}$`, "i") })
        .first();
      await expect(topicOption).toBeVisible({ timeout: 10000 });
      await topicOption.click();

      await expect
        .poll(async () => removeButtons.count(), {
          timeout: 10000,
          message: `Waiting for chip count to increase after selecting ${topic}`,
        })
        .toBe(previousCount + 1);

      await sheetTitle.click();
      await expect(listbox).toBeHidden({ timeout: 3000 });
      await this.waitForReactStateSettle();
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
