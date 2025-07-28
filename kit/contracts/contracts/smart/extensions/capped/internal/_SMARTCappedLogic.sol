// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { _SMARTExtension } from "../../common/_SMARTExtension.sol";
import { ISMARTCapped } from "../ISMARTCapped.sol";

/// @title Internal Logic for SMART Capped Token Extension
/// @author SettleMint
/// @notice This abstract contract provides the core, shared logic and storage for implementing
///         a maximum total supply (cap) on a SMART token. It is not intended for direct deployment
///         but serves as a base for `SMARTCapped.sol` (non-upgradeable) and
///         `SMARTCappedUpgradeable.sol` (upgradeable) extensions.
/// @dev This contract stores the `_cap` value and contains the fundamental logic for checking
///      against this cap (`__capped_beforeMintLogic`). It defines an abstract function
///      `__capped_totalSupply()` which must be implemented by inheriting contracts to provide
///      the current total supply (usually by delegating to an underlying ERC20 implementation).
///      It implements the `ISMARTCapped` interface by providing a public `cap()` view function.

abstract contract _SMARTCappedLogic is _SMARTExtension, ISMARTCapped {
    /// @notice The maximum total supply allowed for the token.
    /// @dev This state variable stores the cap. It is marked `private`, meaning it can only be
    ///      accessed directly within this `_SMARTCappedLogic` contract. Inheriting contracts
    ///      interact with it via the provided functions (like the `cap()` getter or the initializer).
    uint256 private _cap;

    /// @notice Abstract internal function to get the current total supply of tokens.
    /// @dev This function MUST be implemented by any concrete contract that inherits `_SMARTCappedLogic`
    ///      (e.g., `SMARTCapped` or `SMARTCappedUpgradeable`). The implementation will typically
    ///      call the `totalSupply()` function of the base ERC20 or ERC20Upgradeable contract.
    ///      `internal view virtual` means:
    ///      - `internal`: Callable only within this contract and derived contracts.
    ///      - `view`: Does not modify state.
    ///      - `virtual`: Signifies that this abstract function is intended to be implemented/overridden.
    /// @return uint256 The current total number of tokens in existence.
    function __capped_totalSupply() internal view virtual returns (uint256);

    /// @notice Internal unchained initializer for the capped supply logic.
    /// @dev This function should only be called once, typically by the constructor of `SMARTCapped`
    ///      or the initializer of `SMARTCappedUpgradeable`.
    ///      It sets the `_cap` state variable. It reverts with `InvalidCap` if `cap_` is 0,
    ///      as a cap of zero would render the token unusable (no tokens could be minted).
    ///      An "unchained" initializer doesn't call parent initializers, giving flexibility to the caller.
    ///      Emits a `CapSet` event.
    /// @param cap_ The maximum total supply for the token. Must be greater than 0.
    function __SMARTCapped_init_unchained(uint256 cap_) internal {
        if (cap_ == 0) {
            revert InvalidCap(cap_); // A cap of 0 is not allowed.
        }
        _cap = cap_;
        _registerInterface(type(ISMARTCapped).interfaceId); // Register interface for ERC165
        emit ISMARTCapped.CapSet(_smartSender(), cap_);
    }

    /// @notice Internal function to change the cap.
    /// @dev This function allows updating the cap. It reverts with `InvalidCap` if `newCap` is 0
    ///      or if it is less than the current total supply. Emits a `CapSet` event on success.
    /// @param newCap The new maximum total supply for the token. Must be >= `__capped_totalSupply()`.
    function _smart_setCap(uint256 newCap) internal {
        uint256 currentTotalSupply = __capped_totalSupply();
        if (newCap == 0 || newCap < currentTotalSupply) {
            revert InvalidCap(newCap);
        }
        _cap = newCap;
        emit ISMARTCapped.CapSet(_smartSender(), newCap);
    }

    /// @notice Returns the maximum allowed total supply for this token (the "cap").
    /// @dev This public view function implements the `cap()` function from the `ISMARTCapped` interface.
    ///      It allows anyone to query the token's cap.
    ///      The `override` keyword is not strictly needed here as it's implementing an interface function
    ///      in an abstract contract, but it can be good practice. If ISMARTCapped was a contract, it would be required.
    /// @return uint256 The maximum number of tokens that can be in circulation.
    function cap() public view virtual override returns (uint256) {
        return _cap;
    }

    /// @notice Core internal logic to check if minting an amount would exceed the defined cap.
    /// @dev This function is designed to be called as a hook (e.g., `_beforeMint`) before any tokens are minted.
    ///      It retrieves the `currentTotalSupply` (via the `__capped_totalSupply` hook that must be implemented
    ///      by the inheriting contract) and calculates what the `newTotalSupply` would be.
    ///      Solidity versions ^0.8.0 automatically check for arithmetic overflows, so `currentTotalSupply +
    /// amountToMint_`
    ///      is safe from overflow issues that would wrap around.
    ///      If `newTotalSupply` is greater than the `cap()`, it reverts with `ExceededCap`.
    /// @param amountToMint_ The amount of tokens intended to be minted.
    function __capped_beforeMintLogic(uint256 amountToMint_) internal view {
        uint256 currentTotalSupply = __capped_totalSupply();
        uint256 newTotalSupply = currentTotalSupply + amountToMint_;

        if (newTotalSupply > cap()) {
            revert ExceededCap(newTotalSupply, cap());
        }
    }
}
