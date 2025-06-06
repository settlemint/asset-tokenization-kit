// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ATKSystemProxy } from "../ATKSystemProxy.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { ATKIdentityRegistryImplementation } from "./ATKIdentityRegistryImplementation.sol";
import { IdentityRegistryImplementationNotSet } from "../ATKSystemErrors.sol";

/// @title ATK Identity Registry Proxy
/// @author SettleMint Tokenization Services
/// @notice This contract acts as an EIP-1967 compliant proxy for the `ATKIdentityRegistryImplementation` contract.
/// It enables the identity registry's logic to be upgraded without changing the contract address that users and other
/// contracts interact with. The address of the current implementation is fetched from a central `IATKSystem`
/// contract.
/// @dev This proxy inherits from `ATKSystemProxy`.
/// During construction, it initializes the first implementation contract by delegate-calling its `initialize` function.
/// All other calls are delegated to the current implementation address provided by the `IATKSystem` contract.
contract ATKIdentityRegistryProxy is ATKSystemProxy {
    /// @notice Constructs the `ATKIdentityRegistryProxy`.
    /// @dev This constructor performs several critical setup steps:
    /// 1. Stores the `systemAddress` (handled by `ATKSystemProxy` constructor).
    /// 2. Retrieves the `ATKIdentityRegistryImplementation` address from the `IATKSystem` contract.
    ///    Reverts with `IdentityRegistryImplementationNotSet` if the implementation address is zero.
    /// 3. Encodes the call data for the `initialize` function of the `ATKIdentityRegistryImplementation`.
    /// 4. Performs a `delegatecall` to the implementation contract with the encoded initialization data via
    /// `_performInitializationDelegatecall`.
    /// The constructor is `payable` to allow for potential ETH transfers during deployment if needed by the underlying
    /// logic.
    /// @param systemAddress The address of the `IATKSystem` contract.
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
        ATKSystemProxy(systemAddress)
    {
        IATKSystem system = _getSystem();
        address implementation = _getSpecificImplementationAddress(system);

        bytes memory data = abi.encodeWithSelector(
            ATKIdentityRegistryImplementation.initialize.selector,
            initialAdmin,
            identityStorage,
            trustedIssuersRegistry,
            topicSchemeRegistry
        );

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Identity Registry module from the `ISMARTSystem` contract.
    /// @dev Reverts with `IdentityRegistryImplementationNotSet` if the implementation address is zero.
    /// @param system The `IATKSystem` contract instance.
    /// @return The address of the `ATKIdentityRegistryImplementation` contract.
    /// @inheritdoc ATKSystemProxy
    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        address implementation = system.identityRegistryImplementation();
        if (implementation == address(0)) {
            revert IdentityRegistryImplementationNotSet();
        }
        return implementation;
    }
}
