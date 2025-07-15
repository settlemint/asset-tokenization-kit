# Requirements Document

## Introduction

This feature will create orpc routes for token actions for the asset types in the ATK system (bond, deposit, equity, fund, stable-coin). The routes will be built in the same style as the existing pause/unpause mutations and will leverage the interfaces these assets implement to avoid complex conditional logic or multiple GraphQL queries. Based on the analysis of the GraphQL schema and contract ABIs, the following token actions are available: mint, burn, transfer, freeze/unfreeze, redeem, approve, recover, and various administrative functions.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to create orpc routes for token minting operations, so that I can mint tokens for all asset types through a unified API.

#### Acceptance Criteria

1. WHEN a mint request is made THEN the system SHALL route to the appropriate GraphQL mutation based on the asset type
2. WHEN the asset supports minting THEN the system SHALL use the mint functionality from the contract
3. WHEN minting is requested THEN the system SHALL support both single mint and batch mint operations
4. WHEN minting fails THEN the system SHALL return appropriate error messages with transaction details

### Requirement 2

**User Story:** As a developer, I want to create orpc routes for token burning operations, so that I can burn tokens for all asset types through a unified API.

#### Acceptance Criteria

1. WHEN a burn request is made THEN the system SHALL route to the appropriate GraphQL mutation based on the asset type
2. WHEN the asset implements ISMARTBurnable interface THEN the system SHALL use the burn functionality from that interface
3. WHEN burning is requested THEN the system SHALL support both single burn and batch burn operations
4. WHEN burning fails THEN the system SHALL return appropriate error messages with transaction details

### Requirement 3

**User Story:** As a developer, I want to create orpc routes for token transfer operations, so that I can transfer tokens for all asset types through a unified API.

#### Acceptance Criteria

1. WHEN a transfer request is made THEN the system SHALL route to the appropriate GraphQL mutation based on the asset type
2. WHEN the asset implements IERC20 interface THEN the system SHALL use the transfer functionality from that interface
3. WHEN transfer is requested THEN the system SHALL support regular transfer, transferFrom, forced transfer, and batch transfer operations
4. WHEN transfer fails THEN the system SHALL return appropriate error messages with transaction details

### Requirement 4

**User Story:** As a developer, I want to create orpc routes for token freezing operations, so that I can freeze/unfreeze tokens for all asset types through a unified API.

#### Acceptance Criteria

1. WHEN a freeze request is made THEN the system SHALL route to the appropriate GraphQL mutation based on the asset type
2. WHEN the asset implements ISMARTCustodian interface THEN the system SHALL use the freeze functionality from that interface
3. WHEN freezing is requested THEN the system SHALL support address-level freezing (setAddressFrozen), partial token freezing (freezePartialTokens), and batch freezing operations
4. WHEN unfreezing is requested THEN the system SHALL support unfreezing partial tokens (unfreezePartialTokens) and batch unfreezing operations
5. WHEN freeze/unfreeze fails THEN the system SHALL return appropriate error messages with transaction details

### Requirement 5

**User Story:** As a developer, I want to create orpc routes for token approval operations, so that I can manage token allowances for all asset types through a unified API.

#### Acceptance Criteria

1. WHEN an approve request is made THEN the system SHALL route to the appropriate GraphQL mutation based on the asset type
2. WHEN the asset implements IERC20 interface THEN the system SHALL use the approve functionality from that interface
3. WHEN approval fails THEN the system SHALL return appropriate error messages with transaction details

### Requirement 6

**User Story:** As a developer, I want to create orpc routes for token redemption operations, so that I can redeem tokens for applicable asset types through a unified API.

#### Acceptance Criteria

1. WHEN a redeem request is made THEN the system SHALL route to the appropriate GraphQL mutation based on the asset type
2. WHEN the asset implements ISMARTRedeemable interface THEN the system SHALL use the redeem functionality from that interface
3. WHEN redemption is requested AND the asset type is bond THEN the system SHALL support both redeem and redeemAll operations
4. WHEN redemption fails THEN the system SHALL return appropriate error messages with transaction details

### Requirement 7

