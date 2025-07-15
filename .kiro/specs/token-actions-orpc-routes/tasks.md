# Implementation Plan

- [x] 1. Set up interface ID generation and detection foundation
  - [x] Create interface ID generation tool similar to
        kit/subgraph/tools/interfaceid.ts for the dapp package
  - [x] Generate TypeScript file with interface IDs at
        kit/dapp/src/lib/interface-ids.ts
  - [x] Integrate interface ID generation into turbo build flow for dapp package
  - [x] Implement interface detection helper functions in
        kit/dapp/src/orpc/helpers/interface-detection.ts
  - _Requirements: 9.5, 12.1, 12.2, 12.3, 12.4_

- [x] 2. Implement mint token operations
  - [x] 2.1 Create single mint operation
    - [x] Write token.mint.ts handler following pause mutation pattern
    - [x] Create token.mint.schema.ts with input/output validation
    - [x] Implement GraphQL mutation routing for all asset types
    - [x] Add interface validation using IERC3643 detection
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.2 Create batch mint operation
    - [x] Write token.batch-mint.ts handler for multiple recipients (merged into token.mint.ts)
    - [x] Create token.batch-mint.schema.ts with array validation (merged into token.mint.schema.ts)
    - [x] Implement batch GraphQL mutation routing (merged into single mint operation)
    - [x] Add batch-specific error handling and validation (merged into token.mint.ts)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Implement burn token operations
  - [x] 3.1 Create single burn operation
    - [x] Write token.burn.ts handler following existing patterns
    - [x] Create token.burn.schema.ts with burn-specific validation
    - [x] Implement GraphQL mutation routing for burn operations
    - [x] Add interface validation using ISMARTBurnable detection
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 Create batch burn operation
    - [x] Write token.batch-burn.ts handler for multiple addresses (merged into token.burn.ts)
    - [x] Create token.batch-burn.schema.ts with batch validation (merged into token.burn.schema.ts)
    - [x] Implement batch burn GraphQL mutation routing (merged into single burn operation)
    - [x] Add batch burn error handling (merged into token.burn.ts)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Implement transfer token operations
  - [x] 4.1 Create standard transfer operation
    - [x] Write token.transfer.ts handler using IERC20/IERC3643 interface
    - [x] Create token.transfer.schema.ts with transfer validation
    - [x] Implement GraphQL mutation routing for transfers
    - [x] Add standard transfer error handling
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 4.2 Create transferFrom operation
    - [x] Write token.transfer-from.ts handler for allowance-based transfers
    - [x] Create token.transfer-from.schema.ts with from/to validation
    - [x] Implement transferFrom GraphQL mutation routing
    - [x] Add allowance validation and error handling
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 4.3 Create forced transfer operation
    - [x] Write token.forced-transfer.ts handler for custodian transfers
    - [x] Create token.forced-transfer.schema.ts with forced transfer validation
    - [x] Implement forced transfer GraphQL mutation routing
    - [x] Add custodian permission validation
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 4.4 Create batch transfer operation
    - [x] Write token.batch-transfer.ts handler for multiple transfers (merged into existing transfer operations)
    - [x] Create token.batch-transfer.schema.ts with batch validation (merged into existing transfer schemas)
    - [x] Implement batch transfer GraphQL mutation routing (merged into existing transfer operations)
    - [x] Add batch transfer error handling (merged into existing transfer operations)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Implement freeze/unfreeze token operations
  - [x] 5.1 Create address-level freeze operations
    - [x] Write token.freeze-address.ts handler using ISMARTCustodian interface
    - [x] Create token.freeze-address.schema.ts with freeze validation
    - [x] Implement address freeze GraphQL mutation routing
    - [x] Add custodian permission validation
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 5.2 Create partial token freeze operations (merged into freeze-address)
    - [x] Write token.freeze-partial.ts handler for partial freezing (merged into freeze-address)
    - [x] Create token.freeze-partial.schema.ts with amount validation (merged into freeze-address)
    - [x] Write token.unfreeze-partial.ts handler for partial unfreezing (merged into freeze-address)
    - [x] Create token.unfreeze-partial.schema.ts with unfreeze validation (merged into freeze-address)
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 5.3 Create batch freeze operations (merged into freeze-address)
    - [x] Write token.batch-freeze-address.ts for multiple address freezing (merged into freeze-address)
    - [x] Create token.batch-freeze-address.schema.ts with batch validation (merged into freeze-address)
    - [x] Write token.batch-freeze-partial.ts for batch partial freezing (merged into freeze-address)
    - [x] Write token.batch-unfreeze-partial.ts for batch partial unfreezing (merged into freeze-address)
    - [x] Create corresponding schema files for batch operations (merged into freeze-address)
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 6. Implement approve token operations
  - [x] Write token.approve.ts handler using IERC20 interface
  - [x] Create token.approve.schema.ts with spender and amount validation
  - [x] Implement approve GraphQL mutation routing
  - [x] Add approval-specific error handling
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Implement redeem token operations
  - [x] 7.1 Create standard redeem operation
    - [x] Write token.redeem.ts handler using ISMARTRedeemable interface
    - [x] Create token.redeem.schema.ts with redemption validation
    - [x] Implement redeem GraphQL mutation routing for applicable assets
    - [x] Add redemption-specific error handling
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 7.2 Create redeem-all operation for bonds
    - [x] Write token.redeem-all.ts handler for bond-specific redemption
    - [x] Create token.redeem-all.schema.ts with bond validation
    - [x] Implement redeemAll GraphQL mutation routing
    - [x] Add bond maturity validation
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Implement recovery token operations
  - [x] 8.1 Create token recovery operations
    - [x] Write token.recover-tokens.ts handler for lost wallet recovery
    - [x] Create token.recover-tokens.schema.ts with recovery validation
    - [x] Write token.forced-recover.ts handler for forced recovery
    - [x] Create token.forced-recover.schema.ts with forced recovery validation
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 8.2 Create ERC20 recovery operations
    - [x] Write token.recover-erc20.ts handler for ERC20 token recovery
    - [x] Create token.recover-erc20.schema.ts with ERC20 recovery validation
    - [x] Implement ERC20 recovery GraphQL mutation routing
    - [x] Add ERC20 recovery error handling
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 9. Implement cap management operations
  - [x] Write token.set-cap.ts handler using ISMARTCapped interface
  - [x] Create token.set-cap.schema.ts with cap validation
  - [x] Implement setCap GraphQL mutation routing for capped tokens
  - [x] Add cap validation and error handling
  - _Requirements: 8.1, 8.2, 8.6_

