// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// Interface imports
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ISMART } from "../../smart/interface/ISMART.sol";

import { ISMARTTokenAccessManaged } from "../../smart/extensions/access-managed/ISMARTTokenAccessManaged.sol";
import { ISMARTCustodian } from "../../smart/extensions/custodian/ISMARTCustodian.sol";
import { ISMARTPausable } from "../../smart/extensions/pausable/ISMARTPausable.sol";
import { ISMARTBurnable } from "../../smart/extensions/burnable/ISMARTBurnable.sol";
import { ISMARTCollateral } from "../../smart/extensions/collateral/ISMARTCollateral.sol";

/// @title Interface for a ATK Stable Coin
/// @notice Defines the core functionality and extensions for a ATK Stable Coin.
interface IATKStableCoin is
    ISMART,
    ISMARTTokenAccessManaged,
    ISMARTCollateral,
    ISMARTCustodian,
    ISMARTPausable,
    ISMARTBurnable
{
    /// @notice Initializes the ATK Stable Coin contract.
    /// @param name_ The name of the stable coin.
    /// @param symbol_ The symbol of the stable coin.
    /// @param decimals_ The number of decimals for the stable coin.
    /// @param onchainID_ Optional address of an existing onchain identity contract. Pass address(0) to create a new
    /// one.
    /// @param collateralTopicId_ The topic ID of the collateral claim.
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
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address accessManager_
    )
        external;
}
