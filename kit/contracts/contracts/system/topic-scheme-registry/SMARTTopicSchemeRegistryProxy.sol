// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTSystemProxy } from "../SMARTSystemProxy.sol";
import { ISMARTSystem } from "../ISMARTSystem.sol";
import { SMARTTopicSchemeRegistryImplementation } from "./SMARTTopicSchemeRegistryImplementation.sol";
import { TopicSchemeRegistryImplementationNotSet } from "../SMARTSystemErrors.sol";

/// @title SMART Topic Scheme Registry Proxy
/// @author SettleMint Tokenization Services
/// @notice UUPS proxy for the `SMARTTopicSchemeRegistryImplementation`.
/// Enables upgrading the topic scheme registry logic without changing the contract address or losing data.
/// @dev Delegates calls to an implementation contract whose address is retrieved from the `ISMARTSystem` contract.
/// The `ISMARTSystem` contract serves as a central registry for SMART Protocol component addresses.
/// Initializes the implementation contract via a delegatecall to its `initialize` function during construction.
/// Upgrade logic resides in the implementation contract (UUPS pattern).
/// This proxy primarily forwards calls and prevents accidental Ether transfers.
contract SMARTTopicSchemeRegistryProxy is SMARTSystemProxy {
    constructor(address systemAddress, address initialAdmin) payable SMARTSystemProxy(systemAddress) {
        ISMARTSystem system_ = _getSystem();

        address implementation = _getSpecificImplementationAddress(system_);

        address[] memory initialRegistrars = new address[](2);
        initialRegistrars[0] = initialAdmin;
        initialRegistrars[1] = systemAddress;

        bytes memory data = abi.encodeWithSelector(
            SMARTTopicSchemeRegistryImplementation.initialize.selector, initialAdmin, initialRegistrars
        );

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Topic Scheme Registry from the `ISMARTSystem` contract.
    /// @dev Reverts with `TopicSchemeRegistryImplementationNotSet` if the implementation address is zero.
    /// @param system The `ISMARTSystem` contract instance.
    /// @return The address of the `SMARTTopicSchemeRegistryImplementation` contract.
    /// @inheritdoc SMARTSystemProxy
    function _getSpecificImplementationAddress(ISMARTSystem system) internal view override returns (address) {
        address implementation = system.topicSchemeRegistryImplementation();
        if (implementation == address(0)) {
            revert TopicSchemeRegistryImplementationNotSet();
        }
        return implementation;
    }
}
