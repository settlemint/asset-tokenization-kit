# Implementation Plan

- [x] 1. Set up interface ID generation and detection foundation
  - [x] Create interface ID generation tool similar to kit/subgraph/tools/interfaceid.ts for the dapp package
  - [x] Generate TypeScript file with interface IDs at kit/dapp/src/lib/interface-ids.ts
  - [ ] Integrate interface ID generation into turbo build flow for dapp package
  - [x] Implement interface detection helper functions in kit/dapp/src/orpc/helpers/interface-detection.ts
  - _Requirements: 9.5, 12.1, 12.2, 12.3, 12.4_

- [x] 2. Implement mint token operations
  - [x] 2.1 Create single mint operation
    - [x] Write token.mint.ts handler following pause mutation pattern
    - [x] Create token.mint.schema.ts with input/output validation
    - [x] Implement GraphQL mutation routing for all asset types
    - [x] Add interface validation using IERC3643 detection
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 2.2 Create batch mint operation
    - Write token.batch-mint.ts handler for multiple recipients
    - Create token.batch-mint.schema.ts with array validation
    - Implement batch GraphQL mutation routing
    - Add batch-specific error handling and validation
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Implement burn token operations
  - [x] 3.1 Create single burn operation
    - [x] Write token.burn.ts handler following existing patterns
    - [x] Create token.burn.schema.ts with burn-specific validation
    - [x] Implement GraphQL mutation routing for burn operations
    - [x] Add interface validation using ISMARTBurnable detection
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 3.2 Create batch burn operation
    - Write token.batch-burn.ts handler for multiple addresses
    - Create token.batch-burn.schema.ts with batch validation
    - Implement batch burn GraphQL mutation routing
    - Add batch burn error handling
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

  - [ ] 4.4 Create batch transfer operation
    - Write token.batch-transfer.ts handler for multiple transfers
    - Create token.batch-transfer.schema.ts with batch validation
    - Implement batch transfer GraphQL mutation routing
    - Add batch transfer error handling
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5. Implement freeze/unfreeze token operations
  - [ ] 5.1 Create address-level freeze operations
    - Write token.freeze-address.ts handler using ISMARTCustodian interface
    - Create token.freeze-address.schema.ts with freeze validation
    - Implement address freeze GraphQL mutation routing
    - Add custodian permission validation
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ] 5.2 Create partial token freeze operations
    - Write token.freeze-partial.ts handler for partial freezing
    - Create token.freeze-partial.schema.ts with amount validation
    - Write token.unfreeze-partial.ts handler for partial unfreezing
    - Create token.unfreeze-partial.schema.ts with unfreeze validation
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ] 5.3 Create batch freeze operations
    - Write token.batch-freeze-address.ts for multiple address freezing
    - Create token.batch-freeze-address.schema.ts with batch validation
    - Write token.batch-freeze-partial.ts for batch partial freezing
    - Write token.batch-unfreeze-partial.ts for batch partial unfreezing
    - Create corresponding schema files for batch operations
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 6. Implement approve token operations
  - Write token.approve.ts handler using IERC20 interface
  - Create token.approve.schema.ts with spender and amount validation
  - Implement approve GraphQL mutation routing
  - Add approval-specific error handling
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7. Implement redeem token operations
  - [ ] 7.1 Create standard redeem operation
    - Write token.redeem.ts handler using ISMARTRedeemable interface
    - Create token.redeem.schema.ts with redemption validation
    - Implement redeem GraphQL mutation routing for applicable assets
    - Add redemption-specific error handling
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 7.2 Create redeem-all operation for bonds
    - Write token.redeem-all.ts handler for bond-specific redemption
    - Create token.redeem-all.schema.ts with bond validation
    - Implement redeemAll GraphQL mutation routing
    - Add bond maturity validation
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 8. Implement recovery token operations
  - [ ] 8.1 Create token recovery operations
    - Write token.recover-tokens.ts handler for lost wallet recovery
    - Create token.recover-tokens.schema.ts with recovery validation
    - Write token.forced-recover.ts handler for forced recovery
    - Create token.forced-recover.schema.ts with forced recovery validation
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 8.2 Create ERC20 recovery operations
    - Write token.recover-erc20.ts handler for ERC20 token recovery
    - Create token.recover-erc20.schema.ts with ERC20 recovery validation
    - Implement ERC20 recovery GraphQL mutation routing
    - Add ERC20 recovery error handling
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 9. Implement cap management operations
  - Write token.set-cap.ts handler using ISMARTCapped interface
  - Create token.set-cap.schema.ts with cap validation
  - Implement setCap GraphQL mutation routing for capped tokens
  - Add cap validation and error handling
  - _Requirements: 8.1, 8.2, 8.6_

