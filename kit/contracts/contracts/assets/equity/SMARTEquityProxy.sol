// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTAssetProxy } from "../SMARTAssetProxy.sol";
import { ISMARTEquity } from "./ISMARTEquity.sol";

import { SMARTComplianceModuleParamPair } from "../../interface/structs/SMARTComplianceModuleParamPair.sol";
import { ISMARTTokenFactory } from "../../system/token-factory/ISMARTTokenFactory.sol";

import { TokenImplementationNotSet } from "../../system/SMARTSystemErrors.sol";

/// @title Proxy contract for SMART Equities, using SMARTAssetProxy.
/// @notice This contract serves as a proxy, allowing for upgradeability of the underlying equity logic.
/// It retrieves the implementation address from the ISMARTTokenFactory contract via SMARTAssetProxy.
contract SMARTEquityProxy is SMARTAssetProxy {
    /// @notice Constructs the SMARTEquityProxy.
    /// @dev Initializes the proxy by delegating a call to the `initialize` function
    /// of the implementation provided by the token factory.
    /// @param tokenFactoryAddress The address of the token factory contract.
    /// @param name_ The name of the equity.
    /// @param symbol_ The symbol of the equity.
    /// @param decimals_ The number of decimals of the equity.
    /// @param onchainID_ Optional address of an existing onchain identity contract. Pass address(0) to create a new
    /// one.
    /// @param requiredClaimTopics_ The required claim topics of the equity.
    /// @param initialModulePairs_ The initial module pairs of the equity.
    /// @param identityRegistry_ The identity registry of the equity.
    /// @param compliance_ The compliance of the equity.
    /// @param accessManager_ The access manager of the equity.
    constructor(
        address tokenFactoryAddress,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address onchainID_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address accessManager_
    )
        payable
        SMARTAssetProxy(tokenFactoryAddress)
    {
        address implementation = _implementation();

        bytes memory data = abi.encodeWithSelector(
            ISMARTEquity.initialize.selector,
            name_,
            symbol_,
            decimals_,
            onchainID_,
            requiredClaimTopics_,
            initialModulePairs_,
            identityRegistry_,
            compliance_,
            accessManager_
        );

        _performInitializationDelegatecall(implementation, data);
    }
}
