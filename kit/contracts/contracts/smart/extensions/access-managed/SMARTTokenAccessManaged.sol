// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { _SMARTTokenAccessManagedLogic } from "./internal/_SMARTTokenAccessManagedLogic.sol";
import { SMARTExtension } from "../common/SMARTExtension.sol";

/// @title Abstract Contract for Access-Managed SMART Tokens (Non-Upgradeable)
/// @author SettleMint
/// @notice This contract serves as a base for SMART token contracts that need to integrate
///         with a centralized `SMARTTokenAccessManager`. It provides the foundational
///         functionality to link a token to its access manager.
///         An 'abstract contract' in Solidity is like a template for other contracts.
///         It can define some functions and state variables, but it might leave others
///         unimplemented for inheriting contracts to fill in. You cannot deploy an
///         abstract contract directly; it must be inherited by another contract.
/// @dev This is the non-upgradeable version. Inheriting contracts should invoke the
///      constructor, passing the address of the `SMARTTokenAccessManager`.
///      They are also responsible for implementing any necessary authorization hooks
///      by delegating calls to the designated manager contract.
///      Delegation means that this contract will forward certain checks or calls
///      to the `SMARTTokenAccessManager` to decide if an action is allowed.

abstract contract SMARTTokenAccessManaged is SMARTExtension, _SMARTTokenAccessManagedLogic {
    // -- Constructor --

    /// @notice Initializes the access managed extension by setting the access manager address.
    /// @dev This constructor is called when a contract inheriting from `SMARTTokenAccessManaged`
    ///      is deployed. It ensures that the link to the `SMARTTokenAccessManager` is established
    ///      from the very beginning.
    ///      The `Initializable` contract is not used here because this is the non-upgradeable version.
    ///      Constructors in Solidity are special functions that run only once when the contract
    ///      is deployed.
    /// @param accessManager_ The address of the `SMARTTokenAccessManager` contract that will
    ///                       manage roles and permissions for this token contract.
    constructor(address accessManager_) {
        __SMARTTokenAccessManaged_init_unchained(accessManager_);
    }
}
