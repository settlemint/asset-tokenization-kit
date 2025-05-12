// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// OpenZeppelin imports
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20, IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { ERC20Capped } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Constants
// import { SMARTConstants } from "./SMARTConstants.sol"; // Roles moved to manager

// Interface imports
import { SMARTComplianceModuleParamPair } from
    "smart-protocol/contracts/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IFixedYield } from "./interfaces/IFixedYield.sol";
import { ISMARTTokenAccessControlManager } from "./access-control/interfaces/ISMARTTokenAccessControlManager.sol";

// Core extensions
import { SMART } from "smart-protocol/contracts/extensions/core/SMART.sol"; // Base SMART logic + ERC20
import { SMARTHooks } from "smart-protocol/contracts/extensions/common/SMARTHooks.sol";
import { SMARTExtensionAccessControlAuthorization } from
    "smart-protocol/contracts/extensions/common/SMARTExtensionAccessControlAuthorization.sol";
// Feature extensions
import { SMARTPausable } from "smart-protocol/contracts/extensions/pausable/SMARTPausable.sol";
import { SMARTBurnable } from "smart-protocol/contracts/extensions/burnable/SMARTBurnable.sol";
import { SMARTCustodian } from "smart-protocol/contracts/extensions/custodian/SMARTCustodian.sol";
import { SMARTRedeemable } from "smart-protocol/contracts/extensions/redeemable/SMARTRedeemable.sol";
import { SMARTHistoricalBalances } from
    "smart-protocol/contracts/extensions/historical-balances/SMARTHistoricalBalances.sol";
import { ERC20Yield } from "./extensions/ERC20Yield.sol";

// Import the Managed contract
import { SMARTTokenAccessControlManaged } from "./access-control/SMARTTokenAccessControlManaged.sol";
import { SMARTAccessControlManagerAuthorization } from
    "./access-control/hooks/SMARTAccessControlManagerAuthorization.sol";
import { SMARTCustodianAccessControlManagerAuthorization } from
    "./access-control/hooks/SMARTCustodianAccessControlManagerAuthorization.sol";
import { SMARTPausableAccessControlManagerAuthorization } from
    "./access-control/hooks/SMARTPausableAccessControlManagerAuthorization.sol";
import { SMARTBurnableAccessControlManagerAuthorization } from
    "./access-control/hooks/SMARTBurnableAccessControlManagerAuthorization.sol";

