// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20Blocklist } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Blocklist.sol";
import { ERC20Custodian } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Custodian.sol";
import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { Nonces } from "@openzeppelin/contracts/utils/Nonces.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
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
    ERC20Votes,
    ERC2771Context
{
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");
    bytes32 public constant USER_MANAGEMENT_ROLE = keccak256("USER_MANAGEMENT_ROLE");

    error InvalidDecimals(uint8 decimals);
    error InvalidISIN();

    /// @notice The class of the equity (e.g., "Common", "Preferred")
    string private _equityClass;

    /// @notice The category of the equity (e.g., "Series A", "Seed")
    string private _equityCategory;

    /// @notice The ISIN (International Securities Identification Number) of the equity
    string private _isin;

    /// @notice The number of decimals used for token amounts
    uint8 private immutable _decimals;

    /// @notice Deploys a new Equity token contract
    /// @dev Initializes the token with name, symbol, class, category and sets up voting capabilities
    /// @param name The token name
    /// @param symbol The token symbol
    /// @param decimals_ The number of decimals for the token
    /// @param initialOwner The address that will receive admin rights
    /// @param isin_ The ISIN (International Securities Identification Number) of the equity
    /// @param equityClass_ The equity class (e.g., "Common", "Preferred")
    /// @param equityCategory_ The equity category (e.g., "Series A", "Seed")
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        address initialOwner,
        string memory isin_,
        string memory equityClass_,
        string memory equityCategory_,
        address forwarder
    )
        ERC20(name, symbol)
        ERC20Permit(name)
        ERC2771Context(forwarder)
    {
        if (decimals_ > 18) revert InvalidDecimals(decimals_);
        if (bytes(isin_).length != 0 && bytes(isin_).length != 12) revert InvalidISIN();

        _decimals = decimals_;
        _isin = isin_;
        _equityClass = equityClass_;
        _equityCategory = equityCategory_;

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner);
        _grantRole(USER_MANAGEMENT_ROLE, initialOwner);
    }

    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return super._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }

    /// @notice Returns the number of decimals used to get its user representation
    /// @dev Override the default ERC20 decimals function to use the configurable value
    /// @return The number of decimals
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
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

    /// @notice Returns the ISIN (International Securities Identification Number) of the equity
    /// @return The ISIN of the equity
    function isin() public view returns (string memory) {
        return _isin;
    }

    /// @notice Pauses all token transfers
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

    /// @notice Override the clock function to use timestamps instead of block numbers
    /// @dev This is used for historical balance tracking
    /// @return The current timestamp
    function clock() public view virtual override returns (uint48) {
        return uint48(block.timestamp);
    }

    /// @notice Override the clock mode to indicate we're using timestamps
    /// @dev This is used for historical balance tracking
    /// @return A string indicating the clock mode
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure virtual override returns (string memory) {
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
