import { expect } from "@playwright/test";
import { getUserRole, updateUserRole } from "../utils/db-utils";
import { BasePage } from "./base-page";
import { Pages } from "./pages";

export class SignInPage extends BasePage {
  async goto() {
    await this.page.goto("/auth/signin");
  }

  async signIn(options: { email: string; password: string; name: string }) {
    await this.page.getByLabel("Email").fill(options.email);
    await this.page.getByLabel("Password").fill(options.password);
    await this.page.getByRole("button", { name: "Login", exact: true }).click();
    await this.page.waitForURL("**/portfolio");
    await expect(
      this.page.locator("div.grid span.truncate.font-semibold", {
        hasText: options.name,
      })
    ).toBeVisible();
  }

  async signInAsAdmin(options: {
    email: string;
    password: string;
    name: string;
    pincodeName?: string;
    pincode?: string;
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
      await updateUserRole(options.email, "admin");
    }

    await this.goto();
    await this.signIn(options);
  }

  async signInAsUser(options: {
    email: string;
    password: string;
    name: string;
    pincodeName?: string;
    pincode?: string;
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
    }

    await this.goto();
    await this.signIn(options);
  }
}
