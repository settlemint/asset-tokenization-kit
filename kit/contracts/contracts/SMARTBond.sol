// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20, IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { ERC20Capped } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

// Constants
import { SMARTConstants } from "./SMARTConstants.sol";

// Interface imports
import { SMARTComplianceModuleParamPair } from
    "smart-protocol/contracts/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IFixedYield } from "./interfaces/IFixedYield.sol";

// Core extensions
import { SMART } from "smart-protocol/contracts/extensions/core/SMART.sol"; // Base SMART logic + ERC20
import { SMARTHooks } from "smart-protocol/contracts/extensions/common/SMARTHooks.sol";

// Feature extensions
import { SMARTPausable } from "smart-protocol/contracts/extensions/pausable/SMARTPausable.sol";
import { SMARTBurnable } from "smart-protocol/contracts/extensions/burnable/SMARTBurnable.sol";
import { SMARTCustodian } from "smart-protocol/contracts/extensions/custodian/SMARTCustodian.sol";
import { SMARTRedeemable } from "smart-protocol/contracts/extensions/redeemable/SMARTRedeemable.sol";
import { SMARTHistoricalBalances } from
    "smart-protocol/contracts/extensions/historical-balances/SMARTHistoricalBalances.sol";
import { ERC20Yield } from "./extensions/ERC20Yield.sol";

