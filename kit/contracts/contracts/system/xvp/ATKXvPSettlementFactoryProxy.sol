// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { IATKSystem } from "../IATKSystem.sol";
import { IATKXvPSettlementFactory } from "./IATKXvPSettlementFactory.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

/// @title ATKXvPSettlementFactoryProxy
/// @notice Proxy contract for the XvP Settlement Factory that enables upgradability
/// @dev This contract delegates all calls to an implementation contract while maintaining its own storage
contract ATKXvPSettlementFactoryProxy {
    /// @notice The ATKSystem contract that manages this proxy
    IATKSystem private immutable _system;
    address private immutable _forwarder;

    /// @notice Custom errors
    error OnlySystem();
    error DelegateCallFailed();

    /// @dev Modifier to restrict access to the ATKSystem contract
    modifier onlySystem() {
        if (msg.sender != address(_system)) {
            revert OnlySystem();
        }
        _;
    }

    /// @notice Initializes the proxy with the ATKSystem contract address
    /// @param system_ The address of the ATKSystem contract
    /// @param forwarder_ The address of the forwarder
    /// @param initialAdmin_ The address that will be granted admin role
    constructor(address system_, address forwarder_, address initialAdmin_) {
        _system = IATKSystem(system_);
        _forwarder = forwarder_;

        // Initialize the implementation contract
        (bool success,) = _system.addonImplementation(keccak256("XvPSettlementFactory")).delegatecall(
            abi.encodeWithSelector(IATKXvPSettlementFactory.initialize.selector, forwarder_, initialAdmin_)
        );
        if (!success) revert DelegateCallFailed();
    }

    /// @dev Fallback function that delegates all calls to the implementation contract
    /// @notice This function handles all calls to the proxy by delegating them to the implementation
    fallback() external payable {
        address implementation = _system.addonImplementation(keccak256("XvPSettlementFactory"));
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let success := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch success
            // delegatecall returns 0 on error.
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    /// @dev Receive function to accept ETH transfers
    receive() external payable { }
}
