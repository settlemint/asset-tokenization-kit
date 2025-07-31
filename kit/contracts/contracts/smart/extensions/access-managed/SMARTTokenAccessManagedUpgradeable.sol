// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { _SMARTTokenAccessManagedLogic } from "./internal/_SMARTTokenAccessManagedLogic.sol";
import { SMARTExtensionUpgradeable } from "../common/SMARTExtensionUpgradeable.sol";
import { ISMARTTokenAccessManaged } from "./ISMARTTokenAccessManaged.sol";

/// @title Abstract Contract for Upgradeable Access-Managed SMART Tokens
/// @author SettleMint
/// @notice This contract serves as a base for SMART token contracts that are designed to be
///         upgradeable (using a proxy pattern) and need to integrate with a centralized
///         `SMARTTokenAccessManager`. It provides the foundational functionality to link
///         a token to its access manager in an upgradeable context.
///         An 'abstract contract' in Solidity is a template that other contracts can inherit from.
///         It might not be fully implemented and cannot be deployed on its own.
///         'Upgradeable' contracts can have their logic changed after deployment without
///         changing the contract's address, which is useful for bug fixes or adding features.
/// @dev This is the upgradeable version. Inheriting contracts should call the
///      `__SMARTTokenAccessManaged_init` initializer function, passing the address of the
///      `SMARTTokenAccessManager`. They are also responsible for implementing any necessary
///      authorization hooks by delegating calls to the designated manager contract.
///      Delegation means this contract forwards certain checks to the `SMARTTokenAccessManager`.
///      The `Initializable` contract from OpenZeppelin helps manage initialization in upgradeable contracts,
///      ensuring that initialization logic runs only once.

abstract contract SMARTTokenAccessManagedUpgradeable is
    Initializable,
    SMARTExtensionUpgradeable,
    _SMARTTokenAccessManagedLogic
{
    /// @notice Register the `ISMARTTokenAccessManaged` interface ID for ERC165.
    /// @dev This allows factories to check if the contract supports the `ISMARTTokenAccessManaged` interface based on
    /// the upgradeable implementation.
    constructor() {
        _registerInterface(type(ISMARTTokenAccessManaged).interfaceId);
    }

    // -- Initializer --

    /// @notice Initializes the access managed extension for an upgradeable contract.
    /// @dev This function should be called only once, typically during the deployment or
    ///      initialization phase of the proxy contract that uses this logic.
    ///      The `onlyInitializing` modifier (from OpenZeppelin's `Initializable` contract)
    ///      ensures that this function cannot be called again after the contract has been initialized.
    ///      This is critical for security in upgradeable contracts to prevent re-initialization attacks.
    /// @param accessManager_ The address of the `SMARTTokenAccessManager` contract that will
    ///                       manage roles and permissions for this token contract.
    function __SMARTTokenAccessManaged_init(address accessManager_) internal onlyInitializing {
        __SMARTTokenAccessManaged_init_unchained(accessManager_);
    }
}