/// @title SMARTBond
/// @notice An implementation of a bond using the SMART extension framework,
///         backed by collateral and using custom roles.
/// @dev Combines core SMART features (compliance, verification) with extensions for pausing,
///      burning, custodian actions, and collateral tracking. Access control uses custom roles.
contract SMARTBond is
    SMART,
    AccessControl,
    SMARTCustodian,
    SMARTPausable,
    SMARTBurnable,
    SMARTRedeemable,
    SMARTHistoricalBalances,
    ERC20Capped,
    ERC20Permit,
    ERC20Yield,
    ERC2771Context
{
    // --- Custom Errors ---
    error BondAlreadyMatured();
    error BondNotYetMatured();
    error BondInvalidMaturityDate();
    error InvalidUnderlyingAsset();
    error InvalidFaceValue();
    error InsufficientUnderlyingBalance();
    error InvalidRedemptionAmount();
    error InsufficientRedeemableBalance();
    error YieldScheduleActive();
    error InvalidAmount();

    /// @notice Timestamp when the bond matures
    /// @dev Set at deployment and cannot be changed
    uint256 public immutable maturityDate;

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

    /// @notice Emitted when the bond reaches maturity and is closed
    /// @param timestamp The block timestamp when the bond matured
    event BondMatured(uint256 timestamp);

    /// @notice Emitted when a bond is redeemed for underlying assets
    /// @param initiator The address that initiated the redemption
    /// @param holder The address redeeming the bonds
    /// @param bondAmount The amount of bonds redeemed
    /// @param underlyingAmount The amount of underlying assets received
    event BondRedeemed(address indexed initiator, address indexed holder, uint256 bondAmount, uint256 underlyingAmount);

    /// @notice Emitted when underlying assets are topped up
    /// @param initiator The address that initiated the top up
    /// @param amount The amount of underlying assets added
    event UnderlyingAssetTopUp(address indexed initiator, uint256 amount);

    /// @notice Emitted when underlying assets are withdrawn
    /// @param initiator The address that initiated the withdrawal
    /// @param to The address receiving the underlying assets
    /// @param amount The amount of underlying assets withdrawn
    event UnderlyingAssetWithdrawn(address indexed initiator, address indexed to, uint256 amount);

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

    /// @notice Deploys a new SMARTBond token contract.
    /// @dev Initializes SMART core, AccessControl, ERC20Collateral, and grants custom roles.
    /// @param name_ Token name
    /// @param symbol_ Token symbol
    /// @param decimals_ Token decimals
    /// @param cap_ Token cap
    /// @param maturityDate_ Bond maturity date
    /// @param faceValue_ Bond face value
    /// @param underlyingAsset_ Underlying asset contract address
    /// @param requiredClaimTopics_ Initial list of required claim topics
    /// @param initialModulePairs_ Initial list of compliance modules
    /// @param identityRegistry_ Address of the identity registry contract
    /// @param compliance_ Address of the compliance contract
    /// @param forwarder Address of the forwarder contract
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 cap_,
        uint256 maturityDate_,
        uint256 faceValue_,
        address underlyingAsset_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address forwarder
    )
        // Initialize the core SMART logic (which includes ERC20)
        SMART(
            name_,
            symbol_,
            decimals_,
            address(0),
            identityRegistry_,
            compliance_,
            requiredClaimTopics_,
            initialModulePairs_
        )
        ERC2771Context(forwarder)
        ERC20Capped(cap_)
        ERC20Permit(name_)
    {
        if (maturityDate_ <= block.timestamp) revert BondInvalidMaturityDate();
        if (faceValue_ == 0) revert InvalidFaceValue();
        if (underlyingAsset_ == address(0)) revert InvalidUnderlyingAsset();

        // Verify the underlying asset contract exists by attempting to call a view function
        try IERC20(underlyingAsset_).totalSupply() returns (uint256) {
            // Contract exists and implements IERC20
        } catch {
            revert InvalidUnderlyingAsset();
        }

        maturityDate = maturityDate_;
        faceValue = faceValue_;
        underlyingAsset = IERC20(underlyingAsset_);

        // Grant standard admin role
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());

        // Grant custom operational roles
        _grantRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, _msgSender()); // Mint, Burn, Forced Transfer
        _grantRole(SMARTConstants.USER_MANAGEMENT_ROLE, _msgSender()); // Freeze, Recovery
    }

    // --- View Functions ---

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

    // --- View Functions (Overrides) ---
    function name() public view virtual override(SMART, ERC20, IERC20Metadata) returns (string memory) {
        return super.name();
    }

    function symbol() public view virtual override(SMART, ERC20, IERC20Metadata) returns (string memory) {
        return super.symbol();
    }

    function decimals() public view virtual override(SMART, ERC20, IERC20Metadata) returns (uint8) {
        return super.decimals();
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
        return hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, manager);
    }

    // --- State-Changing Functions ---

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
    function withdrawUnderlyingAsset(
        address to,
        uint256 amount
    )
        external
        onlyRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE)
    {
        _withdrawUnderlyingAsset(to, amount);
    }

    /// @notice Allows withdrawing all excess underlying assets
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE
    /// @param to The address to send the underlying assets to
    function withdrawExcessUnderlyingAssets(address to) external onlyRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE) {
        uint256 withdrawable = withdrawableUnderlyingAmount();
        if (withdrawable == 0) revert InsufficientUnderlyingBalance();

        _withdrawUnderlyingAsset(to, withdrawable);
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

    /// @notice Closes off the bond at maturity
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE after maturity date
    /// @dev Requires sufficient underlying assets for all potential redemptions
    function mature() external onlyRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE) {
        if (block.timestamp < maturityDate) revert BondNotYetMatured();
        if (isMatured) revert BondAlreadyMatured();

        uint256 needed = totalUnderlyingNeeded();
        if (underlyingAssetBalance() < needed) revert InsufficientUnderlyingBalance();

        isMatured = true;
        emit BondMatured(block.timestamp);
    }

    // --- State-Changing Functions (Overrides) ---
    function transfer(address to, uint256 amount) public virtual override(SMART, ERC20, IERC20) returns (bool) {
        return super.transfer(to, amount);
    }

    // --- Internal Functions ---
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

        emit UnderlyingAssetWithdrawn(_msgSender(), to, amount);
    }

    /// @notice Calculates the underlying asset amount for a given bond amount
    /// @dev Divides by decimals first to prevent overflow when multiplying large numbers
    /// @param bondAmount The amount of bonds to calculate for
    /// @return The amount of underlying assets
    function _calculateUnderlyingAmount(uint256 bondAmount) internal view returns (uint256) {
        return (bondAmount / (10 ** decimals())) * faceValue;
    }

    // --- Hooks (Overrides for Chaining) ---
    // These ensure that logic from multiple inherited extensions (SMART, SMARTCustodian, etc.) is called correctly.

    /// @inheritdoc SMARTHooks
    function _beforeMint(address to, uint256 amount) internal virtual override(SMART, SMARTCustodian, SMARTHooks) {
        if (yieldSchedule != address(0)) {
            // Use the interface to call the external contract
            // Revert if the yield schedule has already started
            if (IFixedYield(yieldSchedule).startDate() <= block.timestamp) {
                revert YieldScheduleActive();
            }
        }

        super._beforeMint(to, amount);
    }

    /// @inheritdoc SMARTHooks
    function _beforeTransfer(
        address from,
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMART, SMARTCustodian, SMARTHooks)
    {
        if (isMatured && (to != address(0))) {
            revert BondAlreadyMatured();
        }

        super._beforeTransfer(from, to, amount);
    }

    /// @inheritdoc SMARTHooks
    function _beforeBurn(address from, uint256 amount) internal virtual override(SMARTCustodian, SMARTHooks) {
        super._beforeBurn(from, amount);
    }

    /// @inheritdoc SMARTHooks
    function _beforeRedeem(
        address owner,
        uint256 amount
    )
        internal
        virtual
        override(SMARTCustodian, SMARTRedeemable, SMARTHooks)
    {
        if (!isMatured) revert BondNotYetMatured();
        if (amount == 0) revert InvalidRedemptionAmount();

        super._beforeRedeem(owner, amount);
    }

    /// @inheritdoc SMARTHooks
    function _afterMint(
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMART, SMARTHistoricalBalances, SMARTHooks)
    {
        super._afterMint(to, amount);
    }

    /// @inheritdoc SMARTHooks
    function _afterTransfer(
        address from,
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMART, SMARTHistoricalBalances, SMARTHooks)
    {
        super._afterTransfer(from, to, amount);
    }

    /// @inheritdoc SMARTHooks
    function _afterBurn(
        address from,
        uint256 amount
    )
        internal
        virtual
        override(SMART, SMARTHistoricalBalances, SMARTHooks)
    {
        super._afterBurn(from, amount);
    }

    /// @inheritdoc SMARTHooks
    function _afterRedeem(address owner, uint256 amount) internal virtual override(SMARTRedeemable, SMARTHooks) {
        super._afterRedeem(owner, amount);
    }

    // --- Internal Functions (Overrides) ---

    /// @notice Implementation of the abstract burn execution using the base ERC20Upgradeable `_burn` function.
    /// @dev Assumes the inheriting contract includes an ERC20Upgradeable implementation with an internal `_burn`
    /// function.
    function _redeem(address from, uint256 amount) internal virtual override {
        uint256 currentBalance = balanceOf(from);
        uint256 currentRedeemed = bondRedeemed[from];
        uint256 redeemable = currentBalance - currentRedeemed;

        if (amount > redeemable) revert InsufficientRedeemableBalance();

        uint256 underlyingAmount = _calculateUnderlyingAmount(amount);

        uint256 contractBalance = underlyingAssetBalance();
        if (contractBalance < underlyingAmount) {
            revert InsufficientUnderlyingBalance();
        }

        bondRedeemed[from] = currentRedeemed + amount;

        _burn(from, amount);

        bool success = underlyingAsset.transfer(from, underlyingAmount);
        if (!success) revert InsufficientUnderlyingBalance();

        emit BondRedeemed(_msgSender(), from, amount, underlyingAmount);
    }

    /**
     * @dev Overrides _update to ensure Pausable and Collateral checks are applied.
     */
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        virtual
        override(SMARTPausable, ERC20Capped, SMART, ERC20)
    {
        // Calls chain: SMARTPausable -> ERC20Capped -> SMART -> ERC20
        super._update(from, to, value);
    }

    /// @dev Resolves msgSender across Context and SMARTPausable.
    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    /// @dev Resolves msgData across Context and ERC2771Context.
    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    /// @dev Hook defining the length of the trusted forwarder address suffix in `msg.data`.
    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }

    // --- Authorization Hook Implementations ---
    // Implementing the abstract functions from _SMART*AuthorizationHooks

    function _authorizeUpdateTokenSettings() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, DEFAULT_ADMIN_ROLE);
        }
    }

    function _authorizeUpdateComplianceSettings() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, DEFAULT_ADMIN_ROLE);
        }
    }

    function _authorizeUpdateVerificationSettings() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, DEFAULT_ADMIN_ROLE);
        }
    }

    function _authorizeMintToken() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, SMARTConstants.SUPPLY_MANAGEMENT_ROLE);
        }
    }

    function _authorizePause() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, DEFAULT_ADMIN_ROLE);
        }
    }

    function _authorizeBurn() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, DEFAULT_ADMIN_ROLE);
        }
    }

    function _authorizeFreezeAddress() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.USER_MANAGEMENT_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, SMARTConstants.USER_MANAGEMENT_ROLE);
        }
    }

    function _authorizeFreezePartialTokens() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.USER_MANAGEMENT_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, SMARTConstants.USER_MANAGEMENT_ROLE);
        }
    }

    function _authorizeForcedTransfer() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, SMARTConstants.SUPPLY_MANAGEMENT_ROLE);
        }
    }

    function _authorizeRecoveryAddress() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.USER_MANAGEMENT_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, SMARTConstants.USER_MANAGEMENT_ROLE);
        }
    }

    function _authorizeRecoverERC20() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, DEFAULT_ADMIN_ROLE);
        }
    }
}
