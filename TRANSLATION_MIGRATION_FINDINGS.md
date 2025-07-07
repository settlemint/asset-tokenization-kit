# Translation Migration Findings

## Overview
This document summarizes the findings from analyzing the dapp source code to identify components that need to be updated to use the new translation namespaces instead of the old "general" namespace.

## Current Translation Usage Patterns

### 1. Components Using "general" Namespace

The following components are explicitly using `useTranslation("general")` and need to be updated:

- `/kit/dapp/src/components/data-table/data-table.tsx` - Line 188
- `/kit/dapp/src/components/data-table/data-table-pagination.tsx` - Line 60
- `/kit/dapp/src/components/copy-to-clipboard/copy-to-clipboard.tsx` - Line 45
- `/kit/dapp/src/routes/auth.tsx`
- `/kit/dapp/src/components/sidebar/sidebar-logo.tsx`
- `/kit/dapp/src/components/ui/error-display.tsx`

### 2. Translation Keys That Need Migration

#### Data Table Components (should use "data-table" namespace):
- `t("components.data-table.rows-per-page")`
- `t("components.data-table.go-to-first-page")`
- `t("components.data-table.go-to-previous-page")`
- `t("components.data-table.go-to-next-page")`
- `t("components.data-table.go-to-last-page")`
- `t("components.data-table.sort-ascending")`
- `t("components.data-table.sort-descending")`
- `t("components.data-table.hide")`
- `t("components.data-table.view")`
- `t("components.data-table.toggle-columns")`
- `t("components.data-table.copied-to-clipboard")`
- `t("components.data-table.copy-to-clipboard")`

#### Error Components (should use "errors" namespace):
- `t("errors.unauthorized.title")`
- `t("errors.forbidden.title")`
- `t("errors.notFound.title")`
- `t("errors.validation.title")`
- `t("errors.rateLimit.title")`
- `t("errors.transaction.title")`
- `t("errors.timeout.title")`
- `t("errors.portal.title")`
- `t("errors.internal.title")`
- `t("errors.blockchain.title")`
- `t("errors.contract.title")`
- `t("errors.insufficientFunds.title")`
- `t("errors.network.title")`
- `t("errors.notOnboarded.title")`
- `t("errors.systemNotCreated.title")`
- `t("errors.resourceAlreadyExists.title")`
- `t("errors.generic.title")`
- `t("errors.badRequest.title")`

#### Navigation Components (should use "navigation" namespace):
- `t("navigation.fixedIncome")`
- `t("navigation.flexibleIncome")`
- `t("navigation.cashEquivalent")`
- `t("navigation.assetManagement")`
- `t("navigation.asset")`
- `t("navigation.statistics")`

### 3. Components with Translation Keys but No Namespace Specified

The following components use `useTranslation()` without specifying a namespace:
- Various data-table components (filters, operators, values menus)
- Language switcher component
- Breadcrumb components
- Sidebar components

### 4. Hardcoded Strings That Need Translation

Found several hardcoded strings that should be translated:

#### In step-wizard component:
- "Error"
- "Cancel"

#### In command component:
- "Search for a command to run..."

#### In various UI components:
- Loading states
- Error messages
- Button labels (Submit, Save, Delete, Create, Update)
- Search/Filter placeholders

### 5. Components Already Using Correct Namespaces

Some components are already correctly using the new namespace pattern and serve as good examples:
- Components using `t("components.data-table.*")` keys
- Components using `t("errors.*")` keys
- Components using `t("navigation.*")` keys

## Recommendations

1. **Update useTranslation calls**: Change `useTranslation("general")` to the appropriate namespace:
   - Data table components → `useTranslation("data-table")`
   - Error-related components → `useTranslation("errors")`
   - Navigation components → `useTranslation("navigation")`

2. **Update translation keys**: Remove the namespace prefix from keys since it's now specified in the useTranslation call:
   - `t("components.data-table.view")` → `t("view")` (with `useTranslation("data-table")`)
   - `t("errors.unauthorized.title")` → `t("unauthorized.title")` (with `useTranslation("errors")`)

3. **Add translations for hardcoded strings**: Create translation keys for the identified hardcoded strings.

4. **Create a migration script**: Consider creating an automated script to update the translation patterns across all files.

## Files That Need Updates

### Priority 1 - Core Components:
- All data-table components in `/kit/dapp/src/components/data-table/`
- Error display components
- Navigation components

### Priority 2 - Common Components:
- Copy to clipboard component
- Language switcher
- Breadcrumb components

### Priority 3 - UI Components:
- Step wizard (hardcoded strings)
- Command component (search placeholder)
- Various form components with hardcoded labels