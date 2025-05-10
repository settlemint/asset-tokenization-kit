// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { Nonces } from "@openzeppelin/contracts/utils/Nonces.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { IERC20, IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

// Constants
import { SMARTConstants } from "./SMARTConstants.sol";

// Interface imports
import { ISMART } from "smart-protocol/contracts/interface/ISMART.sol";
import { SMARTComplianceModuleParamPair } from
    "smart-protocol/contracts/interface/structs/SMARTComplianceModuleParamPair.sol";

// Core extensions
import { SMART } from "smart-protocol/contracts/extensions/core/SMART.sol"; // Base SMART logic + ERC20
import { SMARTHooks } from "smart-protocol/contracts/extensions/common/SMARTHooks.sol";

// Feature extensions
import { SMARTPausable } from "smart-protocol/contracts/extensions/pausable/SMARTPausable.sol";
import { SMARTBurnable } from "smart-protocol/contracts/extensions/burnable/SMARTBurnable.sol";
import { SMARTCustodian } from "smart-protocol/contracts/extensions/custodian/SMARTCustodian.sol";

/// @title SMARTFund - A security token representing fund shares with management fees
/// @notice This contract implements a security token that represents fund shares with voting rights,
/// blocklist, custodian features, and management fee collection. It supports different fund classes
/// and categories, and includes governance capabilities through the ERC20Votes extension.
/// @dev Inherits from multiple OpenZeppelin contracts to provide comprehensive security token functionality
/// with governance capabilities, meta-transactions support, and role-based access control.
/// @custom:security-contact support@settlemint.com
contract SMARTFund is
    SMART,
    SMARTBurnable,
    SMARTPausable,
    SMARTCustodian,
    AccessControl,
    ERC20Permit,
    ERC20Votes, // TODO: ??
    ERC2771Context
{
    using Math for uint256;
    using SafeERC20 for IERC20;

    /// @notice Custom errors for the SMARTFund contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error InvalidTokenAddress();
    error InsufficientTokenBalance();

    /// @notice The timestamp of the last fee collection
    /// @dev Used to calculate time-based management fees
    uint40 private _lastFeeCollection;

    /// @notice The management fee in basis points (1 basis point = 0.01%)
    /// @dev Set at deployment and cannot be changed
    uint16 private immutable _managementFeeBps;

    /// @notice The class of the fund (e.g., "Hedge SMARTFund", "Mutual SMARTFund")
    /// @dev Set at deployment and cannot be changed
    string private _fundClass;

    /// @notice The category of the fund (e.g., "Long/Short Equity", "Global Macro")
    /// @dev Set at deployment and cannot be changed
    string private _fundCategory;

    /// @notice Emitted when management fees are collected
    /// @param initiator The address that collected the management fees
    /// @param amount The amount of tokens minted as management fees
    /// @param timestamp The timestamp when the fees were collected
    event ManagementFeeCollected(address indexed initiator, uint256 amount, uint256 timestamp);

    /// @notice Deploys a new SMARTFund token contract
    /// @dev Sets up the token with specified parameters and initializes governance capabilities.
    /// The deployer receives DEFAULT_ADMIN_ROLE, SUPPLY_MANAGEMENT_ROLE, and USER_MANAGEMENT_ROLE.
    /// @param name_ The token name
    /// @param symbol_ The token symbol
    /// @param decimals_ The number of decimals for the token (must be <= 18)
    /// @param managementFeeBps_ The management fee in basis points (1 basis point = 0.01%)
    /// @param fundClass_ The class of the fund (e.g., "Hedge SMARTFund", "Mutual SMARTFund")
    /// @param fundCategory_ The category of the fund (e.g., "Long/Short Equity", "Global Macro")
    /// @param requiredClaimTopics_ Initial list of required claim topics
    /// @param initialModulePairs_ Initial list of compliance modules
    /// @param identityRegistry_ Address of the identity registry contract
    /// @param compliance_ Address of the compliance contract
    /// @param forwarder Address of the forwarder contract
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint16 managementFeeBps_,
        string memory fundClass_,
        string memory fundCategory_,
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
        ERC20Permit(name_)
        ERC2771Context(forwarder)
    {
        _managementFeeBps = managementFeeBps_;
        _fundClass = fundClass_;
        _fundCategory = fundCategory_;
        _lastFeeCollection = uint40(block.timestamp);

        // Grant standard admin role
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());

        // Grant custom operational roles
        _grantRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, _msgSender()); // Mint, Burn, Forced Transfer
        _grantRole(SMARTConstants.USER_MANAGEMENT_ROLE, _msgSender()); // Freeze, Recovery
    }

    // --- View Functions ---

    /// @notice Returns the fund class
    /// @dev The fund class is immutable after construction
    /// @return The fund class as a string (e.g., "Hedge SMARTFund", "Mutual SMARTFund")
    function fundClass() external view returns (string memory) {
        return _fundClass;
    }

    /// @notice Returns the fund category
    /// @dev The fund category is immutable after construction
    /// @return The fund category as a string (e.g., "Long/Short Equity", "Global Macro")
    function fundCategory() external view returns (string memory) {
        return _fundCategory;
    }

    /// @notice Returns the management fee in basis points
    /// @dev One basis point equals 0.01%
    /// @return The management fee in basis points
    function managementFeeBps() external view returns (uint16) {
        return _managementFeeBps;
    }

    /// @notice Returns the current timestamp for voting snapshots
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

    // --- State-Changing Functions ---
    /// @notice Collects management fee based on time elapsed and assets under management
    /// @dev Only callable by addresses with DEFAULT_ADMIN_ROLE. Fee is calculated as:
    /// (AUM * fee_rate * time_elapsed) / (100% * 1 year)
    /// @return The amount of tokens minted as management fee
    function collectManagementFee() public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        uint256 timeElapsed = block.timestamp - _lastFeeCollection;
        uint256 aum = totalSupply();

        uint256 fee = Math.mulDiv(Math.mulDiv(aum, _managementFeeBps, 10_000), timeElapsed, 365 days);

        if (fee > 0) {
            address initiator = _msgSender();
            _mint(initiator, fee);
            emit ManagementFeeCollected(initiator, fee, block.timestamp);
        }

        _lastFeeCollection = uint40(block.timestamp);
        return fee;
    }

    // --- State-Changing Functions (Overrides) ---
    function transfer(address to, uint256 amount) public virtual override(SMART, ERC20, IERC20) returns (bool) {
        return super.transfer(to, amount);
    }

    // --- Hooks (Overrides for Chaining) ---
    // These ensure that logic from multiple inherited extensions (SMART, SMARTCustodian, etc.) is called correctly.

    /// @inheritdoc SMARTHooks
    function _beforeMint(address to, uint256 amount) internal virtual override(SMART, SMARTCustodian, SMARTHooks) {
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
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        virtual
        override(SMARTPausable, SMART, ERC20Votes, ERC20)
    {
        // Calls chain: SMARTPausable -> SMART -> ERC20Votes -> ERC20
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

    /// @dev Overrides ERC165 to ensure that the SMART implementation is used.
    function supportsInterface(bytes4 interfaceId) public view virtual override(SMART, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