**User Story:** As a developer, I want to create orpc routes for token recovery operations, so that I can recover tokens and ERC20 tokens for all asset types through a unified API.

#### Acceptance Criteria

1. WHEN a recovery request is made THEN the system SHALL route to the appropriate GraphQL mutation based on the asset type
2. WHEN the asset supports recovery THEN the system SHALL support both token recovery (recoverTokens) and ERC20 recovery (recoverERC20) operations
3. WHEN forced recovery is requested THEN the system SHALL support forced token recovery (forcedRecoverTokens) operations
4. WHEN recovery fails THEN the system SHALL return appropriate error messages with transaction details

### Requirement 8

**User Story:** As a developer, I want to create orpc routes for administrative token operations, so that I can manage token configuration for all asset types through a unified API.

#### Acceptance Criteria

1. WHEN an administrative request is made THEN the system SHALL route to the appropriate GraphQL mutation based on the asset type
2. WHEN cap management is requested THEN the system SHALL support setCap operations for capped tokens
3. WHEN compliance management is requested THEN the system SHALL support setCompliance, addComplianceModule, removeComplianceModule, and setParametersForComplianceModule operations
4. WHEN identity management is requested THEN the system SHALL support setIdentityRegistry and setOnchainID operations
5. WHEN yield management is requested THEN the system SHALL support setYieldSchedule operations for yield-bearing tokens
6. WHEN administrative operations fail THEN the system SHALL return appropriate error messages with transaction details

### Requirement 9

**User Story:** As a developer, I want the orpc routes to use interface-based routing with ERC165 capability detection, so that I can avoid complex conditional logic and multiple GraphQL queries.

#### Acceptance Criteria

1. WHEN determining available actions THEN the system SHALL check which interfaces the asset implements using the supportsInterface function with ERC165
2. WHEN routing requests THEN the system SHALL use interface detection to determine the appropriate GraphQL mutation
3. WHEN an interface is not supported THEN the system SHALL return a typed ORPC error message indicating the action is not available for that token type
4. WHEN multiple interfaces provide the same functionality THEN the system SHALL prioritize based on a defined hierarchy
5. WHEN interface IDs are needed THEN the system SHALL use a generated TypeScript file containing interface IDs from the contract analysis

### Requirement 12

**User Story:** As a developer, I want interface ID generation integrated into the build process, so that I can have up-to-date interface IDs for capability detection.

#### Acceptance Criteria

1. WHEN the build process runs THEN the system SHALL generate a TypeScript file with interface IDs using a tool similar to kit/subgraph/tools/interfaceid.ts
2. WHEN interface IDs are generated THEN the system SHALL include all relevant SMART extension interfaces (ISMARTBurnable, ISMARTCustodian, ISMARTRedeemable, etc.)
3. WHEN the generated file is updated THEN the system SHALL integrate it into the turbo build flow for the dapp package
4. WHEN interface IDs are used THEN the system SHALL import them from the generated TypeScript file for consistency

### Requirement 10

**User Story:** As a developer, I want consistent error handling and transaction tracking, so that I can provide reliable feedback to users.

#### Acceptance Criteria

1. WHEN any token action is performed THEN the system SHALL provide real-time status updates using the event iterator pattern
2. WHEN a transaction is submitted THEN the system SHALL track the transaction hash and mining status
3. WHEN an error occurs THEN the system SHALL provide descriptive error messages with context
4. WHEN a transaction is confirmed THEN the system SHALL return the final transaction hash and result

### Requirement 11

**User Story:** As a developer, I want the routes to follow the existing patterns, so that I can maintain consistency with the current codebase.

#### Acceptance Criteria

1. WHEN creating new routes THEN the system SHALL follow the same structure as the pause/unpause mutations
2. WHEN defining schemas THEN the system SHALL extend the common mutation schemas
3. WHEN implementing handlers THEN the system SHALL use the same middleware and helper patterns
4. WHEN organizing files THEN the system SHALL follow the existing directory structure under `/routes/mutations/`
5. WHEN creating route groups THEN the system SHALL organize actions by functionality (e.g., mint, burn, transfer, freeze, admin)