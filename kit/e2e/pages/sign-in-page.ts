import { expect } from "@playwright/test";
import { getUserRole, updateUserRole } from "../utils/db-utils";
import { BasePage } from "./base-page";
import { Pages } from "./pages";
import type { UserRole } from "../test-data/user-data";
export class SignInPage extends BasePage {
  async goto() {
    await this.page.goto("/auth/signin");
  }

  async signIn(options: {
    email: string;
    password: string;
    name: string;
    pincode: string;
  }) {
    const pages = Pages(this.page);
    await this.page.getByLabel("Email").fill(options.email);
    await this.page.getByLabel("Password").fill(options.password);
    await this.page.getByRole("button", { name: "Login", exact: true }).click();
    await this.page.waitForURL("**/portfolio");
    await pages.signUpPage.secureWallet({ pincode: options.pincode });
    await expect(
      this.page.locator("div.grid span.truncate.font-semibold", {
        hasText: options.name,
      })
    ).toBeVisible();
  }

  async signInWithRole(options: {
    email: string;
    password: string;
    name: string;
    pincodeName?: string;
    pincode?: string;
    role?: string;
  }) {
    const existingRole = await getUserRole(options.email);

    if (!existingRole) {
      const pages = Pages(this.page);
      await pages.signUpPage.goto();
      const signUpOptions = {
        ...options,
        pincodeName: options.pincodeName ?? "Test Pincode",
        pincode: options.pincode ?? "123456",
      };
      await pages.signUpPage.signUp(signUpOptions);
      if (options.role) {
        await updateUserRole(options.email, options.role as UserRole);
      }
    }

    await this.goto();
    await this.signIn({ ...options, pincode: options.pincode ?? "123456" });
  }

  async signInAsAdmin(options: {
    email: string;
    password: string;
    name: string;
    pincodeName?: string;
    pincode?: string;
  }) {
    await this.signInWithRole({ ...options, role: "admin" });
  }

  async signInAsUser(options: {
    email: string;
    password: string;
    name: string;
    pincodeName?: string;
    pincode?: string;
  }) {
    await this.signInWithRole(options);
  }
}
