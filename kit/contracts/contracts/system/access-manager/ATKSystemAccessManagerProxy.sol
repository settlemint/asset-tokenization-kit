// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractATKSystemProxy } from "../AbstractATKSystemProxy.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { ATKSystemAccessManagerImplementation } from "./ATKSystemAccessManagerImplementation.sol";
import { SystemAccessManagerImplementationNotSet } from "../ATKSystemErrors.sol";

/// @title ATK System Access Manager Proxy
/// @author SettleMint
/// @notice Proxy contract for the ATK System Access Manager
/// @dev Deploys as a proxy that delegates calls to the implementation address from the ATK System
contract ATKSystemAccessManagerProxy is AbstractATKSystemProxy {
    /// @notice Constructs the ATKSystemAccessManagerProxy
    /// @dev Initializes the proxy by delegating to the implementation's initialize function
    /// @param systemAddress The address of the ATK System contract
    /// @param initialAdmins Array of addresses to grant initial admin roles
    constructor(address systemAddress, address[] memory initialAdmins) AbstractATKSystemProxy(systemAddress) {
        IATKSystem system_ = _getSystem();

        address implementation = _getSpecificImplementationAddress(system_);
        bytes memory data =
            abi.encodeWithSelector(ATKSystemAccessManagerImplementation.initialize.selector, initialAdmins);

        _performInitializationDelegatecall(implementation, data);
    }

    /// @notice Retrieves the system access manager implementation address from the ATK System
    /// @dev Internal function that fetches the implementation address and validates it
    /// @param system The ATK System contract instance
    /// @return The address of the system access manager implementation
    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        address implementation = system.systemAccessManagerImplementation();
        if (implementation == address(0)) {
            revert SystemAccessManagerImplementationNotSet();
        }
        return implementation;
    }
}
