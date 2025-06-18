// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { ATKSystemAddonProxy } from "../../system/ATKSystemAddonProxy.sol";
import { IATKVaultFactory } from "./IATKVaultFactory.sol";
import { IATKSystem } from "../../system/IATKSystem.sol";

/// @title ATKVaultFactoryProxy
/// @notice Proxy contract for the ATK Vault Factory addon
/// @dev This contract serves as a proxy to the ATK Vault Factory implementation
contract ATKVaultFactoryProxy {
    /// @notice The ATK System contract that manages addon implementations
    IATKSystem private immutable _system;

    /// @notice Constructor for the ATKVaultFactoryProxy
    /// @param systemAddress Address of the ATK System contract
    /// @param forwarder_ Address of the trusted forwarder for meta-transactions (passed to implementation constructor)
    /// @param initialAdmin_ Address that will have admin role
    constructor(address systemAddress, address forwarder_, address initialAdmin_) {
        if (systemAddress == address(0)) revert("Invalid system address");
        _system = IATKSystem(systemAddress);

        // Get the implementation address from the system
        address implementation = _system.addonImplementation(keccak256("VaultFactory"));
        if (implementation == address(0)) revert("Vault factory implementation not set");

        // Initialize the implementation
        (bool success,) = implementation.delegatecall(
            abi.encodeWithSelector(IATKVaultFactory.initialize.selector, systemAddress, initialAdmin_)
        );
        if (!success) revert("Initialization failed");
    }

    /// @notice Fallback function that delegates all calls to the implementation
    /// @dev Uses delegatecall to preserve the proxy's storage context
    fallback() external payable {
        address implementation = _system.addonImplementation(keccak256("VaultFactory"));
        if (implementation == address(0)) revert("Vault factory implementation not set");

        assembly {
            // Copy msg.data to memory
            calldatacopy(0, 0, calldatasize())

            // Delegate call to the implementation
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

            // Copy the returned data
            returndatacopy(0, 0, returndatasize())

            // Return or revert based on the result
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    /// @notice Receive function to handle plain ETH transfers
    receive() external payable {
        address implementation = _system.addonImplementation(keccak256("VaultFactory"));
        if (implementation == address(0)) revert("Vault factory implementation not set");

        assembly {
            // Copy msg.data to memory (empty for receive)
            calldatacopy(0, 0, calldatasize())

            // Delegate call to the implementation
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

            // Copy the returned data
            returndatacopy(0, 0, returndatasize())

            // Return or revert based on the result
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}
