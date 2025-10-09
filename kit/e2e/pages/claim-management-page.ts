import { expect } from "@playwright/test";
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

  async addTrustedIssuer(address: string, topicNames: string[]): Promise<void> {
    await this.page.getByRole("button", { name: "Add trusted issuer" }).click();
    await this.page.getByLabel("Issuer identity").fill(address);
    const topicsCombobox = this.page.getByRole("combobox", { name: "Topics" });
    await topicsCombobox.click();
    for (const topic of topicNames) {
      await this.page.getByRole("option", { name: topic }).click();
    }
    await this.page.getByRole("button", { name: "Add issuer" }).click();
    await expect(this.page.getByText("Issuer added successfully")).toBeVisible({
      timeout: 10000,
    });
  }

  async addTrustedIssuerByUser(
    userName: string,
    topicNames: string[],
    pin?: string
  ): Promise<void> {
    await this.page.getByRole("button", { name: "Add trusted issuer" }).click();
    const dialog = this.page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const searchTerm = userName.split(/\s+/)[0] ?? userName;
    const userCombobox = dialog.getByRole("combobox").first();
    await expect(userCombobox).toBeVisible({ timeout: 10000 });
    await userCombobox.click();
    const userInput = userCombobox.locator("input").first();
    if ((await userInput.count()) > 0) {
      await userInput.fill("");
      await userInput.type(searchTerm, { delay: 140 });
    } else {
      await this.page.keyboard.type(searchTerm, { delay: 140 });
    }
    await this.page
      .getByRole("option")
      .first()
      .waitFor({ state: "visible", timeout: 5000 })
      .catch(async () => {
        await this.page.waitForTimeout(300);
      });
    await this.page.keyboard.press("ArrowDown");
    await this.page.waitForTimeout(150);
    await this.page.keyboard.press("Enter");
    await this.waitForReactStateSettle();

    let topicsTrigger = dialog
      .getByRole("combobox", { name: /Claim topics|Topics/i })
      .first();
    if ((await topicsTrigger.count()) === 0) {
      topicsTrigger = dialog
        .getByRole("button", { name: /Topics|Claim topics/i })
        .first();
    }
    if ((await topicsTrigger.count()) === 0) {
      const allCombos = dialog.getByRole("combobox");
      if ((await allCombos.count()) > 1) {
        topicsTrigger = allCombos.nth(1);
      }
    }
    if ((await topicsTrigger.count()) > 0) {
      await topicsTrigger.click().catch(() => {});
      await this.page.waitForTimeout(150);
    }
    for (const topic of topicNames) {
      let option = this.page
        .getByRole("option", { name: new RegExp(`^${topic}$`, "i") })
        .first();
      if ((await option.count()) > 0) {
        await option.click();
      } else {
        let topicsInput = topicsTrigger.locator("input").first();
        if ((await topicsInput.count()) === 0) {
          topicsInput = dialog.locator("input:focus");
        }
        if ((await topicsInput.count()) === 0) {
          topicsInput = dialog.locator("input").last();
        }
        await topicsInput.fill("");
        const partial = topic.slice(0, Math.min(6, topic.length));
        await topicsInput.type(partial, { delay: 120 });
        await this.page.keyboard.press("Enter");
        await this.page.waitForTimeout(100);
      }
    }
    await dialog.click({ position: { x: 8, y: 8 } }).catch(() => {});
    await this.waitForReactStateSettle();
    for (const topic of topicNames) {
      await expect(
        dialog.getByText(new RegExp(`^${topic}$`, "i")).first()
      ).toBeVisible({ timeout: 5000 });
    }

    await dialog.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await this.waitForReactStateSettle();

    let addIssuerBtn = dialog.getByRole("button", {
      name: /Add issuer|Add trusted issuer/i,
    });
    if ((await addIssuerBtn.count()) === 0) {
      addIssuerBtn = dialog.getByRole("button", { name: /Add/i }).first();
    }
    await expect(addIssuerBtn).toBeVisible({ timeout: 30000 });
    await expect(addIssuerBtn).toBeEnabled({ timeout: 30000 });
    await addIssuerBtn.click();

    if (pin) {
      const pinDialog = this.page.getByRole("dialog");
      const pinVisible = await pinDialog
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      if (pinVisible) {
        let pinInput = pinDialog.getByPlaceholder(/pin code/i);
        if ((await pinInput.count()) === 0)
          pinInput = pinDialog.getByLabel(/pin code/i);
        if ((await pinInput.count()) === 0)
          pinInput = pinDialog.getByRole("textbox");
        await pinInput.first().fill(pin);
        await pinDialog.getByRole("button", { name: /confirm/i }).click();
        await pinDialog
          .waitFor({ state: "detached", timeout: 30000 })
          .catch(() => {});
      }
    }

    await dialog.waitFor({ state: "detached", timeout: 30000 }).catch(() => {});
    await this.waitForReactStateSettle();
    await this.page
      .getByText(/Issuer added successfully/i)
      .first()
      .waitFor({ state: "visible", timeout: 1500 })
      .catch(() => {});
  }
}
