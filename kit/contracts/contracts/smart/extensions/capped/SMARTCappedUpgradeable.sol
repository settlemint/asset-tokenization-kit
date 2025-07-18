// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// Base contract imports
import { SMARTExtensionUpgradeable } from "../common/SMARTExtensionUpgradeable.sol";
import { SMARTHooks } from "../common/SMARTHooks.sol"; // Note: Consider if SMARTHooksUpgradeable should be used if
    // available

// Internal implementation imports
import { _SMARTCappedLogic } from "./internal/_SMARTCappedLogic.sol";

// Interface imports
import { ISMARTCapped } from "./ISMARTCapped.sol";

/// @title Upgradeable SMART Capped Token Extension
/// @notice This contract adds a maximum total supply (a "cap") to an upgradeable SMART token.
///         Once the total supply reaches this cap, no more tokens can be minted.
///         'Upgradeable' contracts can have their logic updated after deployment without changing their address,
///         which is useful for bug fixes or adding new features.
/// @dev This is an `abstract contract` and cannot be deployed directly. It must be inherited.
///      It inherits from `Initializable` (for managing initialization in upgradeable contracts),
///      `SMARTExtensionUpgradeable` (for common SMART upgradeable features), and the core capping
///      logic from `_SMARTCappedLogic`.
///      To function correctly, the final token contract using `SMARTCappedUpgradeable` must also inherit:
///      1. An upgradeable ERC20 implementation (e.g., OpenZeppelin's `ERC20Upgradeable.sol`), which provides
/// `totalSupply()`.
///      2. `SMARTHooks` (or `SMARTHooksUpgradeable` if preferred and available), which provides the `_beforeMint` hook.
///      The capping check is enforced by overriding the `_beforeMint` hook from `SMARTHooks`.

abstract contract SMARTCappedUpgradeable is Initializable, SMARTExtensionUpgradeable, _SMARTCappedLogic {
    /// @dev Register the `ISMARTCapped` interface ID for ERC165. This allows factories to check if the
    /// contract
    /// supports the `ISMARTCapped` interface based on the upgradeable implementation.
    constructor() {
        _registerInterface(type(ISMARTCapped).interfaceId);
    }

    /// @notice Initializer for the upgradeable capped supply extension.
    /// @dev This function should be called only once, typically during the deployment or initialization
    ///      phase of the proxy contract that uses this logic contract (the implementation).
    ///      The `onlyInitializing` modifier (from OpenZeppelin's `Initializable` contract) ensures that
    ///      this function cannot be called again after the contract has been initialized, which is a crucial
    ///      security measure for upgradeable contracts to prevent re-initialization attacks.
    ///      It sets the maximum total supply (`cap_`) by calling `__SMARTCapped_init_unchained`
    ///      from the inherited `_SMARTCappedLogic`.
    /// @param cap_ The maximum total supply allowed for this token. Must be greater than 0.
    function __SMARTCapped_init(uint256 cap_) internal onlyInitializing {
        __SMARTCapped_init_unchained(cap_);
    }

    // -- Internal Hook Implementations --

    /// @notice Internal function to retrieve the current total supply of the token.
    /// @dev This function implements the `__capped_totalSupply` abstract hook from `_SMARTCappedLogic`.
    ///      It relies on the final contract inheriting an upgradeable ERC20 implementation (e.g., `ERC20Upgradeable`)
    ///      that provides a `totalSupply()` function.
    ///      The keywords `internal view virtual override` have the same meaning as in the non-upgradeable version.
    /// @return uint256 The current total number of tokens in existence.
    function __capped_totalSupply() internal view virtual override returns (uint256) {
        // Assumes the contract also inherits an ERC20Upgradeable, which provides totalSupply().
        return totalSupply();
    }

    // -- Hooks (Overrides) --

    /// @notice Hook that is executed by the `SMARTHooks` system before any mint operation.
    /// @dev This function overrides the `_beforeMint` hook from the `SMARTHooks` contract.
    ///      It injects the supply capping logic by calling `__capped_beforeMintLogic` (from `_SMARTCappedLogic`)
    ///      to check if minting the `amount` would exceed the `cap`.
    ///      It then calls `super._beforeMint(to, amount)` to ensure that other extensions or base contracts
    ///      that also implement this hook get a chance to execute their logic, maintaining the hook chain.
    /// @param to The address that will receive the minted tokens.
    /// @param amount The amount of tokens to be minted.
    /// @inheritdoc SMARTHooks
    function _beforeMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        __capped_beforeMintLogic(amount); // Perform the cap check before minting.
        super._beforeMint(to, amount); // Call the next `_beforeMint` hook in the inheritance chain.
    }
}
