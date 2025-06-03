// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTSystemProxy } from "../SMARTSystemProxy.sol";
import { ISMARTSystem } from "../ISMARTSystem.sol";
import { SMARTTrustedIssuersRegistryImplementation } from "./SMARTTrustedIssuersRegistryImplementation.sol";
import { TrustedIssuersRegistryImplementationNotSet } from "../SMARTSystemErrors.sol";

/// @title SMART Trusted Issuers Registry Proxy
/// @author SettleMint Tokenization Services
/// @notice UUPS proxy for the `SMARTTrustedIssuersRegistryImplementation`.
/// Enables upgrading the trusted issuers registry logic without changing the contract address or losing data.
/// @dev Delegates calls to an implementation contract whose address is retrieved from the `ISMARTSystem` contract.
/// The `ISMARTSystem` contract serves as a central registry for SMART Protocol component addresses.
/// Initializes the implementation contract via a delegatecall to its `initialize` function during construction.
/// Upgrade logic resides in the implementation contract (UUPS pattern).
/// This proxy primarily forwards calls and prevents accidental Ether transfers.
contract SMARTTrustedIssuersRegistryProxy is SMARTSystemProxy {
    constructor(address systemAddress, address initialAdmin) SMARTSystemProxy(systemAddress) {
        ISMARTSystem system_ = _getSystem();

        address implementation = _getSpecificImplementationAddress(system_);

        bytes memory data =
            abi.encodeWithSelector(SMARTTrustedIssuersRegistryImplementation.initialize.selector, initialAdmin);

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Trusted Issuers Registry from the `ISMARTSystem` contract.
    /// @dev Reverts with `TrustedIssuersRegistryImplementationNotSet` if the implementation address is zero.
    /// @param system The `ISMARTSystem` contract instance.
    /// @return The address of the `SMARTTrustedIssuersRegistryImplementation` contract.
    /// @inheritdoc SMARTSystemProxy
    function _getSpecificImplementationAddress(ISMARTSystem system) internal view override returns (address) {
        address implementation = system.trustedIssuersRegistryImplementation();
        if (implementation == address(0)) {
            revert TrustedIssuersRegistryImplementationNotSet();
        }
        return implementation;
    }
}
