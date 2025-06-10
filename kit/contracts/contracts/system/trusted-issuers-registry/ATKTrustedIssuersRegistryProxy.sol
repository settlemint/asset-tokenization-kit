// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ATKSystemProxy } from "../ATKSystemProxy.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { ATKTrustedIssuersRegistryImplementation } from "./ATKTrustedIssuersRegistryImplementation.sol";
import { TrustedIssuersRegistryImplementationNotSet } from "../ATKSystemErrors.sol";

/// @title ATK Trusted Issuers Registry Proxy
/// @author SettleMint Tokenization Services
/// @notice UUPS proxy for the `ATKTrustedIssuersRegistryImplementation`.
/// Enables upgrading the trusted issuers registry logic without changing the contract address or losing data.
/// @dev Delegates calls to an implementation contract whose address is retrieved from the `IATKSystem` contract.
/// The `IATKSystem` contract serves as a central registry for ATK Protocol component addresses.
/// Initializes the implementation contract via a delegatecall to its `initialize` function during construction.
/// Upgrade logic resides in the implementation contract (UUPS pattern).
/// This proxy primarily forwards calls and prevents accidental Ether transfers.
contract ATKTrustedIssuersRegistryProxy is ATKSystemProxy {
    constructor(address systemAddress, address initialAdmin) ATKSystemProxy(systemAddress) {
        IATKSystem system_ = _getSystem();

        address implementation = _getSpecificImplementationAddress(system_);

        bytes memory data =
            abi.encodeWithSelector(ATKTrustedIssuersRegistryImplementation.initialize.selector, initialAdmin);

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Trusted Issuers Registry from the `IATKSystem` contract.
    /// @dev Reverts with `TrustedIssuersRegistryImplementationNotSet` if the implementation address is zero.
    /// @param system The `IATKSystem` contract instance.
    /// @return The address of the `ATKTrustedIssuersRegistryImplementation` contract.
    /// @inheritdoc ATKSystemProxy
    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        address implementation = system.trustedIssuersRegistryImplementation();
        if (implementation == address(0)) {
            revert TrustedIssuersRegistryImplementationNotSet();
        }
        return implementation;
    }
}