- [x] 10. Implement yield management operations
  - [x] Write token.set-yield-schedule.ts handler using ISMARTYield interface
  - [x] Create token.set-yield-schedule.schema.ts with yield schedule validation
  - [x] Implement setYieldSchedule GraphQL mutation routing for yield-bearing tokens
  - [x] Add yield schedule validation and error handling
  - _Requirements: 8.1, 8.5, 8.6_

- [x] 11. Implement compliance management operations
  - [x] 11.1 Create add compliance module operation
    - [x] Write token.add-compliance-module.ts handler for compliance management
    - [x] Create token.add-compliance-module.schema.ts with module validation
    - [x] Implement addComplianceModule GraphQL mutation routing
    - [x] Add compliance module validation
    - _Requirements: 8.1, 8.3, 8.6_

  - [x] 11.2 Create remove compliance module operation
    - [x] Write token.remove-compliance-module.ts handler for module removal
    - [x] Create token.remove-compliance-module.schema.ts with removal validation
    - [x] Implement removeComplianceModule GraphQL mutation routing
    - [x] Add module removal error handling
    - _Requirements: 8.1, 8.3, 8.6_

- [x] 12. Integrate all routes into token router
  - [x] Update kit/dapp/src/orpc/routes/token/token.router.ts to include all new
        routes
  - [x] Update kit/dapp/src/orpc/routes/token/token.contract.ts with new route
        contracts
  - [x] Add proper route organization by functionality groups
  - [x] Ensure consistent middleware usage across all routes
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 13. Add comprehensive error handling and validation
  - [x] Implement consistent ORPC error handling across all routes
  - [x] Add interface validation for all operations using ERC165 detection
  - [x] Ensure proper error messages with context for debugging
  - [x] Add transaction tracking and status reporting for all operations
  - _Requirements: 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 10.4_

## Additional Tasks (Beyond Original Requirements)

- [x] 14. Integrate interface ID generation into build process
  - [x] 14.1 Update turbo.json to include interface ID generation
    - [x] Add generate:interface-ids to the codegen pipeline
    - [x] Ensure proper dependency ordering in turbo tasks
    - [x] Make interface ID generation run before other codegen tasks
    - _Priority: High_

- [x] 15. Add missing token operations
  - [x] 15.1 Implement redeem operations
    - [x] Write token.redeem.ts handler using ISMARTRedeemable interface
    - [x] Create token.redeem.schema.ts with redemption validation
    - [x] Write token.redeem-all.ts handler for bond-specific redemption
    - _Priority: Medium_

  - [x] 15.2 Implement freeze/unfreeze operations
    - [x] Write token.freeze-address.ts handler using ISMARTCustodian interface
    - [x] Write token.freeze-partial.ts and token.unfreeze-partial.ts handlers (merged into freeze-address)
    - [x] Implement batch freeze operations (merged into freeze-address)
    - _Priority: Medium_

  - [x] 15.3 Implement cap management operations
    - [x] Write token.set-cap.ts handler using ISMARTCapped interface
    - [x] Create token.set-cap.schema.ts with cap validation
    - _Priority: Medium_

  - [x] 15.4 Implement yield management operations
    - [x] Write token.set-yield-schedule.ts handler using ISMARTYield interface
    - [x] Create token.set-yield-schedule.schema.ts with yield schedule validation
    - _Priority: Medium_

  - [x] 15.5 Implement approve operations
    - [x] Write token.approve.ts handler using IERC20 interface
    - [x] Create token.approve.schema.ts with spender and amount validation
    - _Priority: Medium_

  - [x] 15.6 Implement recovery operations
    - [x] Write token.recover-tokens.ts handler for lost wallet recovery
    - [x] Write token.recover-erc20.ts handler for ERC20 token recovery
    - [x] Write token.forced-recover.ts handler for forced recovery
    - _Priority: Medium_

- [ ] 17. Documentation and examples
  - [ ] 17.1 API documentation
    - Document all mutation routes
    - Document interface detection system
    - Document error handling patterns
    - _Priority: Low_

  - [ ] 17.2 Usage examples
    - Create example implementations
    - Create troubleshooting guides
    - Create best practices documentation
    - _Priority: Low_
