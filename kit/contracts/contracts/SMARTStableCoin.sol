// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// OpenZeppelin imports
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20, IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
// Constants
import { SMARTConstants } from "./SMARTConstants.sol";

// Interface imports
import { ISMART } from "@smartprotocol/contracts/interface/ISMART.sol";
import { SMARTComplianceModuleParamPair } from
    "@smartprotocol/contracts/interface/structs/SMARTComplianceModuleParamPair.sol";
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

/// @title SMARTStableCoin
/// @notice An implementation of a stablecoin using the SMART extension framework,
///         backed by collateral and using custom roles.
/// @dev Combines core SMART features (compliance, verification) with extensions for pausing,
///      burning, custodian actions, and collateral tracking. Access control uses custom roles.
contract SMARTStableCoin is
    SMART,
    AccessControl,
    SMARTCollateral,
    SMARTCustodian,
    SMARTPausable,
    SMARTBurnable,
    ERC2771Context
{
    /// @notice Deploys a new SMARTStableCoin token contract.
    /// @dev Initializes SMART core, AccessControl, ERC20Collateral, and grants custom roles.
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
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address initialOwner_,
        address forwarder
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
        ERC2771Context(forwarder)
        SMARTCollateral(SMARTConstants.CLAIM_TOPIC_COLLATERAL)
    {
        // Grant standard admin role
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner_);

        // Grant custom operational roles
        _grantRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, initialOwner_); // Mint, Burn, Forced Transfer
        _grantRole(SMARTConstants.USER_MANAGEMENT_ROLE, initialOwner_); // Freeze, Recovery
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

    // --- Hooks (Overrides for Chaining) ---
    // These ensure that logic from multiple inherited extensions (SMART, SMARTCustodian, etc.) is called correctly.

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
    function _msgSender() internal view virtual override(Context, ERC2771Context, SMARTPausable) returns (address) {
        return super._msgSender();
    }

    /// @dev Resolves msgData across Context and ERC2771Context.
    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    /// @dev Hook defining the length of the trusted forwarder address suffix in `msg.data`.
    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }

    // --- Authorization Hook Implementations ---
    // Implementing the abstract functions from _SMART*AuthorizationHooks

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

    function _authorizeRecoverERC20() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) revert Unauthorized(sender);
    }
}
