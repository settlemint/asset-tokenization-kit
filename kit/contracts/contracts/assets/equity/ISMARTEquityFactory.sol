// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { ISMARTTokenFactory } from "../../system/token-factory/ISMARTTokenFactory.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

/// @title Interface for the SMART Equity Factory
/// @notice Defines the functions for creating and predicting addresses of SMART Equity instances.
interface ISMARTEquityFactory is ISMARTTokenFactory {
    /// @notice Creates a new SMART Equity token.
    /// @param name_ The name of the equity token.
    /// @param symbol_ The symbol of the equity token.
    /// @param decimals_ The number of decimals for the equity token.
    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the equity token.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return deployedEquityAddress The address of the newly deployed equity token contract.
    function createEquity(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        returns (address deployedEquityAddress);

    /// @notice Predicts the deployment address of a new SMART Equity token.
    /// @param name_ The name of the equity token.
    /// @param symbol_ The symbol of the equity token.
    /// @param decimals_ The number of decimals for the equity token.
    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the equity token.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return predictedAddress The predicted address of the equity token contract.
    function predictEquityAddress(
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
