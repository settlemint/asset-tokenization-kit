// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { ISMARTTokenFactory } from "../../system/token-factory/ISMARTTokenFactory.sol";
import { SMARTComplianceModuleParamPair } from "../../interface/structs/SMARTComplianceModuleParamPair.sol";

/// @title Interface for the SMART Stable Coin Factory
/// @notice Defines the functions for creating and predicting addresses of SMART Stable Coin instances.
interface ISMARTStableCoinFactory is ISMARTTokenFactory {
    /// @notice Creates a new SMART Stable Coin.
    /// @param name_ The name of the stable coin.
    /// @param symbol_ The symbol of the stable coin.
    /// @param decimals_ The number of decimals for the stable coin.
    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the stable coin.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return deployedStableCoinAddress The address of the newly deployed stable coin contract.
    function createStableCoin(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        returns (address deployedStableCoinAddress);

    /// @notice Predicts the deployment address of a new SMART Stable Coin.
    /// @param name_ The name of the stable coin.
    /// @param symbol_ The symbol of the stable coin.
    /// @param decimals_ The number of decimals for the stable coin.
    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the stable coin.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return predictedAddress The predicted address of the stable coin contract.
    function predictStableCoinAddress(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        view
        returns (address predictedAddress);
}
