# E2E Tests

## Stack

Playwright 1.54.2 | TypeScript | Page Object Model

## Commands

```bash
NODE_NO_WARNINGS=1 playwright test        # Run all
NODE_NO_WARNINGS=1 playwright test --ui   # UI mode
playwright test --debug                   # Debug mode
```

## Architecture

### Structure

```
pages/           # Page Object Model
├── base-page.ts # Common methods
└── *-page.ts    # Feature pages

test-data/       # Fixtures
utils/           # Helpers
├── db-utils.ts  # Database ops
└── setup-utils.ts

ui-tests/        # UI specs
api-tests/       # API specs
```

### Page Objects

```typescript
class AssetPage extends BasePage {
  readonly createButton = this.page.getByRole("button", { name: "Create" });

  async createAsset(data: AssetData) {
    await this.createButton.click();
    // ...
  }
}
```

## Patterns

### Locators

```typescript
// ✅ CORRECT
page.getByRole("button", { name: "Submit" });
page.getByLabel("Email");
page.getByTestId("form");

// ❌ WRONG
page.locator(".btn");
page.locator("//button");
```

### Waiting

```typescript
// ✅ CORRECT
await expect(locator).toBeVisible();
await page.waitForLoadState("networkidle");

// ❌ WRONG
await page.waitForTimeout(5000);
```

### Test Structure

```typescript
test.describe("Feature", () => {
  test.beforeEach(async ({ page }) => {
    await setupTest();
  });

  test("action", async ({ page }) => {
    const pageObject = new PageObject(page);
    await pageObject.action();
    await pageObject.expectResult();
  });
});
```

### Parallel Config

```typescript
fullyParallel: true;
workers: 4;
```

## Common Flows

- `authenticateUser()` - Sign in
- `completeOnboarding()` - KYC flow
- `createAsset()` - Asset creation

## MCP Usage

```typescript
// MANDATORY - Use Playwright MCP
mcp__playwright__browser_navigate();
mcp__playwright__browser_click();
```

## Rules

1. Page Object Model always
2. No arbitrary timeouts
3. Semantic locators only
4. Test data in fixtures
5. Clean up after tests
6. Independent tests
