// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Abstract Contract for SMART Token Operation Hooks
/// @author SettleMint
/// @notice This abstract contract defines a set of standardized `internal virtual` hook functions
///         that can be triggered at various points in a SMART token's lifecycle (e.g., before a mint,
///         after a transfer). Extensions can override these hooks to inject custom logic.
/// @dev The hooks are empty by default (`internal virtual { }`). This means that if an extension
///      doesn't need to react to a specific lifecycle event, it doesn't need to implement that hook.
///      The key design principle here is that when an extension *does* override a hook,
///      it should **always call `super.hookName()` first** within its implementation.
///      This ensures that if multiple extensions are used and they all override the same hook,
///      a chain of calls is maintained, allowing all extensions to execute their logic.
///      For example:
///      `function _beforeMint(address to, uint256 amount) internal virtual override {`
///      `    super._beforeMint(to, amount); // Call parent/previous hook first!`
///      `    // Custom logic for this extension...`
///      `}`
///      An 'abstract contract' provides a template or partial implementation, and cannot be deployed directly.
///      `internal virtual` functions are callable only from the contract itself or derived contracts,
///      and they are designed to be overridden.

abstract contract SMARTHooks {
    // --- Hooks ---
    // The comments below apply to all hook functions defined in this contract.

    /// @notice Hook executed before a token minting operation.
    /// @dev To be overridden by extensions needing to perform checks or actions before tokens are created.
    ///      Implementations MUST call `super._beforeMint(_to, _amount)` first.
    /// @param _to The address that will receive the new tokens.
    /// @param _amount The quantity of tokens to be minted.
    function _beforeMint(address _to, uint256 _amount) internal virtual { }

    /// @notice Hook executed after a token minting operation has completed.
    /// @dev To be overridden by extensions needing to perform actions after tokens are created.
    ///      Implementations MUST call `super._afterMint(_to, _amount)` first.
    /// @param _to The address that received the new tokens.
    /// @param _amount The quantity of tokens that were minted.
    function _afterMint(address _to, uint256 _amount) internal virtual { }

    /// @notice Hook executed before a token transfer operation (including mints and burns, which are transfers to/from
    /// address(0)).
    /// @dev To be overridden by extensions needing to perform checks or actions before tokens are moved.
    ///      Implementations MUST call `super._beforeTransfer(_from, _to, _amount)` first.
    /// @param _from The address sending the tokens.
    /// @param _to The address receiving the tokens.
    /// @param _amount The quantity of tokens to be transferred.
    function _beforeTransfer(address _from, address _to, uint256 _amount) internal virtual { }

    /// @notice Hook executed after a token transfer operation has completed.
    /// @dev To be overridden by extensions needing to perform actions after tokens are moved.
    ///      Implementations MUST call `super._afterTransfer(_from, _to, _amount)` first.
    /// @param _from The address that sent the tokens.
    /// @param _to The address that received the tokens.
    /// @param _amount The quantity of tokens that were transferred.
    function _afterTransfer(address _from, address _to, uint256 _amount) internal virtual { }

    /// @notice Hook executed before a token burning operation.
    /// @dev To be overridden by extensions needing to perform checks or actions before tokens are destroyed.
    ///      Implementations MUST call `super._beforeBurn(_from, _amount)` first.
    /// @param _from The address whose tokens are being burned.
    /// @param _amount The quantity of tokens to be burned.
    function _beforeBurn(address _from, uint256 _amount) internal virtual { }

    /// @notice Hook executed after a token burning operation has completed.
    /// @dev To be overridden by extensions needing to perform actions after tokens are destroyed.
    ///      Implementations MUST call `super._afterBurn(_from, _amount)` first.
    /// @param _from The address whose tokens were burned.
    /// @param _amount The quantity of tokens that were burned.
    function _afterBurn(address _from, uint256 _amount) internal virtual { }

    /// @notice Hook executed before a token redemption operation.
    /// @dev To be overridden by extensions needing to perform checks or actions before tokens are redeemed.
    ///      Implementations MUST call `super._beforeRedeem(_from, _amount)` first.
    /// @param _from The address redeeming tokens.
    /// @param _amount The quantity of tokens to be redeemed.
    function _beforeRedeem(address _from, uint256 _amount) internal virtual { }

    /// @notice Hook executed after a token redemption operation has completed.
    /// @dev To be overridden by extensions needing to perform actions after tokens are redeemed.
    ///      Implementations MUST call `super._afterRedeem(_from, _amount)` first.
    /// @param _from The address that redeemed tokens.
    /// @param _amount The quantity of tokens that were redeemed.
    function _afterRedeem(address _from, uint256 _amount) internal virtual { }

    /// @notice Hook executed before a token recovery operation.
    /// @dev To be overridden by extensions needing to perform checks or actions before tokens are recovered.
    ///      Implementations MUST call `super._beforeRecoverTokens(_lostWallet, _newWallet)` first.
    /// @param _lostWallet The address of the wallet that is being recovered.
    /// @param _newWallet The address of the new wallet that will receive the tokens.
    function _beforeRecoverTokens(address _lostWallet, address _newWallet) internal virtual { }

    /// @notice Hook executed after a token recovery operation has completed.
    /// @dev To be overridden by extensions needing to perform actions after tokens are recovered.
    ///      Implementations MUST call `super._afterRecoverTokens(_lostWallet, _newWallet)` first.
    /// @param _lostWallet The address of the wallet that was recovered.
    /// @param _newWallet The address of the new wallet that received the tokens.
    function _afterRecoverTokens(address _lostWallet, address _newWallet) internal virtual { }
}
