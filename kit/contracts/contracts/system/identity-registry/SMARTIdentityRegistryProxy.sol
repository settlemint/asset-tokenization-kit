// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTSystemProxy } from "../SMARTSystemProxy.sol";
import { ISMARTSystem } from "../ISMARTSystem.sol";
import { SMARTIdentityRegistryImplementation } from "./SMARTIdentityRegistryImplementation.sol";
import { IdentityRegistryImplementationNotSet } from "../SMARTSystemErrors.sol";

/// @title SMART Identity Registry Proxy
/// @author SettleMint Tokenization Services
/// @notice This contract acts as an EIP-1967 compliant proxy for the `SMARTIdentityRegistryImplementation` contract.
/// It enables the identity registry's logic to be upgraded without changing the contract address that users and other
/// contracts interact with. The address of the current implementation is fetched from a central `ISMARTSystem`
/// contract.
/// @dev This proxy inherits from `SMARTSystemProxy`.
/// During construction, it initializes the first implementation contract by delegate-calling its `initialize` function.
/// All other calls are delegated to the current implementation address provided by the `ISMARTSystem` contract.
contract SMARTIdentityRegistryProxy is SMARTSystemProxy {
    /// @notice Constructs the `SMARTIdentityRegistryProxy`.
    /// @dev This constructor performs several critical setup steps:
    /// 1. Stores the `systemAddress` (handled by `SMARTSystemProxy` constructor).
    /// 2. Retrieves the `SMARTIdentityRegistryImplementation` address from the `ISMARTSystem` contract.
    ///    Reverts with `IdentityRegistryImplementationNotSet` if the implementation address is zero.
    /// 3. Encodes the call data for the `initialize` function of the `SMARTIdentityRegistryImplementation`.
    /// 4. Performs a `delegatecall` to the implementation contract with the encoded initialization data via
    /// `_performInitializationDelegatecall`.
    /// The constructor is `payable` to allow for potential ETH transfers during deployment if needed by the underlying
    /// logic.
    /// @param systemAddress The address of the `ISMARTSystem` contract.
    /// @param initialAdmin The address that will be granted initial administrative roles.
    /// @param identityStorage The address of the `ISMARTIdentityRegistryStorage` contract.
    /// @param trustedIssuersRegistry The address of the `IERC3643TrustedIssuersRegistry` contract.
    /// @param topicSchemeRegistry The address of the `ISMARTTopicSchemeRegistry` contract.
    constructor(
        address systemAddress,
        address initialAdmin,
        address identityStorage,
        address trustedIssuersRegistry,
        address topicSchemeRegistry
    )
        payable
        SMARTSystemProxy(systemAddress)
    {
        ISMARTSystem system = _getSystem();
        address implementation = _getSpecificImplementationAddress(system);

        bytes memory data = abi.encodeWithSelector(
            SMARTIdentityRegistryImplementation.initialize.selector,
            initialAdmin,
            identityStorage,
            trustedIssuersRegistry,
            topicSchemeRegistry
        );

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Identity Registry module from the `ISMARTSystem` contract.
    /// @dev Reverts with `IdentityRegistryImplementationNotSet` if the implementation address is zero.
    /// @param system The `ISMARTSystem` contract instance.
    /// @return The address of the `SMARTIdentityRegistryImplementation` contract.
    /// @inheritdoc SMARTSystemProxy
    function _getSpecificImplementationAddress(ISMARTSystem system) internal view override returns (address) {
        address implementation = system.identityRegistryImplementation();
        if (implementation == address(0)) {
            revert IdentityRegistryImplementationNotSet();
        }
        return implementation;
    }
}
