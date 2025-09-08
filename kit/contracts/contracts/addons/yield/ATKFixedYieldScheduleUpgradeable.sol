// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTFixedYieldScheduleUpgradeable } from
    "../../smart/extensions/yield/schedules/fixed/SMARTFixedYieldScheduleUpgradeable.sol";
import { SMARTFixedYieldScheduleLogic } from
    "../../smart/extensions/yield/schedules/fixed/internal/SMARTFixedYieldScheduleLogic.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";

import { IContractWithIdentity } from "../../system/identity-factory/IContractWithIdentity.sol";
import { ISMARTFixedYieldSchedule } from "../../smart/extensions/yield/schedules/fixed/ISMARTFixedYieldSchedule.sol";
import { ISMARTTokenAccessManaged } from "../../smart/extensions/access-managed/ISMARTTokenAccessManaged.sol";
import { ISMARTTokenAccessManager } from "../../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ATKAssetRoles } from "../../assets/ATKAssetRoles.sol";

/// @title ATKFixedYieldScheduleUpgradeable
/// @author SettleMint
/// @notice Upgradeable implementation of a fixed yield schedule for SMART tokens
/// @dev This contract implements a fixed yield schedule that can be used to distribute
/// yield to token holders at fixed intervals. It includes access control, pausability,
/// reentrancy protection, and meta-transaction support.
contract ATKFixedYieldScheduleUpgradeable is
    SMARTFixedYieldScheduleUpgradeable,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    IContractWithIdentity
{
    /// @notice Role for managing onchain ID operations
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    /// @notice The address of the ONCHAINID associated with this contract
    address private _onchainID;

    /// @notice Error thrown when trying to set an invalid onchain ID
    error InvalidOnchainID();

    /// @notice Error thrown when no initial admins are provided
    error NoInitialAdmins();

    /// @dev Modifier to check if the sender has a specific role on the connected asset (token)
    /// @param role The asset role to check for
    modifier onlyAssetRole(bytes32 role) {
        _checkAssetRole(role, _msgSender());
        _;
    }

    /// @notice Internal function to check if an account has a specific role on the connected asset (token)
    /// @dev This function performs the actual call to the token's access manager and reverts if the account doesn't
    /// have the role
    /// @param role The asset role identifier to check for
    /// @param account The address of the account to verify
    function _checkAssetRole(bytes32 role, address account) internal view {
        ISMARTTokenAccessManaged tokenAccessManaged = ISMARTTokenAccessManaged(address(this.token()));
        address tokenAccessManager = tokenAccessManaged.accessManager();
        if (!ISMARTTokenAccessManager(tokenAccessManager).hasRole(role, account)) {
            revert ISMARTTokenAccessManaged.AccessControlUnauthorizedAccount(account, role);
        }
    }

    /// @notice Constructor that sets the trusted forwarder for meta-transactions
    /// @param forwarder The address of the trusted forwarder
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) { }

    /// @notice Initializes the contract when used as an upgradeable proxy.
    /// @dev This function should be called by the proxy contract after deployment to set all configuration.
    /// @param tokenAddress_ Address of the `ISMARTYield` token.
    /// @param startDate_ Start date of the yield schedule.
    /// @param endDate_ End date of the yield schedule.
    /// @param rate_ Yield rate in basis points.
    /// @param interval_ Duration of each yield interval.
    /// @param initialAdmins_ Array of addresses to be granted `DEFAULT_ADMIN_ROLE`.
    function initialize(
        address tokenAddress_,
        uint256 startDate_,
        uint256 endDate_,
        uint256 rate_,
        uint256 interval_,
        address[] calldata initialAdmins_
    )
        external
        virtual
        initializer
    {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        // Check if token implements ISMARTTokenAccessManaged interface
        if (!IERC165(tokenAddress_).supportsInterface(type(ISMARTTokenAccessManaged).interfaceId)) {
            revert InvalidToken();
        }

        __SMARTFixedYieldSchedule_init(tokenAddress_, startDate_, endDate_, rate_, interval_);

        if (initialAdmins_.length == 0) {
            revert NoInitialAdmins();
        }

        // Grant the `DEFAULT_ADMIN_ROLE` to the `initialAdmins_`.
        for (uint256 i = 0; i < initialAdmins_.length; ++i) {
            _grantRole(DEFAULT_ADMIN_ROLE, initialAdmins_[i]);
        }
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function claimYield() external override nonReentrant whenNotPaused {
        _claimYield();
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function topUpDenominationAsset(uint256 amount) external override nonReentrant whenNotPaused {
        _topUpDenominationAsset(amount);
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function withdrawDenominationAsset(
        address to,
        uint256 amount
    )
        external
        override
        nonReentrant
        onlyAssetRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE)
        whenNotPaused
    {
        _withdrawDenominationAsset(to, amount);
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function withdrawAllDenominationAsset(address to)
        external
        override
        nonReentrant
        onlyAssetRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE)
        whenNotPaused
    {
        _withdrawAllDenominationAsset(to);
    }

    /// @notice Pauses all contract operations
    /// @dev Can only be called by addresses with EMERGENCY_ROLE
    function pause() external onlyAssetRole(ATKAssetRoles.EMERGENCY_ROLE) {
        _pause(); // Internal OpenZeppelin Pausable function.
    }

    /// @notice Unpauses all contract operations
    /// @dev Can only be called by addresses with EMERGENCY_ROLE
    function unpause() external onlyAssetRole(ATKAssetRoles.EMERGENCY_ROLE) {
        _unpause(); // Internal OpenZeppelin Pausable function.
    }

    /// @notice Sets the onchain ID for this contract
    /// @dev Can only be called by an address with DEFAULT_ADMIN_ROLE
    /// @param onchainID_ The address of the onchain ID contract
    function setOnchainId(address onchainID_) external onlyRole(GOVERNANCE_ROLE) {
        if (onchainID_ == address(0)) revert InvalidOnchainID();
        _onchainID = onchainID_;
    }

    /// @inheritdoc IContractWithIdentity
    function onchainID() external view override returns (address) {
        return _onchainID;
    }

    /// @inheritdoc IContractWithIdentity
    function canAddClaim(address actor) external view override returns (bool) {
        return hasRole(ATKAssetRoles.GOVERNANCE_ROLE, actor);
    }

    /// @inheritdoc IContractWithIdentity
    function canRemoveClaim(address actor) external view override returns (bool) {
        return hasRole(ATKAssetRoles.GOVERNANCE_ROLE, actor);
    }

    /// @notice Override from Context and ERC2771Context to correctly identify the transaction sender
    /// @dev Handles meta-transactions by extracting the actual sender from the transaction data
    /// @return The address of the message sender
    function _msgSender()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable, SMARTFixedYieldScheduleLogic)
        returns (address)
    {
        return super._msgSender();
    }

    /// @notice Override from Context and ERC2771Context to correctly retrieve the transaction data
    /// @dev Handles meta-transactions by extracting the actual data from the transaction
    /// @return The calldata of the message
    function _msgData()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    /// @notice Override from ERC2771Context to define the context suffix length
    /// @dev Used for meta-transaction processing to determine where the actual data ends
    /// @return The length of the context suffix
    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength();
    }

    /// @notice Checks if this contract supports a given interface
    /// @param interfaceId The interface identifier to check
    /// @return True if the interface is supported
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable, SMARTFixedYieldScheduleLogic, ERC165Upgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IContractWithIdentity).interfaceId || super.supportsInterface(interfaceId);
    }
}
