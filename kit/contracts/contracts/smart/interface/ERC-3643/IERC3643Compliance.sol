// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

/// Events

/// @notice Emitted when a token has been bound to the compliance contract
/// @dev This event is emitted when a token has been bound to the compliance contract.
/// @param _token is the address of the token to bind.
event TokenBound(address indexed _token);

/// @notice Emitted when a token has been unbound from the compliance contract
/// @dev This event is emitted when a token has been unbound from the compliance contract.
/// @param _token is the address of the token to unbind.
event TokenUnbound(address indexed _token);

/**
 * @title IERC3643Compliance
 * @author Tokeny
 * @notice Interface for ERC-3643 compliant Compliance contract managing transfer restrictions
 * @dev This interface defines the standard for compliance contracts that enforce transfer rules
 *      for security tokens. It manages compliance modules that implement various regulatory
 *      requirements and restrictions on token transfers.
 */
interface IERC3643Compliance {
    /// Functions
    /// initialization of the compliance contract
    /**
     *  @notice Binds a token to the compliance contract
     *  @dev binds a token to the compliance contract
     *  @param _token address of the token to bind
     *  This function can be called ONLY by the owner of the compliance contract
     *  Emits a TokenBound event
     */
    function bindToken(address _token) external;

    /**
     *  @notice Unbinds a token from the compliance contract
     *  @dev unbinds a token from the compliance contract
     *  @param _token address of the token to unbind
     *  This function can be called ONLY by the owner of the compliance contract
     *  Emits a TokenUnbound event
     */
    function unbindToken(address _token) external;

    // compliance check and state update
    /**
     *  @notice Updates compliance state after a token transfer
     *  @dev function called whenever tokens are transferred
     *  from one wallet to another
     *  this function can update state variables in the modules bound to the compliance
     *  these state variables being used by the module checks to decide if a transfer
     *  is compliant or not depending on the values stored in these state variables and on
     *  the parameters of the modules
     *  This function can be called ONLY by the token contract bound to the compliance
     *  @param _from The address of the sender
     *  @param _to The address of the receiver
     *  @param _amount The amount of tokens involved in the transfer
     *  This function calls moduleTransferAction() on each module bound to the compliance contract
     */
    function transferred(address _from, address _to, uint256 _amount) external;

    /**
     *  @notice Updates compliance state after tokens are created
     *  @dev function called whenever tokens are created on a wallet
     *  this function can update state variables in the modules bound to the compliance
     *  these state variables being used by the module checks to decide if a transfer
     *  is compliant or not depending on the values stored in these state variables and on
     *  the parameters of the modules
     *  This function can be called ONLY by the token contract bound to the compliance
     *  @param _to The address of the receiver
     *  @param _amount The amount of tokens involved in the minting
     *  This function calls moduleMintAction() on each module bound to the compliance contract
     */
    function created(address _to, uint256 _amount) external;

    /**
     *  @notice Updates compliance state after tokens are destroyed
     *  @dev function called whenever tokens are destroyed from a wallet
     *  this function can update state variables in the modules bound to the compliance
     *  these state variables being used by the module checks to decide if a transfer
     *  is compliant or not depending on the values stored in these state variables and on
     *  the parameters of the modules
     *  This function can be called ONLY by the token contract bound to the compliance
     *  @param _from The address on which tokens are burnt
     *  @param _amount The amount of tokens involved in the burn
     *  This function calls moduleBurnAction() on each module bound to the compliance contract
     */
    function destroyed(address _from, uint256 _amount) external;

    /**
     *  @notice Checks if a transfer is compliant with all bound modules
     *  @dev checks that the transfer is compliant.
     *  default compliance always returns true
     *  READ ONLY FUNCTION, this function cannot be used to increment
     *  counters, emit events, ...
     *  @param _from The address of the sender
     *  @param _to The address of the receiver
     *  @param _amount The amount of tokens involved in the transfer
     *  This function will call moduleCheck() on every module bound to the compliance
     *  If each of the module checks return TRUE, this function will return TRUE as well
     *  returns FALSE otherwise
     *  @return True if the transfer is compliant, false otherwise
     */
    function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);

    /// check the parameters of the compliance contract

    /**
     *  @notice Checks if a token is bound to this compliance contract
     *  @param _token The address of the token to check
     *  @return True if the token is bound, false otherwise
     */
    function isTokenBound(address _token) external view returns (bool);

    /**
     *  @notice Gets the address of the token bound to this compliance contract
     *  @dev getter for the address of the token bound
     *  returns the address of the token
     *  @return The address of the bound token
     */
    function getTokenBound() external view returns (address);
}
