// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { ISMARTTokenFactory } from "../../system/token-factory/ISMARTTokenFactory.sol";
import { SMARTComplianceModuleParamPair } from "../../interface/structs/SMARTComplianceModuleParamPair.sol";

/// @title Interface for the SMART Bond Factory
/// @notice Defines the functions for creating and predicting addresses of SMART Bond instances.
interface ISMARTBondFactory is ISMARTTokenFactory {
    /// @notice Creates a new SMART Bond.
    /// @param name_ The name of the bond.
    /// @param symbol_ The symbol of the bond.
    /// @param decimals_ The number of decimals for the bond tokens.
    /// @param cap_ The maximum total supply of the bond tokens.
    /// @param maturityDate_ The Unix timestamp representing the bond's maturity date.
    /// @param faceValue_ The face value of each bond token in the underlying asset's base units.
    /// @param underlyingAsset_ The address of the ERC20 token used as the underlying asset for the bond.

    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the bond.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return deployedBondAddress The address of the newly deployed bond contract.
    function createBond(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 cap_,
        uint256 maturityDate_,
        uint256 faceValue_,
        address underlyingAsset_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        returns (address deployedBondAddress);

    /// @notice Predicts the deployment address of a new SMART Bond.
    /// @param name_ The name of the bond.
    /// @param symbol_ The symbol of the bond.
    /// @param decimals_ The number of decimals for the bond tokens.
    /// @param cap_ The maximum total supply of the bond tokens.
    /// @param maturityDate_ The Unix timestamp representing the bond's maturity date.
    /// @param faceValue_ The face value of each bond token in the underlying asset's base units.
    /// @param underlyingAsset_ The address of the ERC20 token used as the underlying asset for the bond.
    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the bond.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return predictedAddress The predicted address of the bond contract.
    function predictBondAddress(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 cap_,
        uint256 maturityDate_,
        uint256 faceValue_,
        address underlyingAsset_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        view
        returns (address predictedAddress);
}
