// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base contract imports
import { SMARTExtension } from "../common/SMARTExtension.sol";

// Internal implementation imports
import { _SMARTBurnableLogic } from "./internal/_SMARTBurnableLogic.sol";

/// @title Standard (Non-Upgradeable) SMART Burnable Extension
/// @author SettleMint
/// @notice This contract provides the functionality to burn (destroy) tokens for a standard,
///         non-upgradeable SMART token contract. It acts as a concrete implementation layer
///         over the core burning logic defined in `_SMARTBurnableLogic`.
///         'Non-upgradeable' means the contract's code cannot be changed after it's deployed to the blockchain.
/// @dev This abstract contract inherits from `SMARTExtension` (for common SMART functionalities)
///      and `_SMARTBurnableLogic` (for the core burn operations).
///      Its primary responsibility is to implement the `__burnable_executeBurn` internal hook.
///      This hook is called by `_SMARTBurnableLogic` to perform the actual token destruction.
///      This implementation assumes that the final contract inheriting `SMARTBurnable` will also
///      inherit a standard ERC20 contract (like OpenZeppelin's `ERC20.sol`) which provides
///      the necessary internal `_burn(address from, uint256 amount)` function.
///      An 'abstract contract' can define some functions but might leave others for inheriting contracts to implement.
///      It cannot be deployed directly.

abstract contract SMARTBurnable is SMARTExtension, _SMARTBurnableLogic {
    /// @notice Constructor for the SMARTBurnable extension.
    /// @dev When a contract inheriting `SMARTBurnable` is deployed, this constructor is called.
    ///      It initializes the burnable logic through `__SMARTBurnable_init_unchained()` from `_SMARTBurnableLogic`.
    ///      This typically involves registering the `ISMARTBurnable` interface.
    constructor() {
        __SMARTBurnable_init_unchained();
    }

    // -- Internal Hook Implementations (Dependencies) --

    /// @notice Internal function that executes the actual token burning by calling the base ERC20 `_burn` function.
    /// @dev This function is an implementation of the `__burnable_executeBurn` abstract hook defined
    ///      in `_SMARTBurnableLogic`. It bridges the generic burn logic of the extension to the specific
    ///      `_burn` mechanism of the underlying ERC20 token.
    ///      The `internal` visibility means this function can only be called from within this contract
    ///      and contracts that inherit from it.
    ///      The `virtual` keyword allows this function to be further overridden by contracts that inherit
    /// `SMARTBurnable`,
    ///      though it's typically not needed if the base ERC20 `_burn` is sufficient.
    ///      The `override` keyword indicates that this function is replacing an abstract function from a parent
    /// contract.
    /// @param from The address from which tokens are to be burned. This account's balance will decrease.
    /// @param amount The quantity of tokens to destroy.
    /// @inheritdoc _SMARTBurnableLogic
    function __burnable_executeBurn(address from, uint256 amount) internal virtual override {
        // Note: This line assumes that the contract ultimately deploying this extension
        // (e.g., YourToken.sol) will also inherit a standard ERC20 contract (e.g., from OpenZeppelin).
        // That parent ERC20 contract is expected to provide the internal `_burn(address, uint256)` function.
        _burn(from, amount);
    }
}
