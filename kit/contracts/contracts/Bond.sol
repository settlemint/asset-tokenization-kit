// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20Blocklist } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Blocklist.sol";
import { ERC20Custodian } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Custodian.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20Yield } from "./extensions/ERC20Yield.sol";

/// @title Bond - A standard bond token implementation with face value in underlying asset
/// @notice This contract implements an ERC20 token representing a standard bond with fixed-income characteristics and
/// face value in an underlying ERC20 asset
/// @dev Inherits from multiple OpenZeppelin contracts and implements bond-specific features
/// @custom:security-contact support@settlemint.com
contract Bond is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    AccessControl,
    ERC20Permit,
    ERC20Blocklist,
    ERC20Custodian,
    ERC20Yield
{
    /// @notice Custom errors for the Bond contract
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

    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");
    bytes32 public constant USER_MANAGEMENT_ROLE = keccak256("USER_MANAGEMENT_ROLE");
    bytes32 public constant FINANCIAL_MANAGEMENT_ROLE = keccak256("FINANCIAL_MANAGEMENT_ROLE");
    bytes32 public constant FINANCE_MANAGER_ROLE = keccak256("FINANCE_MANAGER_ROLE");

    /// @notice Timestamp when the bond matures
    uint256 public immutable maturityDate;

    /// @notice The number of decimals used for token amounts
    uint8 private immutable _decimals;

    /// @notice The face value of the bond in underlying asset base units
    uint256 public immutable faceValue;

    /// @notice The underlying asset contract used for face value denomination
    IERC20 public immutable underlyingAsset;

    /// @notice Tracks whether the bond has matured
    bool public isMatured;

    /// @notice Tracks how many bonds each holder has redeemed
    mapping(address => uint256) public bondRedeemed;

    /// @notice Event emitted when the bond reaches maturity and is closed
    event BondMatured(uint256 timestamp);

    /// @notice Event emitted when underlying assets are topped up
    event UnderlyingAssetTopUp(address indexed from, uint256 amount);

    /// @notice Event emitted when a bond is redeemed for underlying assets
    event BondRedeemed(address indexed holder, uint256 bondAmount, uint256 underlyingAmount);

    /// @notice Event emitted when underlying assets are withdrawn
    event UnderlyingAssetWithdrawn(address indexed to, uint256 amount);

    /// @notice The ISIN (International Securities Identification Number) of the bond
    string private _isin;

    /// @notice The authorized factory that can set yield schedules
    address private _yieldFactory;

    /// @notice The yield schedule for this bond
    address public yieldSchedule;

    /// @notice Modifier to prevent transfers after maturity
    modifier notMatured() {
        if (isMatured) revert BondAlreadyMatured();
        _;
    }

    /// @notice Modifier to ensure the bond has matured
    modifier onlyMatured() {
        if (!isMatured) revert BondNotYetMatured();
        _;
    }

    /// @notice Deploys a new Bond token contract
    /// @param name The token name
    /// @param symbol The token symbol
    /// @param decimals_ The number of decimals for the token
    /// @param initialOwner The address that will receive admin rights
    /// @param isin_ The ISIN (International Securities Identification Number) of the bond
    /// @param _maturityDate Timestamp when the bond matures
    /// @param _faceValue The face value of the bond in underlying asset base units
    /// @param _underlyingAsset The address of the underlying asset contract used for face value denomination
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        address initialOwner,
        string memory isin_,
        uint256 _maturityDate,
        uint256 _faceValue,
        address _underlyingAsset
    )
        ERC20(name, symbol)
        ERC20Permit(name)
    {
        if (_maturityDate <= block.timestamp) revert BondInvalidMaturityDate();
        if (decimals_ > 18) revert InvalidDecimals(decimals_);
        if (_faceValue == 0) revert InvalidFaceValue();
        if (_underlyingAsset == address(0)) revert InvalidUnderlyingAsset();
        if (bytes(isin_).length != 12) revert InvalidISIN();

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
        _grantRole(FINANCIAL_MANAGEMENT_ROLE, initialOwner);
    }

    /// @notice Returns the number of decimals used to get its user representation
    /// @dev Override the default ERC20 decimals function to use the configurable value
    /// @return The number of decimals
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /// @notice Pauses all token transfers
    /// @dev Only callable by the admin. Emits a Paused event
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses token transfers
    /// @dev Only callable by the admin. Emits an Unpaused event
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE role. Emits a Transfer event
    /// @param to The address that will receive the minted tokens
    /// @param amount The quantity of tokens to create in base units
    function mint(address to, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        _mint(to, amount);
    }

    /// @notice Checks if an address is a custodian
    /// @dev Internal function that considers only addresses with admin role as custodians
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

    /// @notice Closes off the bond at maturity
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE role after maturity date
    function mature() external onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        if (block.timestamp < maturityDate) revert BondNotYetMatured();
        if (isMatured) revert BondAlreadyMatured();

        // Check if there are enough underlying assets for all potential redemptions
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

        // Transfer the underlying assets from the sender to this contract
        bool success = underlyingAsset.transferFrom(msg.sender, address(this), amount);
        if (!success) revert InsufficientUnderlyingBalance();

        emit UnderlyingAssetTopUp(msg.sender, amount);
    }

    /// @notice Allows withdrawing excess underlying assets
    /// @dev Only callable by addresses with FINANCIAL_MANAGEMENT_ROLE
    /// @param to The address to send the underlying assets to
    /// @param amount The amount of underlying assets to withdraw
    function withdrawUnderlyingAsset(address to, uint256 amount) external onlyRole(FINANCIAL_MANAGEMENT_ROLE) {
        _withdrawUnderlyingAsset(to, amount);
    }

    /// @notice Allows withdrawing excess underlying assets
    /// @dev Only callable by addresses with FINANCIAL_MANAGEMENT_ROLE
    /// @param to The address to send the underlying assets to
    function withdrawExcessUnderlyingAssets(address to) external onlyRole(FINANCIAL_MANAGEMENT_ROLE) {
        uint256 withdrawable = withdrawableUnderlyingAmount();
        if (withdrawable == 0) revert InsufficientUnderlyingBalance();

        _withdrawUnderlyingAsset(to, withdrawable);
    }

    /// @notice Allows redeeming bonds for underlying assets after maturity
    /// @dev Can be called multiple times until all bonds are redeemed
    /// @param amount The amount of bonds to redeem
    function redeem(uint256 amount) external onlyMatured {
        _redeem(msg.sender, amount);
    }

    /// @notice Allows redeeming all available bonds for underlying assets after maturity
    /// @dev Can only be called after the bond has matured
    function redeemAll() external onlyMatured {
        uint256 redeemableAmount = balanceOf(msg.sender); // already redeemed amount is burned
        if (redeemableAmount == 0) revert InvalidRedemptionAmount();

        _redeem(msg.sender, redeemableAmount);
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

        bool success = underlyingAsset.transferFrom(msg.sender, address(this), missing);
        if (!success) revert InsufficientUnderlyingBalance();

        emit UnderlyingAssetTopUp(msg.sender, missing);
    }

    /// @notice Returns the ISIN (International Securities Identification Number) of the bond
    /// @return The ISIN of the bond
    function isin() public view returns (string memory) {
        return _isin;
    }

    /// @notice Sets the yield schedule for this bond
    /// @dev Can only be called by an address with FINANCIAL_MANAGEMENT_ROLE
    /// @param schedule The address of the yield schedule contract
    function setYieldSchedule(address schedule) public override onlyRole(FINANCIAL_MANAGEMENT_ROLE) {
        super.setYieldSchedule(schedule);
    }

    /// @notice Returns the basis for yield calculation
    /// @dev For bonds, the yield basis is the face value
    /// @param holder The address to get the yield basis for (unused in bonds)
    /// @return The face value as the basis for yield calculations
    function yieldBasis(address holder) public view override returns (uint256) {
        return faceValue;
    }

    /// @notice Returns the token used for yield payments
    /// @dev For bonds, this is the underlying asset
    /// @return The underlying asset token
    function yieldToken() public view override returns (IERC20) {
        return underlyingAsset;
    }

    /// @notice Checks if an address can manage yield on this token
    /// @dev Only addresses with FINANCIAL_MANAGEMENT_ROLE can manage yield
    /// @param manager The address to check
    /// @return True if the address has FINANCIAL_MANAGEMENT_ROLE
    function canManageYield(address manager) public view override returns (bool) {
        return hasRole(FINANCIAL_MANAGEMENT_ROLE, manager);
    }

    // Internal functions

    /// @notice Calculates the underlying asset amount for a given bond amount
    /// @param bondAmount The amount of bonds to calculate for
    /// @return The amount of underlying assets
    function _calculateUnderlyingAmount(uint256 bondAmount) internal view returns (uint256) {
        // Divide by decimals first to prevent overflow when multiplying large numbers
        // Note: This may lose some precision but prevents overflow
        return (bondAmount / (10 ** decimals())) * faceValue;
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
    {
        // Allow burning during redemption (when to is address(0) and bond is matured)
        if (to == address(0) && isMatured) {
            super._update(from, to, value);
        } else {
            if (isMatured) revert BondAlreadyMatured();
            super._update(from, to, value);
        }
    }

    /// @notice Internal function to handle withdrawing underlying assets
    /// @param to The address to send the underlying assets to
    /// @param amount The amount of underlying assets to withdraw
    function _withdrawUnderlyingAsset(address to, uint256 amount) internal {
        if (amount == 0) revert InvalidAmount();

        // If matured, ensure we maintain enough assets for remaining redemptions
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
    /// @param holder The address redeeming the bonds
    /// @param amount The amount of bonds to redeem
    function _redeem(address holder, uint256 amount) internal {
        if (amount == 0) revert InvalidRedemptionAmount();

        // Cache state reads
        uint256 currentBalance = balanceOf(holder);
        uint256 currentRedeemed = bondRedeemed[holder];
        uint256 redeemable = currentBalance - currentRedeemed;

        if (amount > redeemable) revert InsufficientRedeemableBalance();

        // Calculate the amount of underlying assets to transfer
        uint256 underlyingAmount = _calculateUnderlyingAmount(amount);

        // Check if the contract has enough underlying assets
        uint256 contractBalance = underlyingAssetBalance();
        if (contractBalance < underlyingAmount) {
            revert InsufficientUnderlyingBalance();
        }

        // Update redemption tracking before transfers to prevent reentrancy
        bondRedeemed[holder] = currentRedeemed + amount;

        // Burn the bonds
        _burn(holder, amount);

        // Transfer the underlying assets
        bool success = underlyingAsset.transfer(holder, underlyingAmount);
        if (!success) revert InsufficientUnderlyingBalance();

        emit BondRedeemed(holder, amount, underlyingAmount);
    }
}
