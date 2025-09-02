// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// SMART interfaces
import { ISMART } from "../../smart/interface/ISMART.sol";
import { ISMARTTokenAccessManaged } from "../../smart/extensions/access-managed/ISMARTTokenAccessManaged.sol";

/// @title IATKToken - Unified ATK Token Interface
/// @author SettleMint
/// @notice This interface provides a unified API surface for all ATK tokens by combining
///         the SMART token standard with access management capabilities.
/// @dev This interface extends both ISMART and ISMARTTokenAccessManaged to provide:
///      - Complete ERC-3643 compliant security token functionality via ISMART
///      - Role-based access control via ISMARTTokenAccessManaged
///      - Consistent interface across all ATK token implementations
///      Benefits:
///      - Single import for all token functionality
///      - Type safety for token interactions
///      - Consistent API across all asset types
interface IATKToken is ISMART, ISMARTTokenAccessManaged {
    // This interface intentionally contains no additional functions or events.
    // It serves as a composition interface that combines the functionality of
    // ISMART and ISMARTTokenAccessManaged for easier consumption by:
    // - Asset implementations
    // - Factory contracts
    // - Integration code
    // - External consumers
}