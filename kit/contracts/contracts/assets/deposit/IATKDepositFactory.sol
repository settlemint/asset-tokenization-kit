// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { IATKTokenFactory } from "../../system/token-factory/IATKTokenFactory.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

/// @title Interface for the ATK Deposit Factory
/// @notice Defines the functions for creating and predicting addresses of ATK Deposit token instances.
interface IATKDepositFactory is IATKTokenFactory {
    /// @notice Creates a new ATK Deposit token.
    /// @param name_ The name of the deposit token.
    /// @param symbol_ The symbol of the deposit token.
    /// @param decimals_ The number of decimals for the deposit token.
    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the deposit token.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return deployedDepositAddress The address of the newly deployed deposit token contract.
    function createDeposit(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        returns (address deployedDepositAddress);

    /// @notice Predicts the deployment address of a new ATK Deposit token.
    /// @param name_ The name of the deposit token.
    /// @param symbol_ The symbol of the deposit token.
    /// @param decimals_ The number of decimals for the deposit token.
    /// @param requiredClaimTopics_ An array of claim topics required for interacting with the deposit token.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return predictedAddress The predicted address of the deposit token contract.
    function predictDepositAddress(
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
