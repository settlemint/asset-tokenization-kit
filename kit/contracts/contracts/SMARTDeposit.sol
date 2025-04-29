// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// OpenZeppelin imports
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20, IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Constants
import { SMARTConstants } from "./SMARTConstants.sol";

// Interface imports
import { ISMART } from "@smartprotocol/contracts/interface/ISMART.sol";

// Core extensions
import { SMART } from "@smartprotocol/contracts/extensions/core/SMART.sol"; // Base SMART logic + ERC20
import { SMARTExtension } from "@smartprotocol/contracts/extensions/common/SMARTExtension.sol";
import { SMARTHooks } from "@smartprotocol/contracts/extensions/common/SMARTHooks.sol";

// Feature extensions
import { SMARTPausable } from "@smartprotocol/contracts/extensions/pausable/SMARTPausable.sol";
import { SMARTBurnable } from "@smartprotocol/contracts/extensions/burnable/SMARTBurnable.sol";
import { SMARTCustodian } from "@smartprotocol/contracts/extensions/custodian/SMARTCustodian.sol";
import { SMARTCollateral } from "@smartprotocol/contracts/extensions/collateral/SMARTCollateral.sol";

// Common errors
import { Unauthorized } from "@smartprotocol/contracts/extensions/common/CommonErrors.sol";

