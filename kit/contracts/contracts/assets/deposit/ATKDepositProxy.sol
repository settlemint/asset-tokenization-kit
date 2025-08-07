// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ATKAssetProxy } from "../ATKAssetProxy.sol";
import { IATKDeposit } from "./IATKDeposit.sol";

import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

/// @title Proxy contract for ATK Deposits, using ATKAssetProxy.
/// @author SettleMint
/// @notice This contract serves as a proxy, allowing for upgradeability of the underlying deposit logic.
/// It retrieves the implementation address from the IATKTokenFactory contract via ATKAssetProxy.
contract ATKDepositProxy is ATKAssetProxy {
    /// @notice Constructs the ATKDepositProxy.
    /// @dev Initializes the proxy by delegating a call to the `initialize` function
    /// of the implementation provided by the token factory.
    /// @param tokenFactoryAddress The address of the token factory contract.
    /// @param name_ The name of the deposit.
    /// @param symbol_ The symbol of the deposit.
    /// @param decimals_ The number of decimals of the deposit.
    /// @param initialModulePairs_ The initial module pairs of the deposit.
    /// @param identityRegistry_ The identity registry of the deposit.
    /// @param compliance_ The compliance of the deposit.
    /// @param accessManager_ The access manager of the deposit.
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
            IATKDeposit.initialize.selector,
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
