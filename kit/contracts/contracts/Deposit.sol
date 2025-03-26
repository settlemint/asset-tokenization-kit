// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20Allowlist } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Allowlist.sol";
import { ERC20Collateral } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Collateral.sol";
import { ERC20Custodian } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Custodian.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title StableCoin - A collateralized stablecoin with advanced control features
/// @notice This contract implements a stablecoin with collateral backing, blocklist, pause, and custodian capabilities.
/// It ensures that the total supply is always backed by sufficient collateral and provides role-based access control
/// for supply and user management.
/// @dev Inherits from multiple OpenZeppelin contracts to provide comprehensive stablecoin functionality with
/// advanced control features, meta-transactions support, and collateral tracking.
/// @custom:security-contact support@settlemint.com
contract Deposit is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    AccessControl,
    ERC20Permit,
    ERC20Allowlist,
    ERC20Collateral,
    ERC20Custodian,
    ERC2771Context
{
    using SafeERC20 for IERC20;

    /// @notice Role identifier for addresses that can manage token supply
    /// @dev Keccak256 hash of "SUPPLY_MANAGEMENT_ROLE"
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");

    /// @notice Role identifier for addresses that can manage users (blocking, unblocking, etc.)
    /// @dev Keccak256 hash of "USER_MANAGEMENT_ROLE"
    bytes32 public constant USER_MANAGEMENT_ROLE = keccak256("USER_MANAGEMENT_ROLE");

    /// @notice Custom errors for the StableCoin contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error InvalidDecimals(uint8 decimals);
    error InvalidISIN();
    error InvalidLiveness();
    error InsufficientCollateral();
    error InvalidTokenAddress();
    error InsufficientTokenBalance();

    /// @notice Structure to store collateral proof details
    /// @dev Used to track the amount and timestamp of collateral proofs
    struct CollateralProof {
        /// @notice The amount of collateral proven
        uint256 amount;
        /// @notice The timestamp when the proof was submitted
        uint48 timestamp;
    }

    /// @notice The current collateral proof details
    /// @dev Stores the latest proven collateral amount and timestamp
    CollateralProof private _collateralProof;

    /// @notice The number of decimals used for token amounts
    /// @dev Set at deployment and cannot be changed
    uint8 private immutable _decimals;

    /// @notice The timestamp of the last collateral update
    /// @dev Used to track when collateral was last proven
    uint256 private _lastCollateralUpdate;

    /// @notice Emitted when the collateral amount is updated
    /// @param oldAmount The previous collateral amount
    /// @param newAmount The new collateral amount
    /// @param timestamp The timestamp when the update occurred
    event CollateralUpdated(uint256 oldAmount, uint256 newAmount, uint256 timestamp);

    /// @notice Emitted when mistakenly sent tokens are withdrawn
    /// @param token The address of the token being withdrawn
    /// @param to The address receiving the tokens
    /// @param amount The amount of tokens withdrawn
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);

    /// @notice Deploys a new StableCoin token contract
    /// @dev Sets up the token with specified parameters and initializes collateral tracking.
    /// The deployer receives DEFAULT_ADMIN_ROLE, SUPPLY_MANAGEMENT_ROLE, and USER_MANAGEMENT_ROLE.
    /// @param name The token name
    /// @param symbol The token symbol
    /// @param decimals_ The number of decimals for the token (must be <= 18)
    /// @param initialOwner The address that will receive admin rights
    /// @param collateralLivenessSeconds Duration in seconds that collateral proofs remain valid (must be > 0)
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        address initialOwner,
        uint48 collateralLivenessSeconds,
        address forwarder
    )
        ERC20(name, symbol)
        ERC20Permit(name)
        ERC20Collateral(collateralLivenessSeconds)
        ERC2771Context(forwarder)
    {
        if (decimals_ > 18) revert InvalidDecimals(decimals_);
        if (collateralLivenessSeconds == 0) revert InvalidLiveness();

        _decimals = decimals_;
        _lastCollateralUpdate = block.timestamp;
        _allowUser(initialOwner);

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
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE. Requires sufficient collateral.
    /// @param to The address that will receive the minted tokens
    /// @param amount The quantity of tokens to create in base units
    function mint(address to, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        (uint256 collateralAmount,) = collateral();
        if (collateralAmount < totalSupply() + amount) revert InsufficientCollateral();

        _mint(to, amount);
    }

    /// @notice Returns current collateral amount and timestamp
    /// @dev Implements the ERC20Collateral interface
    /// @return amount Current proven collateral amount
    /// @return timestamp Timestamp when the collateral was last proven
    function collateral() public view virtual override returns (uint256 amount, uint48 timestamp) {
        return (_collateralProof.amount, _collateralProof.timestamp);
    }

    /// @notice Returns the timestamp of the last collateral update
    /// @dev Returns the timestamp of the last collateral update
    /// @return The timestamp of the last collateral update
    function lastCollateralUpdate() public view returns (uint256) {
        return _lastCollateralUpdate;
    }

    /// @notice Updates the proven collateral amount with a timestamp
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE. Requires collateral >= total supply.
    /// @param amount New collateral amount
    function updateCollateral(uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        if (amount < totalSupply()) revert InsufficientCollateral();

        uint256 oldAmount = _collateralProof.amount;
        _collateralProof = CollateralProof({ amount: amount, timestamp: uint48(block.timestamp) });
        _lastCollateralUpdate = block.timestamp;

        emit CollateralUpdated(oldAmount, amount, block.timestamp);
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
    function allowUser(address user) public onlyRole(USER_MANAGEMENT_ROLE) returns (bool) {
        return super._allowUser(user);
    }

    /// @notice Unblocks a user from token operations
    /// @dev Only callable by addresses with USER_MANAGEMENT_ROLE
    /// @param user Address to unblock
    /// @return True if user was previously blocked
    function disallowUser(address user) public onlyRole(USER_MANAGEMENT_ROLE) returns (bool) {
        return super._disallowUser(user);
    }

    /// @notice Updates token balances during transfers
    /// @dev Internal function that handles balance updates and enforces various restrictions
    /// @param from The sender address
    /// @param to The recipient address
    /// @param value The amount being transferred in base units
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        override(ERC20, ERC20Pausable, ERC20Allowlist, ERC20Collateral, ERC20Custodian)
    {
        super._update(from, to, value);
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
        override(ERC20, ERC20Allowlist)
    {
        super._approve(owner, spender, value, emitEvent);
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
