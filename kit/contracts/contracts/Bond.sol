// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { ERC20Capped } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20Blocklist } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Blocklist.sol";
import { ERC20Custodian } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Custodian.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20Yield } from "./extensions/ERC20Yield.sol";
import { ERC20HistoricalBalances } from "./extensions/ERC20HistoricalBalances.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Bond - A standard bond token implementation with face value in underlying asset
/// @notice This contract implements an ERC20 token representing a standard bond with fixed-income characteristics and
/// face value in an underlying ERC20 asset. It supports features like maturity, redemption, yield distribution,
/// and role-based access control.
/// @dev Inherits from multiple OpenZeppelin contracts to provide standard token functionality, access control,
/// meta-transactions, and custom features like historical balances and yield distribution.
/// @custom:security-contact support@settlemint.com
contract Bond is
    ERC20,
    ERC20HistoricalBalances,
    ERC20Capped,
    ERC20Burnable,
    ERC20Pausable,
    AccessControl,
    ERC20Permit,
    ERC20Blocklist,
    ERC20Custodian,
    ERC20Yield,
    ERC2771Context
{
    using SafeERC20 for IERC20;

    /// @notice Custom errors for the Bond contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error BondAlreadyMatured();
    error BondNotYetMatured();
    error BondInvalidMaturityDate();
    error InvalidDecimals(uint8 decimals);
    error InvalidUnderlyingAsset();
    error InvalidFaceValue();
    error InsufficientUnderlyingBalance();
    error InvalidRedemptionAmount();
    error InsufficientRedeemableBalance();
    error InvalidAmount();
    error InvalidISIN();
    error InvalidTokenAddress();
    error InsufficientTokenBalance();
    error CannotWithdrawUnderlyingAsset();

    /// @notice Role identifier for addresses that can manage token supply
    /// @dev Keccak256 hash of "SUPPLY_MANAGEMENT_ROLE"
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");

    /// @notice Role identifier for addresses that can manage users (blocking, unblocking, etc.)
    /// @dev Keccak256 hash of "USER_MANAGEMENT_ROLE"
    bytes32 public constant USER_MANAGEMENT_ROLE = keccak256("USER_MANAGEMENT_ROLE");

    /// @notice Timestamp when the bond matures
    /// @dev Set at deployment and cannot be changed
    uint256 public immutable maturityDate;

    /// @notice The number of decimals used for token amounts
    /// @dev Set at deployment and cannot be changed
    uint8 private immutable _decimals;

    /// @notice Tracks whether the bond has matured
    /// @dev Set to true when mature() is called after maturity date
    bool public isMatured;

    /// @notice The face value of the bond in underlying asset base units
    /// @dev Set at deployment and cannot be changed
    uint256 public immutable faceValue;

    /// @notice The underlying asset contract used for face value denomination
    /// @dev Must be a valid ERC20 token contract
    IERC20 public immutable underlyingAsset;

    /// @notice Tracks how many bonds each holder has redeemed
    /// @dev Maps holder address to amount of bonds redeemed
    mapping(address => uint256) public bondRedeemed;

    /// @notice The ISIN (International Securities Identification Number) of the bond
    /// @dev Must be exactly 12 characters if provided
    string private _isin;

    /// @notice Emitted when the bond reaches maturity and is closed
    /// @param timestamp The block timestamp when the bond matured
    event BondMatured(uint256 timestamp);

    /// @notice Emitted when a bond is redeemed for underlying assets
    /// @param holder The address redeeming the bonds
    /// @param bondAmount The amount of bonds redeemed
    /// @param underlyingAmount The amount of underlying assets received
    event BondRedeemed(address indexed holder, uint256 bondAmount, uint256 underlyingAmount);

    /// @notice Emitted when underlying assets are topped up
    /// @param from The address providing the underlying assets
    /// @param amount The amount of underlying assets added
    event UnderlyingAssetTopUp(address indexed from, uint256 amount);

    /// @notice Emitted when underlying assets are withdrawn
    /// @param to The address receiving the underlying assets
    /// @param amount The amount of underlying assets withdrawn
    event UnderlyingAssetWithdrawn(address indexed to, uint256 amount);

    /// @notice Emitted when mistakenly sent tokens are withdrawn
    /// @param token The address of the token being withdrawn
    /// @param to The address receiving the tokens
    /// @param amount The amount of tokens withdrawn
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);

    /// @notice Modifier to prevent operations after bond maturity
    /// @dev Reverts with BondAlreadyMatured if the bond has matured
    modifier notMatured() {
        if (isMatured) revert BondAlreadyMatured();
        _;
    }

    /// @notice Modifier to ensure operations only occur after bond maturity
    /// @dev Reverts with BondNotYetMatured if the bond has not matured
    modifier onlyMatured() {
        if (!isMatured) revert BondNotYetMatured();
        _;
    }

    /// @notice Deploys a new Bond token contract
    /// @dev Sets up the bond with its initial configuration and grants roles to the initial owner
    /// @param name The token name
    /// @param symbol The token symbol
    /// @param decimals_ The number of decimals for the token (must be <= 18)
    /// @param initialOwner The address that will receive admin rights
    /// @param isin_ The ISIN (International Securities Identification Number) of the bond (must be empty or 12
    /// characters)
    /// @param _cap The maximum total supply of the token
    /// @param _maturityDate Timestamp when the bond matures (must be in the future)
    /// @param _faceValue The face value of the bond in underlying asset base units (must be > 0)
    /// @param _underlyingAsset The address of the underlying asset contract (must be a valid ERC20)
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        address initialOwner,
        string memory isin_,
        uint256 _cap,
        uint256 _maturityDate,
        uint256 _faceValue,
        address _underlyingAsset,
        address forwarder
    )
        ERC20(name, symbol)
        ERC20Permit(name)
        ERC20Capped(_cap)
        ERC2771Context(forwarder)
    {
        if (_maturityDate <= block.timestamp) revert BondInvalidMaturityDate();
        if (decimals_ > 18) revert InvalidDecimals(decimals_);
        if (_faceValue == 0) revert InvalidFaceValue();
        if (_underlyingAsset == address(0)) revert InvalidUnderlyingAsset();
        if (bytes(isin_).length != 0 && bytes(isin_).length != 12) revert InvalidISIN();

        // Verify the underlying asset contract exists by attempting to call a view function
        try IERC20(_underlyingAsset).totalSupply() returns (uint256) {
            // Contract exists and implements IERC20
        } catch {
            revert InvalidUnderlyingAsset();
        }

        _decimals = decimals_;
        maturityDate = _maturityDate;
        faceValue = _faceValue;
        underlyingAsset = IERC20(_underlyingAsset);
        _isin = isin_;

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

    /// @notice Unfreezes all tokens for a user
    /// @dev Only callable by addresses with USER_MANAGEMENT_ROLE
    /// @param user Address to unfreeze tokens for
    /// @param amount Amount of tokens to unfreeze
    function unfreeze(address user, uint256 amount) public onlyRole(USER_MANAGEMENT_ROLE) {
        _frozen[user] = _frozen[user] - amount;
        emit TokensUnfrozen(user, amount);
    }

    /// @notice Closes off the bond at maturity
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE after maturity date
    /// @dev Requires sufficient underlying assets for all potential redemptions
    function mature() external onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        if (block.timestamp < maturityDate) revert BondNotYetMatured();
        if (isMatured) revert BondAlreadyMatured();

        uint256 needed = totalUnderlyingNeeded();
        if (underlyingAssetBalance() < needed) revert InsufficientUnderlyingBalance();

        isMatured = true;
        emit BondMatured(block.timestamp);
    }

    /// @notice Allows topping up the contract with underlying assets
    /// @dev Anyone can top up the contract with underlying assets
    /// @param amount The amount of underlying assets to top up
    function topUpUnderlyingAsset(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();

        bool success = underlyingAsset.transferFrom(_msgSender(), address(this), amount);
        if (!success) revert InsufficientUnderlyingBalance();

        emit UnderlyingAssetTopUp(_msgSender(), amount);
    }

    /// @notice Allows withdrawing excess underlying assets
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE
    /// @param to The address to send the underlying assets to
    /// @param amount The amount of underlying assets to withdraw
    function withdrawUnderlyingAsset(address to, uint256 amount) external onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        _withdrawUnderlyingAsset(to, amount);
    }

    /// @notice Allows withdrawing all excess underlying assets
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE
    /// @param to The address to send the underlying assets to
    function withdrawExcessUnderlyingAssets(address to) external onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        uint256 withdrawable = withdrawableUnderlyingAmount();
        if (withdrawable == 0) revert InsufficientUnderlyingBalance();

        _withdrawUnderlyingAsset(to, withdrawable);
    }

    /// @notice Allows redeeming bonds for underlying assets after maturity
    /// @dev Can be called multiple times until all bonds are redeemed
    /// @param amount The amount of bonds to redeem
    function redeem(uint256 amount) external onlyMatured {
        _redeem(_msgSender(), amount);
    }

    /// @notice Allows redeeming all available bonds for underlying assets after maturity
    /// @dev Can only be called after the bond has matured
    function redeemAll() external onlyMatured {
        uint256 redeemableAmount = balanceOf(_msgSender());
        if (redeemableAmount == 0) revert InvalidRedemptionAmount();

        _redeem(_msgSender(), redeemableAmount);
    }

    /// @notice Returns the amount of underlying assets held by the contract
    /// @return The balance of underlying assets
    function underlyingAssetBalance() public view returns (uint256) {
        return underlyingAsset.balanceOf(address(this));
    }

    /// @notice Returns the total amount of underlying assets needed for all potential redemptions
    /// @return The total amount of underlying assets needed
    function totalUnderlyingNeeded() public view returns (uint256) {
        return _calculateUnderlyingAmount(totalSupply());
    }

    /// @notice Returns the amount of underlying assets missing for all potential redemptions
    /// @return The amount of underlying assets missing (0 if there's enough or excess)
    function missingUnderlyingAmount() public view returns (uint256) {
        uint256 needed = totalUnderlyingNeeded();
        uint256 current = underlyingAssetBalance();
        return needed > current ? needed - current : 0;
    }

    /// @notice Returns the amount of excess underlying assets that can be withdrawn
    /// @return The amount of excess underlying assets
    function withdrawableUnderlyingAmount() public view returns (uint256) {
        uint256 needed = totalUnderlyingNeeded();
        uint256 current = underlyingAssetBalance();
        return current > needed ? current - needed : 0;
    }

    /// @notice Tops up the contract with exactly the amount needed for all redemptions
    /// @dev Will revert if no assets are missing or if the transfer fails
    function topUpMissingAmount() external {
        uint256 missing = missingUnderlyingAmount();
        if (missing == 0) revert InvalidAmount();

        bool success = underlyingAsset.transferFrom(_msgSender(), address(this), missing);
        if (!success) revert InsufficientUnderlyingBalance();

        emit UnderlyingAssetTopUp(_msgSender(), missing);
    }

    /// @notice Returns the ISIN (International Securities Identification Number) of the bond
    /// @return The ISIN of the bond
    function isin() public view returns (string memory) {
        return _isin;
    }

    /// @notice Returns the basis for yield calculation
    /// @dev For bonds, the yield basis is the face value
    /// @return The face value as the basis for yield calculations
    function yieldBasisPerUnit(address) public view override returns (uint256) {
        return faceValue;
    }

    /// @notice Returns the token used for yield payments
    /// @dev For bonds, this is the underlying asset
    /// @return The underlying asset token
    function yieldToken() public view override returns (IERC20) {
        return underlyingAsset;
    }

    /// @notice Checks if an address can manage yield on this token
    /// @dev Only addresses with SUPPLY_MANAGEMENT_ROLE can manage yield
    /// @param manager The address to check
    /// @return True if the address has SUPPLY_MANAGEMENT_ROLE
    function canManageYield(address manager) public view override returns (bool) {
        return hasRole(SUPPLY_MANAGEMENT_ROLE, manager);
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
        virtual
        override(ERC20, ERC20Pausable, ERC20Capped, ERC20Blocklist, ERC20Custodian)
    {
        if (isMatured && (to != address(0))) {
            revert BondAlreadyMatured();
        }

        super._update(from, to, value);
        _afterTokenTransfer(from, to, value);
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
        virtual
        override(ERC20, ERC20Blocklist)
    {
        super._approve(owner, spender, value, emitEvent);
    }

    /// @notice Internal function to handle withdrawing underlying assets
    /// @dev Ensures sufficient balance is maintained for redemptions if matured
    /// @param to The address to send the underlying assets to
    /// @param amount The amount of underlying assets to withdraw
    function _withdrawUnderlyingAsset(address to, uint256 amount) internal {
        if (amount == 0) revert InvalidAmount();

        if (isMatured) {
            uint256 needed = totalUnderlyingNeeded();
            uint256 currentBalance = underlyingAssetBalance();
            if (currentBalance - amount < needed) revert InsufficientUnderlyingBalance();
        }

        bool success = underlyingAsset.transfer(to, amount);
        if (!success) revert InsufficientUnderlyingBalance();

        emit UnderlyingAssetWithdrawn(to, amount);
    }

    /// @notice Internal function to handle redeeming bonds
    /// @dev Burns the redeemed bonds and transfers underlying assets
    /// @param holder The address redeeming the bonds
    /// @param amount The amount of bonds to redeem
    function _redeem(address holder, uint256 amount) internal {
        if (amount == 0) revert InvalidRedemptionAmount();

        uint256 currentBalance = balanceOf(holder);
        uint256 currentRedeemed = bondRedeemed[holder];
        uint256 redeemable = currentBalance - currentRedeemed;

        if (amount > redeemable) revert InsufficientRedeemableBalance();

        uint256 underlyingAmount = _calculateUnderlyingAmount(amount);

        uint256 contractBalance = underlyingAssetBalance();
        if (contractBalance < underlyingAmount) {
            revert InsufficientUnderlyingBalance();
        }

        bondRedeemed[holder] = currentRedeemed + amount;

        _burn(holder, amount);

        bool success = underlyingAsset.transfer(holder, underlyingAmount);
        if (!success) revert InsufficientUnderlyingBalance();

        emit BondRedeemed(holder, amount, underlyingAmount);
    }

    /// @notice Calculates the underlying asset amount for a given bond amount
    /// @dev Divides by decimals first to prevent overflow when multiplying large numbers
    /// @param bondAmount The amount of bonds to calculate for
    /// @return The amount of underlying assets
    function _calculateUnderlyingAmount(uint256 bondAmount) internal view returns (uint256) {
        return (bondAmount / (10 ** decimals())) * faceValue;
    }

    /// @notice Withdraws mistakenly sent tokens from the contract
    /// @dev Only callable by admin. Cannot withdraw underlying asset.
    /// @param token The token to withdraw
    /// @param to The recipient address
    /// @param amount The amount to withdraw
    function withdrawToken(address token, address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (token == address(0)) revert InvalidTokenAddress();
        if (to == address(0)) revert InvalidTokenAddress();
        if (token == address(underlyingAsset)) revert CannotWithdrawUnderlyingAsset();
        if (amount == 0) return;

        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) revert InsufficientTokenBalance();

        IERC20(token).safeTransfer(to, amount);
        emit TokenWithdrawn(token, to, amount);
    }
}
