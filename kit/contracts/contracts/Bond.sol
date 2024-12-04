// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20Blocklist } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Blocklist.sol";
import { ERC20Custodian } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Custodian.sol";

/// @title Bond - A standard bond token implementation
/// @notice This contract implements an ERC20 token representing a standard bond with fixed-income characteristics
/// @dev Inherits from multiple OpenZeppelin contracts and implements bond-specific features
/// @custom:security-contact support@settlemint.com
contract Bond is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit, ERC20Blocklist, ERC20Custodian {
    /// @notice Custom errors for the Bond contract
    error BondAlreadyMatured();
    error BondNotYetMatured();
    error BondInvalidMaturityDate();
    error BondMaturityReached();

    /// @notice Timestamp when the bond matures
    uint256 public immutable maturityDate;

    /// @notice Event emitted when the bond reaches maturity and is closed
    event BondMatured(uint256 timestamp);

    /// @notice Tracks whether the bond has matured
    bool public isMatured;

    /// @notice Modifier to prevent transfers after maturity
    modifier notMatured() {
        if (isMatured) revert BondMaturityReached();
        _;
    }

    /// @notice Deploys a new Bond token contract
    /// @param name The token name
    /// @param symbol The token symbol
    /// @param initialOwner The address that will receive ownership
    /// @param _maturityDate Timestamp when the bond matures
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        uint256 _maturityDate
    )
        ERC20(name, symbol)
        Ownable(initialOwner)
        ERC20Permit(name)
    {
        if (_maturityDate <= block.timestamp) revert BondInvalidMaturityDate();

        maturityDate = _maturityDate;
    }

    /// @notice Pauses all token transfers
    /// @dev Only callable by the contract owner. Emits a Paused event
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice Unpauses token transfers
    /// @dev Only callable by the contract owner. Emits an Unpaused event
    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only callable by the contract owner. Emits a Transfer event
    /// @param to The address that will receive the minted tokens
    /// @param amount The quantity of tokens to create in base units
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /// @notice Checks if an address is a custodian
    /// @dev Internal function that considers only the owner as the custodian
    /// @param user The address to check
    /// @return True if the address is the contract owner, false otherwise
    function _isCustodian(address user) internal view override returns (bool) {
        return user == owner();
    }

    /// @dev Blocks a user from token operations
    /// @param user Address to block
    /// @return True if user was not previously blocked
    function blockUser(address user) public onlyOwner returns (bool) {
        return super._blockUser(user);
    }

    /// @dev Unblocks a user from token operations
    /// @param user Address to unblock
    /// @return True if user was previously blocked
    function unblockUser(address user) public onlyOwner returns (bool) {
        return super._unblockUser(user);
    }

    /// @dev Unfreezes all tokens for a user
    /// @param user Address to unfreeze tokens for
    /// @param amount Amount of tokens to unfreeze
    function unfreeze(address user, uint256 amount) public onlyOwner {
        _frozen[user] = _frozen[user] - amount;
        emit TokensUnfrozen(user, amount);
    }

    /// @notice Approves spending of tokens
    /// @dev Internal function that handles allowance updates across inherited features
    /// @param owner The token owner
    /// @param spender The approved spender
    /// @param value The approved amount in base units
    /// @param emitEvent Whether to emit an Approval event
    function _approve(
        address owner,
        address spender,
        uint256 value,
        bool emitEvent
    )
        internal
        override(ERC20, ERC20Blocklist)
    {
        super._approve(owner, spender, value, emitEvent);
    }

    /// @notice Updates token balances during transfers
    /// @dev Internal function that handles balance updates and voting power adjustments
    /// @param from The sender address
    /// @param to The recipient address
    /// @param value The amount being transferred in base units
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        override(ERC20, ERC20Pausable, ERC20Blocklist, ERC20Custodian)
        notMatured
    {
        super._update(from, to, value);
    }

    /// @notice Closes off the bond at maturity
    /// @dev Only callable by owner after maturity date
    function mature() external onlyOwner {
        if (block.timestamp < maturityDate) revert BondNotYetMatured();
        if (isMatured) revert BondAlreadyMatured();

        isMatured = true;
        emit BondMatured(block.timestamp);
    }
}
