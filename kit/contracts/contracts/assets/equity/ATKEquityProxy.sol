// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ATKAssetProxy } from "../ATKAssetProxy.sol";
import { IATKEquity } from "./IATKEquity.sol";

import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKTokenFactory } from "../../system/token-factory/IATKTokenFactory.sol";

import { TokenImplementationNotSet } from "../../system/ATKSystemErrors.sol";

/// @title Proxy contract for ATK Equities, using ATKAssetProxy.
/// @notice This contract serves as a proxy, allowing for upgradeability of the underlying equity logic.
/// It retrieves the implementation address from the IATKTokenFactory contract via ATKAssetProxy.
contract ATKEquityProxy is ATKAssetProxy {
    /// @notice Constructs the ATKEquityProxy.
    /// @dev Initializes the proxy by delegating a call to the `initialize` function
    /// of the implementation provided by the token factory.
    /// @param tokenFactoryAddress The address of the token factory contract.
    /// @param name_ The name of the equity.
    /// @param symbol_ The symbol of the equity.
    /// @param decimals_ The number of decimals of the equity.
    /// @param initialModulePairs_ The initial module pairs of the equity.
    /// @param identityRegistry_ The identity registry of the equity.
    /// @param compliance_ The compliance of the equity.
    /// @param accessManager_ The access manager of the equity.
    constructor(
        address tokenFactoryAddress,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address accessManager_
    )
        payable
        ATKAssetProxy(tokenFactoryAddress)
    {
        address implementation = _implementation();

        bytes memory data = abi.encodeWithSelector(
            IATKEquity.initialize.selector,
            name_,
            symbol_,
            decimals_,
            initialModulePairs_,
            identityRegistry_,
            compliance_,
            accessManager_
        );

        _performInitializationDelegatecall(implementation, data);
    }
}
