import { expect } from "@playwright/test";
import { confirmPinCode } from "../utils/form-utils";
import { BasePage } from "./base-page";

export class RoleManagementPage extends BasePage {
  async navigateToPlatformAdmins(): Promise<void> {
    try {
      await this.page.getByText("Platform Settings").click();
      await this.waitForReactStateSettle();

      await this.page.getByRole("link", { name: "Platform admins" }).click();
      await this.waitForReactStateSettle();
    } catch (error) {
      await this.page.goto("/platform-settings/permissions");
      await this.page.waitForLoadState("networkidle");
      await this.waitForReactStateSettle();
    }

    const adminsTable = this.page.locator("table").first();
    await expect(adminsTable).toBeVisible({ timeout: 15000 });
    await this.waitForReactStateSettle();
  }

  async openUserRolesMenu(userName: string): Promise<void> {
    await this.waitForReactStateSettle();
    try {
      await this.page.waitForSelector("table", { timeout: 15000 });
    } catch (error) {
      try {
        await this.page.waitForSelector("[role='table'], .table, table", {
          timeout: 10000,
        });
      } catch {}
    }

    const allRows = await this.page.locator("table tr").all();

    for (let i = 0; i < allRows.length; i++) {
      await allRows[i].textContent();
    }

    const userRow = this.page.locator("tr").filter({ hasText: userName });
    const menuButton = userRow
      .locator("button")
      .filter({ hasText: "Open menu" });

    await expect(menuButton).toBeVisible({ timeout: 10000 });
    await menuButton.click();
  }

  async selectChangeRoles(): Promise<void> {
    await this.page.getByRole("menuitem", { name: "Change roles" }).click();
    await this.waitForReactStateSettle();
  }

  async selectRoles(roles: string[]): Promise<void> {
    for (const role of roles) {
      const roleButton = this.page.getByRole("button", { name: role });

      const selectedButton = this.page.getByRole("button", {
        name: `${role} selected`,
      });

      try {
        const isSelected = await selectedButton.isVisible({ timeout: 1000 });
        if (!isSelected) {
          await roleButton.click();
          await this.page.waitForTimeout(500);
        }
      } catch {
        await roleButton.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  async confirmRoleChanges(pin: string): Promise<void> {
    await this.page.getByRole("button", { name: "Continue" }).click();
    await this.waitForReactStateSettle();

    await expect(
      this.page.getByRole("heading", { name: "Change roles" })
    ).toBeVisible();

    const saveButton = this.page.getByRole("button", { name: "Save" });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await saveButton.click();
    await this.waitForReactStateSettle();

    await confirmPinCode(this.page, pin, "Change roles");

    await this.page
      .getByRole("heading", { name: "Change roles" })
      .waitFor({ state: "detached", timeout: 30000 })
      .catch(() => {});
    await this.waitForReactStateSettle();
    await this.page
      .locator("table")
      .waitFor({ state: "visible", timeout: 30000 })
      .catch(() => {});
  }

  async assignRolesToUser(
    userName: string,
    roles: string[],
    pin: string
  ): Promise<void> {
    await this.navigateToPlatformAdmins();
    await this.openUserRolesMenu(userName);
    await this.selectChangeRoles();
    await this.selectRoles(roles);
    await this.confirmRoleChanges(pin);
  }

  async verifyUserHasRoles(
    userName: string,
    expectedRoles: string[]
  ): Promise<void> {
    const userRow = this.page.locator("tr").filter({ hasText: userName });

    for (const role of expectedRoles) {
      await expect(userRow).toContainText(role);
    }
  }
}
