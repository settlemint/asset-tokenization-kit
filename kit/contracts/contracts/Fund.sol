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
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Fund - A security token representing fund shares
/// @notice This contract implements a security token that represents fund shares with voting rights, blocklist,
/// and custodian features
/// @dev Inherits from OpenZeppelin contracts to provide comprehensive security token functionality with governance
/// capabilities
/// @custom:security-contact support@settlemint.com
contract Fund is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    AccessControl,
    ERC20Permit,
    ERC20Blocklist,
    ERC20Custodian,
    ERC20Votes
{
    using Math for uint256;
    using SafeERC20 for IERC20;

    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");
    bytes32 public constant USER_MANAGEMENT_ROLE = keccak256("USER_MANAGEMENT_ROLE");

    error InvalidDecimals(uint8 decimals);
    error InvalidISIN();
    error InvalidTokenAddress();
    error InsufficientTokenBalance();

    /// @notice The number of decimals used for token amounts
    uint8 private immutable _decimals;

    /// @notice The timestamp of the last fee collection
    uint40 private _lastFeeCollection;

    /// @notice The management fee in basis points
    uint16 private immutable _managementFeeBps;

    /// @notice The ISIN (International Securities Identification Number) of the fund
    string private _isin;

    /// @notice The class of the fund (e.g., "Hedge Fund", "Mutual Fund")
    string private _fundClass;

    /// @notice The category of the fund (e.g., "Long/Short Equity", "Global Macro")
    string private _fundCategory;

    // Additional events for fund management
    event ManagementFeeCollected(uint256 amount, uint256 timestamp);
    event PerformanceFeeCollected(uint256 amount, uint256 timestamp);
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);

    /// @notice Constructor
    /// @param name The token name
    /// @param symbol The token symbol
    /// @param decimals_ The number of decimals for the token
    /// @param initialOwner The address that will receive admin rights
    /// @param isin_ The ISIN (International Securities Identification Number) of the fund
    /// @param managementFeeBps_ The management fee in basis points
    /// @param fundClass_ The class of the fund
    /// @param fundCategory_ The category of the fund
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        address initialOwner,
        string memory isin_,
        uint16 managementFeeBps_,
        string memory fundClass_,
        string memory fundCategory_
    )
        ERC20(name, symbol)
        ERC20Permit(name)
    {
        if (decimals_ > 18) revert InvalidDecimals(decimals_);
        if (bytes(isin_).length != 0 && bytes(isin_).length != 12) revert InvalidISIN();

        _decimals = decimals_;
        _isin = isin_;
        _managementFeeBps = managementFeeBps_;
        _fundClass = fundClass_;
        _fundCategory = fundCategory_;
        _lastFeeCollection = uint40(block.timestamp);

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner);
        _grantRole(USER_MANAGEMENT_ROLE, initialOwner);
    }

    /// @notice Returns the fund class
    function fundClass() external view returns (string memory) {
        return _fundClass;
    }

    /// @notice Returns the fund category
    function fundCategory() external view returns (string memory) {
        return _fundCategory;
    }

    /// @notice Returns the ISIN
    function isin() external view returns (string memory) {
        return _isin;
    }

    /// @notice Returns the number of decimals used for token amounts
    /// @dev Implementation of the ERC20 decimals() function
    /// @return The number of decimals
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function managementFeeBps() external view returns (uint16) {
        return _managementFeeBps;
    }

    /// @notice Pauses all token transfers
    /// @dev Only callable by the admin. Emits a Paused event from ERC20Pausable
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses token transfers
    /// @dev Only callable by the admin. Emits an Unpaused event from ERC20Pausable
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE role. Emits a Transfer event from ERC20
    /// @param to The address that will receive the minted tokens
    /// @param amount The quantity of tokens to create in base units
    function mint(address to, uint256 amount) external onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        _mint(to, amount);
    }

    /// @notice Returns the current block timestamp for voting snapshots
    /// @dev Implementation of ERC20Votes clock method for voting delay and period calculations
    /// @return Current block timestamp cast to uint48
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
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

    /// @notice Collects management fee with minimum interval check
    function collectManagementFee() public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        uint256 timeElapsed = block.timestamp - _lastFeeCollection;
        uint256 aum = totalSupply();

        // Calculate fee: (AUM * fee_rate * time_elapsed) / (100% * 1 year)
        // Rearranged to minimize precision loss
        uint256 fee = Math.mulDiv(Math.mulDiv(aum, _managementFeeBps, 10_000), timeElapsed, 365 days);

        if (fee > 0) {
            _mint(msg.sender, fee);
            emit ManagementFeeCollected(fee, block.timestamp);
        }

        _lastFeeCollection = uint40(block.timestamp);
        return fee;
    }

    /// @notice Withdraws tokens from the fund
    /// @dev Only callable by supply manager. Emits a TokenWithdrawn event
    /// @param token The token to withdraw
    /// @param to The recipient address
    /// @param amount The amount to withdraw
    function withdrawToken(address token, address to, uint256 amount) external onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        if (token == address(0)) revert InvalidTokenAddress();
        if (to == address(0)) revert InvalidTokenAddress();
        if (amount == 0) return;

        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) revert InsufficientTokenBalance();

        IERC20(token).safeTransfer(to, amount);
        emit TokenWithdrawn(token, to, amount);
    }
}