/// @title SMARTBond (Managed Access Control)
/// @notice An implementation of a bond using the SMART extension framework,
///         delegating access control checks to a central manager.
/// @dev Combines core SMART features with extensions, inheriting `SMARTTokenAccessControlManaged`.
contract SMARTBond is
    SMARTTokenAccessControlManaged,
    SMART,
    SMARTCustodian,
    SMARTPausable,
    SMARTBurnable,
    SMARTRedeemable,
    SMARTHistoricalBalances,
    SMARTAccessControlManagerAuthorization,
    SMARTCustodianAccessControlManagerAuthorization,
    SMARTPausableAccessControlManagerAuthorization,
    SMARTBurnableAccessControlManagerAuthorization,
    ERC20Capped,
    ERC20Permit,
    ERC20Yield,
    ERC2771Context, // Keep for potential token-level meta-tx
    ReentrancyGuard
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
    mapping(address holder => uint256 redeemed) public bondRedeemed;

    /// @notice Emitted when the bond reaches maturity and is closed
    /// @param timestamp The block timestamp when the bond matured
    event BondMatured(uint256 timestamp);

    /// @notice Emitted when a bond is redeemed for underlying assets
    /// @param sender The address that initiated the redemption
    /// @param holder The address redeeming the bonds
    /// @param bondAmount The amount of bonds redeemed
    /// @param underlyingAmount The amount of underlying assets received
    event BondRedeemed(address indexed sender, address indexed holder, uint256 bondAmount, uint256 underlyingAmount);

    /// @notice Emitted when underlying assets are topped up
    /// @param sender The address that initiated the top up
    /// @param amount The amount of underlying assets added
    event UnderlyingAssetTopUp(address indexed sender, uint256 amount);

    /// @notice Emitted when underlying assets are withdrawn
    /// @param sender The address that initiated the withdrawal
    /// @param to The address receiving the underlying assets
    /// @param amount The amount of underlying assets withdrawn
    event UnderlyingAssetWithdrawn(address indexed sender, address indexed to, uint256 amount);

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

    /// @notice Deploys a new SMARTBond token contract with managed access control.
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
    /// @param forwarder Address of the forwarder contract for meta-transactions
    /// @param accessManager Address of the central SMARTTokenAccessControlManager contract
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
        address forwarder,
        address accessManager // New parameter
    )
        SMARTTokenAccessControlManaged(accessManager) // Initialize managed contract
        SMART(
            name_,
            symbol_,
            decimals_,
            address(0), // Bond agent (if any, set later)
            identityRegistry_,
            compliance_,
            requiredClaimTopics_,
            initialModulePairs_
        )
        ERC2771Context(forwarder) // Initialize ERC2771 context
        ERC20Capped(cap_)
        ERC20Permit(name_) // Pass name for EIP712 domain separator
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

    /// @notice Checks if an address can manage yield on this token by checking if they have the TOKEN_ADMIN_ROLE via
    /// the manager.
    /// @param manager The address to check.
    /// @return True if the address has the required role according to the manager, false otherwise.
    function canManageYield(address manager) public view override returns (bool) {
        // Delegate check to manager using the appropriate authorization function.
        // Assuming TOKEN_ADMIN_ROLE grants yield management rights.
        try _getManager().authorizeUpdateTokenSettings(manager) {
            return true; // If the call doesn't revert, the role is granted
        } catch {
            return false; // If the call reverts, the role is not granted
        }
    }

    // --- State-Changing Functions ---

    /// @notice Allows topping up the contract with underlying assets
    /// @dev Anyone can top up the contract with underlying assets
    /// @param amount The amount of underlying assets to top up
    function topUpUnderlyingAsset(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();

        bool success = underlyingAsset.transferFrom(_msgSender(), address(this), amount);
        if (!success) revert InsufficientUnderlyingBalance();

        emit UnderlyingAssetTopUp(_msgSender(), amount);
    }

    /// @notice Allows withdrawing excess underlying assets
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE
    /// @param to The address to send the underlying assets to
    /// @param amount The amount of underlying assets to withdraw
    function withdrawUnderlyingAsset(address to, uint256 amount) external nonReentrant {
        // Authorization check is now implicitly done by _authorizeForcedTransfer or similar hook if applicable
        // Or, if this is a specific admin action, add a dedicated auth check
        _getManager().authorizeRecoverERC20(_msgSender()); // Reuse recover logic role, or define a new one if needed
        _withdrawUnderlyingAsset(to, amount);
    }

    /// @notice Allows withdrawing all excess underlying assets
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE
    /// @param to The address to send the underlying assets to
    function withdrawExcessUnderlyingAssets(address to) external nonReentrant {
        // Similar authorization check needed
        _getManager().authorizeRecoverERC20(_msgSender()); // Reuse recover logic role, or define a new one if needed
        uint256 withdrawable = withdrawableUnderlyingAmount();
        if (withdrawable == 0) revert InsufficientUnderlyingBalance();
        _withdrawUnderlyingAsset(to, withdrawable);
    }

    /// @notice Tops up the contract with exactly the amount needed for all redemptions
    /// @dev Will revert if no assets are missing or if the transfer fails
    function topUpMissingAmount() external nonReentrant {
        uint256 missing = missingUnderlyingAmount();
        if (missing == 0) revert InvalidAmount();

        bool success = underlyingAsset.transferFrom(_msgSender(), address(this), missing);
        if (!success) revert InsufficientUnderlyingBalance();

        emit UnderlyingAssetTopUp(_msgSender(), missing);
    }

    /// @notice Closes off the bond at maturity
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE after maturity date
    /// @dev Requires sufficient underlying assets for all potential redemptions
    function mature() external {
        // Authorization check is now implicitly done by _authorizePause or similar hook if applicable
        // Or, if this is a specific admin action, add a dedicated auth check
        _getManager().authorizePause(_msgSender()); // Re-using PAUSER_ROLE seems odd, maybe TOKEN_ADMIN? Let's use
            // TOKEN_ADMIN
        // _getManager().authorizeUpdateTokenSettings(_msgSender()); // Alternative: use TOKEN_ADMIN

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

    // --- Other Hooks (Overrides for Chaining) ---
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

    function _beforeBurn(address from, uint256 amount) internal virtual override(SMARTCustodian, SMARTHooks) {
        super._beforeBurn(from, amount);
    }

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

    function _afterRedeem(address owner, uint256 amount) internal virtual override(SMARTRedeemable, SMARTHooks) {
        super._afterRedeem(owner, amount);
    }

    // --- Internal Functions (Overrides) ---
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

    /// @dev Resolves msgSender across Context and ERC2771Context.
    function _msgSender()
        internal
        view
        virtual
        override(Context, ERC2771Context, SMARTExtensionAccessControlAuthorization)
        returns (address)
    {
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

    /// @dev Overrides ERC165 to ensure that the SMART implementation is used.
    function supportsInterface(bytes4 interfaceId) public view virtual override(SMART) returns (bool) {
        // No longer inherits AccessControlEnumerable directly
        return super.supportsInterface(interfaceId);
    }
}