- [ ] 10. Implement yield management operations
  - Write token.set-yield-schedule.ts handler using ISMARTYield interface
  - Create token.set-yield-schedule.schema.ts with yield schedule validation
  - Implement setYieldSchedule GraphQL mutation routing for yield-bearing tokens
  - Add yield schedule validation and error handling
  - _Requirements: 8.1, 8.5, 8.6_

- [ ] 11. Implement compliance management operations
  - [ ] 11.1 Create add compliance module operation
    - Write token.add-compliance-module.ts handler for compliance management
    - Create token.add-compliance-module.schema.ts with module validation
    - Implement addComplianceModule GraphQL mutation routing
    - Add compliance module validation
    - _Requirements: 8.1, 8.3, 8.6_

  - [ ] 11.2 Create remove compliance module operation
    - Write token.remove-compliance-module.ts handler for module removal
    - Create token.remove-compliance-module.schema.ts with removal validation
    - Implement removeComplianceModule GraphQL mutation routing
    - Add module removal error handling
    - _Requirements: 8.1, 8.3, 8.6_

- [x] 12. Integrate all routes into token router
  - [x] Update kit/dapp/src/orpc/routes/token/token.router.ts to include all new routes
  - [x] Update kit/dapp/src/orpc/routes/token/token.contract.ts with new route contracts
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

- [ ] 14. Integrate interface ID generation into build process
  - [ ] 14.1 Update turbo.json to include interface ID generation
    - Add generate:interface-ids to the codegen pipeline
    - Ensure proper dependency ordering in turbo tasks
    - Make interface ID generation run before other codegen tasks
    - _Priority: High_

- [ ] 15. Add missing token operations
  - [ ] 15.1 Implement redeem operations
    - Write token.redeem.ts handler using ISMARTRedeemable interface
    - Create token.redeem.schema.ts with redemption validation
    - Write token.redeem-all.ts handler for bond-specific redemption
    - _Priority: Medium_

  - [ ] 15.2 Implement freeze/unfreeze operations
    - Write token.freeze-address.ts handler using ISMARTCustodian interface
    - Write token.freeze-partial.ts and token.unfreeze-partial.ts handlers
    - Implement batch freeze operations
    - _Priority: Medium_

  - [ ] 15.3 Implement cap management operations
    - Write token.set-cap.ts handler using ISMARTCapped interface
    - Create token.set-cap.schema.ts with cap validation
    - _Priority: Medium_

  - [ ] 15.4 Implement yield management operations
    - Write token.set-yield-schedule.ts handler using ISMARTYield interface
    - Create token.set-yield-schedule.schema.ts with yield schedule validation
    - _Priority: Medium_

  - [ ] 15.5 Implement approve operations
    - Write token.approve.ts handler using IERC20 interface
    - Create token.approve.schema.ts with spender and amount validation
    - _Priority: Medium_

  - [ ] 15.6 Implement recovery operations
    - Write token.recover-tokens.ts handler for lost wallet recovery
    - Write token.recover-erc20.ts handler for ERC20 token recovery
    - Write token.forced-recover.ts handler for forced recovery
    - _Priority: Medium_

- [ ] 16. Add comprehensive testing
  - [ ] 16.1 Unit tests for interface detection helpers
    - Test supportsInterface() function
    - Test validateTokenCapability() function
    - Test getTokenCapabilities() function
    - Test getBestInterfaceForOperation() function
    - _Priority: Medium_

  - [ ] 16.2 Integration tests for mutation routes
    - Test all implemented mutation routes
    - Test error handling and validation
    - Test transaction tracking
    - _Priority: Medium_

  - [ ] 16.3 End-to-end tests for complete workflows
    - Test complete token operation workflows
    - Test interface detection in real scenarios
    - Test error recovery scenarios
    - _Priority: Low_

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