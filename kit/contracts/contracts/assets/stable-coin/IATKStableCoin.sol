// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Interface imports
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKToken } from "../../system/tokens/IATKToken.sol";

import { ISMARTCustodian } from "../../smart/extensions/custodian/ISMARTCustodian.sol";
import { ISMARTPausable } from "../../smart/extensions/pausable/ISMARTPausable.sol";
import { ISMARTBurnable } from "../../smart/extensions/burnable/ISMARTBurnable.sol";
import { ISMARTCollateral } from "../../smart/extensions/collateral/ISMARTCollateral.sol";
import { ISMARTRedeemable } from "../../smart/extensions/redeemable/ISMARTRedeemable.sol";

/// @title Interface for a ATK Stable Coin
/// @author SettleMint
/// @notice Defines the core functionality and extensions for a ATK Stable Coin.
interface IATKStableCoin is
    IATKToken,
    ISMARTCollateral,
    ISMARTRedeemable,
    ISMARTCustodian,
    ISMARTPausable,
    ISMARTBurnable
{
    /// @notice Initializes the ATK Stable Coin contract.
    /// @param name_ The name of the stable coin.
    /// @param symbol_ The symbol of the stable coin.
    /// @param decimals_ The number of decimals for the stable coin.
    /// @param collateralTopicId_ The topic ID of the collateral claim.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @param identityRegistry_ The address of the identity registry contract.
    /// @param compliance_ The address of the compliance contract.
    /// @param accessManager_ The address of the access manager contract for this token.
    function initialize(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 collateralTopicId_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address accessManager_
    )
        external;
}
