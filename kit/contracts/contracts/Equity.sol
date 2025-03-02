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
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Equity - A security token representing equity ownership
/// @notice This contract implements a security token that represents equity ownership with voting rights,
/// blocklist, and custodian features. It supports different equity classes and categories, and includes
/// governance capabilities through the ERC20Votes extension.
/// @dev Inherits from multiple OpenZeppelin contracts to provide comprehensive security token functionality
/// with governance capabilities, meta-transactions support, and role-based access control.
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
    using SafeERC20 for IERC20;

    /// @notice Role identifier for addresses that can manage token supply
    /// @dev Keccak256 hash of "SUPPLY_MANAGEMENT_ROLE"
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");

    /// @notice Role identifier for addresses that can manage users (blocking, unblocking, etc.)
    /// @dev Keccak256 hash of "USER_MANAGEMENT_ROLE"
    bytes32 public constant USER_MANAGEMENT_ROLE = keccak256("USER_MANAGEMENT_ROLE");

    /// @notice Custom errors for the Equity contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error InvalidDecimals(uint8 decimals);
    error InvalidISIN();
    error InvalidTokenAddress();
    error InsufficientTokenBalance();

    /// @notice Emitted when mistakenly sent tokens are withdrawn
    /// @param token The address of the token being withdrawn
    /// @param to The address receiving the tokens
    /// @param amount The amount of tokens withdrawn
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);

    /// @notice The class of the equity (e.g., "Common", "Preferred")
    /// @dev Immutable after construction
    string private _equityClass;

    /// @notice The category of the equity (e.g., "Series A", "Seed")
    /// @dev Immutable after construction
    string private _equityCategory;

    /// @notice The number of decimals used for token amounts
    /// @dev Set at deployment and cannot be changed
    uint8 private immutable _decimals;

    /// @notice Deploys a new Equity token contract
    /// @dev Sets up the token with specified parameters and initializes voting capabilities.
    /// The deployer receives DEFAULT_ADMIN_ROLE, SUPPLY_MANAGEMENT_ROLE, and USER_MANAGEMENT_ROLE.
    /// @param name The token name
    /// @param symbol The token symbol
    /// @param decimals_ The number of decimals for the token (must be <= 18)
    /// @param initialOwner The address that will receive admin rights
    /// @param equityClass_ The equity class (e.g., "Common", "Preferred")
    /// @param equityCategory_ The equity category (e.g., "Series A", "Seed")
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        address initialOwner,
        string memory equityClass_,
        string memory equityCategory_,
        address forwarder
    )
        ERC20(name, symbol)
        ERC20Permit(name)
        ERC2771Context(forwarder)
    {
        if (decimals_ > 18) revert InvalidDecimals(decimals_);

        _decimals = decimals_;
        _equityClass = equityClass_;
        _equityCategory = equityCategory_;

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner);
        _grantRole(USER_MANAGEMENT_ROLE, initialOwner);
    }

    /// @notice Returns the message sender in the context of meta-transactions
    /// @dev Overrides both Context and ERC2771Context to support meta-transactions
    /// @return The address of the message sender
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return super._msgSender();
    }

    /// @notice Returns the message data in the context of meta-transactions
    /// @dev Overrides both Context and ERC2771Context to support meta-transactions
    /// @return The message data
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    /// @notice Returns the length of the context suffix for meta-transactions
    /// @dev Overrides both Context and ERC2771Context to support meta-transactions
    /// @return The length of the context suffix
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }

    /// @notice Returns the number of decimals used for token amounts
    /// @dev Overrides the default ERC20 decimals function to use the configurable value
    /// @return The number of decimals
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /// @notice Returns the class of equity this token represents
    /// @dev The equity class is immutable after construction
    /// @return The equity class as a string (e.g., "Common", "Preferred")
    function equityClass() public view returns (string memory) {
        return _equityClass;
    }

    /// @notice Returns the category of equity this token represents
    /// @dev The equity category is immutable after construction
    /// @return The equity category as a string (e.g., "Series A", "Seed")
    function equityCategory() public view returns (string memory) {
        return _equityCategory;
    }

    /// @notice Pauses all token transfers
    /// @dev Only callable by addresses with DEFAULT_ADMIN_ROLE. Emits a Paused event.
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses token transfers
    /// @dev Only callable by addresses with DEFAULT_ADMIN_ROLE. Emits an Unpaused event.
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE. Emits a Transfer event.
    /// @param to The address that will receive the minted tokens
    /// @param amount The quantity of tokens to create in base units
    function mint(address to, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        _mint(to, amount);
    }

    /// @notice Returns the current timestamp for historical balance tracking
    /// @dev Overrides the default clock function to use timestamps instead of block numbers
    /// @return The current timestamp as a uint48
    function clock() public view virtual override returns (uint48) {
        return uint48(block.timestamp);
    }

    /// @notice Returns the clock mode used for historical balance tracking
    /// @dev Indicates that timestamps are used instead of block numbers
    /// @return A string indicating the clock mode ("mode=timestamp")
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure virtual override returns (string memory) {
        return "mode=timestamp";
    }

    /// @notice Returns the current nonce for an address
    /// @dev Required override to resolve ambiguity between ERC20Permit and Nonces
    /// @param owner The address to get the nonce for
    /// @return The current nonce used for permits and other signed approvals
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    /// @notice Checks if an address is a custodian
    /// @dev Internal function that considers only addresses with USER_MANAGEMENT_ROLE as custodians
    /// @param user The address to check
    /// @return True if the address has the USER_MANAGEMENT_ROLE, false otherwise
    function _isCustodian(address user) internal view override returns (bool) {
        return hasRole(USER_MANAGEMENT_ROLE, user);
    }

    /// @notice Blocks a user from token operations
    /// @dev Only callable by addresses with USER_MANAGEMENT_ROLE
    /// @param user Address to block
    /// @return True if user was not previously blocked
    function blockUser(address user) public onlyRole(USER_MANAGEMENT_ROLE) returns (bool) {
        return super._blockUser(user);
    }

    /// @notice Unblocks a user from token operations
    /// @dev Only callable by addresses with USER_MANAGEMENT_ROLE
    /// @param user Address to unblock
    /// @return True if user was previously blocked
    function unblockUser(address user) public onlyRole(USER_MANAGEMENT_ROLE) returns (bool) {
        return super._unblockUser(user);
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
        override(ERC20, ERC20Pausable, ERC20Blocklist, ERC20Custodian, ERC20Votes)
    {
        super._update(from, to, value);
    }

    /// @notice Withdraws mistakenly sent tokens from the contract
    /// @dev Only callable by addresses with DEFAULT_ADMIN_ROLE. Cannot withdraw this token.
    /// @param token The token to withdraw
    /// @param to The recipient address
    /// @param amount The amount to withdraw
    function withdrawToken(address token, address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (token == address(0)) revert InvalidTokenAddress();
        if (to == address(0)) revert InvalidTokenAddress();
        if (amount == 0) return;

        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) revert InsufficientTokenBalance();

        IERC20(token).safeTransfer(to, amount);
        emit TokenWithdrawn(token, to, amount);
    }
}