/// @title SMARTDeposit
/// @notice A collateralized deposit token implemented using the SMART extension framework,
///         with advanced control features including collateral tracking, pausing, and custodian capabilities.
/// @dev Combines core SMART features with extensions for pausing, burning, custodian actions, and collateral tracking.
///      Access control is implemented using custom roles.
/// @custom:security-contact support@settlemint.com
contract SMARTDeposit is SMART, AccessControl, SMARTCollateral, SMARTCustodian, SMARTPausable, SMARTBurnable {
    using SafeERC20 for IERC20;

    /// @notice Role identifier for addresses that can audit the collateral
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    /// @notice Custom errors for the SMARTDeposit contract
    error InvalidDecimals(uint8 decimals);
    error InvalidLiveness();
    error InsufficientCollateral();
    error InvalidTokenAddress();
    error InsufficientTokenBalance();
    error InsufficientAllowance();

    /// @notice Structure to store collateral proof details
    struct CollateralProof {
        /// @notice The amount of collateral proven
        uint256 amount;
        /// @notice The timestamp when the proof was submitted
        uint48 timestamp;
    }

    /// @notice The current collateral proof details
    CollateralProof private _collateralProof;

    /// @notice The timestamp of the last collateral update
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

    /// @notice Deploys a new SMARTDeposit token contract.
    /// @dev Initializes SMART core, AccessControl, and SMARTCollateral extensions.
    /// @param name_ Token name
    /// @param symbol_ Token symbol
    /// @param decimals_ Token decimals
    /// @param onchainID_ Optional on-chain identifier address
    /// @param identityRegistry_ Address of the identity registry contract
    /// @param compliance_ Address of the compliance contract
    /// @param requiredClaimTopics_ Initial list of required claim topics
    /// @param initialModulePairs_ Initial list of compliance modules
    /// @param initialOwner_ Address receiving admin and operational roles
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address onchainID_,
        address identityRegistry_,
        address compliance_,
        uint256[] memory requiredClaimTopics_,
        ISMART.ComplianceModuleParamPair[] memory initialModulePairs_,
        address initialOwner_
    )
        // Initialize the core SMART logic (which includes ERC20)
        SMART(
            name_,
            symbol_,
            decimals_,
            onchainID_,
            identityRegistry_,
            compliance_,
            requiredClaimTopics_,
            initialModulePairs_
        )
        SMARTCollateral(SMARTConstants.CLAIM_TOPIC_COLLATERAL)
    {
        if (decimals_ > 18) revert InvalidDecimals(decimals_);

        _lastCollateralUpdate = block.timestamp;

        // Grant standard admin role
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner_);

        // Grant custom operational roles
        _grantRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, initialOwner_);
        _grantRole(SMARTConstants.USER_MANAGEMENT_ROLE, initialOwner_);
        _grantRole(AUDITOR_ROLE, initialOwner_);
    }

    // --- State-Changing Functions (Overrides) ---
    function transfer(address to, uint256 amount) public virtual override(SMART, ERC20, IERC20) returns (bool) {
        return super.transfer(to, amount);
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

    function hasRole(bytes32 role, address account) public view virtual override(AccessControl) returns (bool) {
        return AccessControl.hasRole(role, account);
    }

    /// @notice Returns current collateral amount and timestamp
    /// @dev Provides the same interface as ERC20Collateral
    /// @return amount Current proven collateral amount
    /// @return timestamp Timestamp when the collateral was last proven
    function collateral() public view virtual returns (uint256 amount, uint48 timestamp) {
        return (_collateralProof.amount, _collateralProof.timestamp);
    }

    /// @notice Returns the timestamp of the last collateral update
    /// @return The timestamp of the last collateral update
    function lastCollateralUpdate() public view returns (uint256) {
        return _lastCollateralUpdate;
    }

    /// @notice Updates the proven collateral amount with a timestamp
    /// @dev Only callable by addresses with AUDITOR_ROLE. Requires collateral >= total supply.
    /// @param amount New collateral amount
    function updateCollateral(uint256 amount) public {
        if (!hasRole(AUDITOR_ROLE, _msgSender())) revert Unauthorized(_msgSender());
        if (amount < totalSupply()) revert InsufficientCollateral();

        uint256 oldAmount = _collateralProof.amount;
        _collateralProof = CollateralProof({ amount: amount, timestamp: uint48(block.timestamp) });
        _lastCollateralUpdate = block.timestamp;

        emit CollateralUpdated(oldAmount, amount, block.timestamp);
    }

    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE. Requires sufficient collateral.
    /// @param to The address that will receive the minted tokens
    /// @param amount The quantity of tokens to create in base units
    function mint(address to, uint256 amount) public virtual {
        if (!hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, _msgSender())) revert Unauthorized(_msgSender());

        (uint256 collateralAmount,) = collateral();
        if (collateralAmount < totalSupply() + amount) revert InsufficientCollateral();

        _mint(to, amount);
    }

    /// @notice Withdraws mistakenly sent tokens from the contract
    /// @dev Only callable by addresses with DEFAULT_ADMIN_ROLE. Cannot withdraw this token.
    /// @param token The token to withdraw
    /// @param to The recipient address
    /// @param amount The amount to withdraw
    function withdrawToken(address token, address to, uint256 amount) external {
        if (!hasRole(DEFAULT_ADMIN_ROLE, _msgSender())) revert Unauthorized(_msgSender());
        if (token == address(0)) revert InvalidTokenAddress();
        if (to == address(0)) revert InvalidTokenAddress();
        if (amount == 0) return;

        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) revert InsufficientTokenBalance();

        IERC20(token).safeTransfer(to, amount);
        emit TokenWithdrawn(token, to, amount);
    }

    // --- Hooks (Overrides for Chaining) ---
    // These ensure that logic from multiple inherited extensions is called correctly.

    /// @inheritdoc SMARTHooks
    function _beforeMint(
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMART, SMARTCollateral, SMARTCustodian, SMARTHooks)
    {
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
        super._beforeTransfer(from, to, amount);
    }

    /// @inheritdoc SMARTHooks
    function _beforeBurn(address from, uint256 amount) internal virtual override(SMARTCustodian, SMARTHooks) {
        super._beforeBurn(from, amount);
    }

    /// @inheritdoc SMARTHooks
    function _beforeRedeem(address owner, uint256 amount) internal virtual override(SMARTCustodian, SMARTHooks) {
        super._beforeRedeem(owner, amount);
    }

    /// @inheritdoc SMARTHooks
    function _afterMint(address to, uint256 amount) internal virtual override(SMART, SMARTHooks) {
        super._afterMint(to, amount);
    }

    /// @inheritdoc SMARTHooks
    function _afterTransfer(address from, address to, uint256 amount) internal virtual override(SMART, SMARTHooks) {
        super._afterTransfer(from, to, amount);
    }

    /// @inheritdoc SMARTHooks
    function _afterBurn(address from, uint256 amount) internal virtual override(SMART, SMARTHooks) {
        super._afterBurn(from, amount);
    }

    // --- Internal Functions (Overrides) ---

    /**
     * @dev Overrides _update to ensure Pausable and Collateral checks are applied.
     */
    function _update(address from, address to, uint256 value) internal virtual override(SMART, SMARTPausable, ERC20) {
        // Calls chain: ERC20Collateral -> SMARTPausable -> SMART -> ERC20
        super._update(from, to, value);
    }

    /// @dev Resolves msgSender across Context and SMARTPausable.
    function _msgSender() internal view virtual override(Context, SMARTPausable) returns (address) {
        return super._msgSender();
    }

    // --- Authorization Hook Implementations ---
    // Implementing the abstract functions from SMART* authorization hooks

    function _authorizeUpdateTokenSettings() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) revert Unauthorized(sender);
    }

    function _authorizeUpdateComplianceSettings() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) revert Unauthorized(sender);
    }

    function _authorizeUpdateVerificationSettings() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) revert Unauthorized(sender);
    }

    function _authorizeMintToken() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, sender)) revert Unauthorized(sender);
    }

    function _authorizePause() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) revert Unauthorized(sender);
    }

    function _authorizeBurn() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) revert Unauthorized(sender);
    }

    function _authorizeFreezeAddress() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.USER_MANAGEMENT_ROLE, sender)) revert Unauthorized(sender);
    }

    function _authorizeFreezePartialTokens() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.USER_MANAGEMENT_ROLE, sender)) revert Unauthorized(sender);
    }

    function _authorizeForcedTransfer() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, sender)) revert Unauthorized(sender);
    }

    function _authorizeRecoveryAddress() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.USER_MANAGEMENT_ROLE, sender)) revert Unauthorized(sender);
    }
}
