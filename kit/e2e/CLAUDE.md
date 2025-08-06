# E2E Module

## Stack

Playwright 1.54.2 | TypeScript | Page Object Model

## Key Commands

```bash
NODE_NO_WARNINGS=1 playwright test      # Run all
NODE_NO_WARNINGS=1 playwright test --ui # UI mode
playwright test --debug                 # Debug mode
```

## Page Object Pattern

<example>
class AssetPage extends BasePage {
  readonly createButton = this.page.getByRole("button", { name: "Create" })
  
  async createAsset(data: AssetData) {
    await this.createButton.click()
    // ...
  }
}
</example>

## Critical Patterns

<example>
# CORRECT Locators
page.getByRole("button", { name: "Submit" })
page.getByLabel("Email")
page.getByTestId("form")

# WRONG

page.locator(".btn") # No CSS selectors page.locator("//button") # No XPath
</example>

<example>
# CORRECT Waiting
await expect(locator).toBeVisible()
await page.waitForLoadState("networkidle")

# WRONG

await page.waitForTimeout(5000) # No arbitrary timeouts </example>

## Structure

```
pages/       # Page objects
test-data/   # Fixtures
ui-tests/    # UI specs
api-tests/   # API specs
```

## Rules

- Page Object Model always
- Semantic locators only (getByRole, getByLabel)
- No arbitrary timeouts
- Independent tests (no dependencies)
- Clean up after tests
