# Onboarding Component Refactoring Plan

## Todo List

- [x] Install required Shadcn components

  - [x] Install form component
  - [x] Install checkbox component
  - [x] Install label component

- [x] Create step components

  - [x] Create `/src/components/onboarding/steps/` directory
  - [x] Create `wallet-generation-step.tsx`
  - [x] Create `system-deployment-step.tsx`
  - [x] Create `asset-selection-step.tsx`

- [x] Implement asset selection form

  - [x] Create Zod schema for asset selection
  - [x] Add checkboxes for Bonds, Equities, Funds, Stablecoins, Deposits
  - [x] Add dummy submit handler

- [x] Update main onboarding component

  - [x] Import step components
  - [x] Replace existing buttons with step components
  - [x] Keep vertical layout

- [x] Quality checks
  - [x] Run `bun typecheck`
  - [x] Run `bun lint`
  - [x] Fix any issues
