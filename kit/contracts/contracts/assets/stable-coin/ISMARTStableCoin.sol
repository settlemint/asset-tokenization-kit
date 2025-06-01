// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// Interface imports
import { SMARTComplianceModuleParamPair } from "../../interface/structs/SMARTComplianceModuleParamPair.sol";
import { ISMART } from "../../interface/ISMART.sol";

import { ISMARTTokenAccessManaged } from "../../extensions/access-managed/ISMARTTokenAccessManaged.sol";
import { ISMARTCustodian } from "../../extensions/custodian/ISMARTCustodian.sol";
import { ISMARTPausable } from "../../extensions/pausable/ISMARTPausable.sol";
import { ISMARTBurnable } from "../../extensions/burnable/ISMARTBurnable.sol";
import { ISMARTCollateral } from "../../extensions/collateral/ISMARTCollateral.sol";

/// @title Interface for a SMART Stable Coin
/// @notice Defines the core functionality and extensions for a SMART Stable Coin.
interface ISMARTStableCoin is
    ISMART,
    ISMARTTokenAccessManaged,
    ISMARTCollateral,
    ISMARTCustodian,
    ISMARTPausable,
    ISMARTBurnable
{
    /// @notice Initializes the SMART Stable Coin contract.
    /// @param name_ The name of the stable coin.
    /// @param symbol_ The symbol of the stable coin.
    /// @param decimals_ The number of decimals for the stable coin.
    /// @param onchainID_ Optional address of an existing onchain identity contract. Pass address(0) to create a new
    /// one.
    /// @param collateralTopicId_ The topic ID of the collateral claim.
    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the stable coin.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @param identityRegistry_ The address of the identity registry contract.
    /// @param compliance_ The address of the compliance contract.
    /// @param accessManager_ The address of the access manager contract for this token.
    function initialize(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address onchainID_,
        uint256 collateralTopicId_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address accessManager_
    )
        external;
}
