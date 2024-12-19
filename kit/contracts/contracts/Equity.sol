// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20Blocklist } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Blocklist.sol";
import { ERC20Custodian } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Custodian.sol";
import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { Nonces } from "@openzeppelin/contracts/utils/Nonces.sol";

/// @title Equity - A security token representing equity ownership
/// @notice This contract implements a security token that represents equity ownership with voting rights, blocklist,
/// and custodian features
/// @dev Inherits from OpenZeppelin contracts to provide comprehensive security token functionality with governance
/// capabilities
/// @custom:security-contact support@settlemint.com
contract Equity is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    AccessControl,
    ERC20Permit,
    ERC20Blocklist,
    ERC20Custodian,
    ERC20Votes
{
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");
    bytes32 public constant USER_MANAGEMENT_ROLE = keccak256("USER_MANAGEMENT_ROLE");

    string private _equityClass;
    string private _equityCategory;

    /// @notice Deploys a new Equity token contract
    /// @dev Initializes the token with name, symbol, class, category and sets up voting capabilities
    /// @param name The token name
    /// @param symbol The token symbol
    /// @param equityClass_ The equity class (e.g., "Common", "Preferred")
    /// @param equityCategory_ The equity category (e.g., "Series A", "Seed")
    /// @param initialOwner The address that will receive admin rights
    constructor(
        string memory name,
        string memory symbol,
        string memory equityClass_,
        string memory equityCategory_,
        address initialOwner
    )
        ERC20(name, symbol)
        ERC20Permit(name)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner);
        _grantRole(USER_MANAGEMENT_ROLE, initialOwner);
        _equityClass = equityClass_;
        _equityCategory = equityCategory_;
    }

    /// @notice Returns the class of equity this token represents
    /// @return The equity class as a string
    function equityClass() public view returns (string memory) {
        return _equityClass;
    }

    /// @notice Returns the category of equity this token represents
    /// @return The equity category as a string
    function equityCategory() public view returns (string memory) {
        return _equityCategory;
    }

    /// @notice Pauses all token transfers
    /// @dev Only callable by the admin. Emits a Paused event from ERC20Pausable
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses token transfers
    /// @dev Only callable by the admin. Emits an Unpaused event from ERC20Pausable
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE role. Emits a Transfer event from ERC20
    /// @param to The address that will receive the minted tokens
    /// @param amount The quantity of tokens to create in base units
    function mint(address to, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        _mint(to, amount);
    }

    /// @notice Returns the current block timestamp for voting snapshots
    /// @dev Implementation of ERC20Votes clock method for voting delay and period calculations
    /// @return Current block timestamp cast to uint48
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    /// @notice Returns the description of the clock mode for voting snapshots
    /// @dev Implementation of ERC20Votes CLOCK_MODE method as required by EIP-6372
    /// @return String indicating timestamp-based clock mode
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }

    /// @notice Get the current nonce for an address
    /// @dev Required override to resolve ambiguity between ERC20Permit and Nonces
    /// @param owner The address to get the nonce for
    /// @return The current nonce used for permits and other signed approvals
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    /// @notice Checks if an address is a custodian
    /// @dev Only addresses with admin role are considered custodians for custodial operations
    /// @param user The address to check
    /// @return True if the address has the admin role, false otherwise
    function _isCustodian(address user) internal view override returns (bool) {
        return hasRole(USER_MANAGEMENT_ROLE, user);
    }

    /// @dev Blocks a user from token operations
    /// @param user Address to block
    /// @return True if user was not previously blocked
    function blockUser(address user) public onlyRole(USER_MANAGEMENT_ROLE) returns (bool) {
        return super._blockUser(user);
    }

    /// @dev Unblocks a user from token operations
    /// @param user Address to unblock
    /// @return True if user was previously blocked
    function unblockUser(address user) public onlyRole(USER_MANAGEMENT_ROLE) returns (bool) {
        return super._unblockUser(user);
    }

    /// @dev Unfreezes all tokens for a user
    /// @param user Address to unfreeze tokens for
    /// @param amount Amount of tokens to unfreeze
    function unfreeze(address user, uint256 amount) public onlyRole(USER_MANAGEMENT_ROLE) {
        _frozen[user] = _frozen[user] - amount;
        emit TokensUnfrozen(user, amount);
    }

    /// @notice Approves spending of tokens
    /// @dev Overrides both ERC20 and ERC20Blocklist to enforce blocklist restrictions
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
    /// @dev Handles balance updates while enforcing pausable, blocklist, custodian and voting power rules
    /// @param from The sender address
    /// @param to The recipient address
    /// @param value The amount being transferred in base units
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        override(ERC20, ERC20Pausable, ERC20Blocklist, ERC20Custodian, ERC20Votes)
    {
        super._update(from, to, value);
    }
}
