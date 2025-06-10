// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ATKSystemProxy } from "../ATKSystemProxy.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { ATKTopicSchemeRegistryImplementation } from "./ATKTopicSchemeRegistryImplementation.sol";
import { TopicSchemeRegistryImplementationNotSet } from "../ATKSystemErrors.sol";

/// @title SMART Topic Scheme Registry Proxy
/// @author SettleMint Tokenization Services
/// @notice UUPS proxy for the `SMARTTopicSchemeRegistryImplementation`.
/// Enables upgrading the topic scheme registry logic without changing the contract address or losing data.
/// @dev Delegates calls to an implementation contract whose address is retrieved from the `IATKSystem` contract.
/// The `IATKSystem` contract serves as a central registry for SMART Protocol component addresses.
/// Initializes the implementation contract via a delegatecall to its `initialize` function during construction.
/// Upgrade logic resides in the implementation contract (UUPS pattern).
/// This proxy primarily forwards calls and prevents accidental Ether transfers.
contract ATKTopicSchemeRegistryProxy is ATKSystemProxy {
    constructor(address systemAddress, address initialAdmin) payable ATKSystemProxy(systemAddress) {
        IATKSystem system_ = _getSystem();

        address implementation = _getSpecificImplementationAddress(system_);

        address[] memory initialRegistrars = new address[](2);
        initialRegistrars[0] = initialAdmin;
        initialRegistrars[1] = systemAddress;

        bytes memory data = abi.encodeWithSelector(
            ATKTopicSchemeRegistryImplementation.initialize.selector, initialAdmin, initialRegistrars
        );

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Topic Scheme Registry from the `IATKSystem` contract.
    /// @dev Reverts with `TopicSchemeRegistryImplementationNotSet` if the implementation address is zero.
    /// @param system The `IATKSystem` contract instance.
    /// @return The address of the `ATKTopicSchemeRegistryImplementation` contract.
    /// @inheritdoc ATKSystemProxy
    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        address implementation = system.topicSchemeRegistryImplementation();
        if (implementation == address(0)) {
            revert TopicSchemeRegistryImplementationNotSet();
        }
        return implementation;
    }
}
