import { expect } from "@playwright/test";
import type { UserRole } from "../test-data/user-data";
import { getUserRole, updateUserRole } from "../utils/db-utils";
import { BasePage } from "./base-page";
import { Pages } from "./pages";
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

    await this.page.locator('input[name="email"]').clear();
    await this.page.getByPlaceholder("Enter your password").clear();

    const emailInput = this.page.locator('input[name="email"]');

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      await emailInput.click({ force: true });
      await emailInput.focus();
      await emailInput.fill("");
      await emailInput.fill(options.email);

      const value = await emailInput.inputValue();
      if (value === options.email) {
        break;
      }
      retries++;

      if (retries === maxRetries) {
        await emailInput.evaluate((el, email) => {
          (el as HTMLInputElement).value = email;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }, options.email);
      }
    }

    await expect(async () => {
      const inputValue = await emailInput.inputValue();
      expect(inputValue).toBe(options.email);
    }).toPass({ timeout: 20000 });

    const passwordInput = this.page.getByPlaceholder("Enter your password");
    await passwordInput.click({ force: true });
    await passwordInput.focus();
    await passwordInput.fill("");
    await passwordInput.fill(options.password);

    await expect(async () => {
      const inputValue = await passwordInput.inputValue();
      expect(inputValue.length).toBeGreaterThan(0);
    }).toPass({ timeout: 20000 });

    const loginButton = this.page.getByRole("button", {
      name: "Login",
      exact: true,
    });
    await loginButton.waitFor({ state: "visible" });

    await loginButton.click();

    try {
      await this.page.waitForURL(
        (url) =>
          url.pathname.includes("/portfolio") ||
          url.pathname.includes("/assets"),
        { timeout: 15000 }
      );
    } catch (error) {
      console.log("Navigation failed:", error);

      const errorMessages = await this.page
        .locator(".text-destructive")
        .allTextContents();
      if (errorMessages.length > 0) {
        console.log("Validation errors found:", errorMessages);
      }
    }

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
