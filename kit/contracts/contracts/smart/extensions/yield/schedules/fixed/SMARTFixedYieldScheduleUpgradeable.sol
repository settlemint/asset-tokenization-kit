// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";

import { SMARTFixedYieldScheduleLogic } from "./internal/SMARTFixedYieldScheduleLogic.sol";
import { ISMARTFixedYieldSchedule } from "./ISMARTFixedYieldSchedule.sol";

contract SMARTFixedYieldScheduleUpgradeable is
    SMARTFixedYieldScheduleLogic,
    ERC165Upgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ERC2771ContextUpgradeable,
    ReentrancyGuardUpgradeable
{
    /// @notice Role for managing token supply operations
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");
    /// @notice Role for emergency operations including pausing the contract and ERC20 recovery
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) { }

    /// @notice Initializes the contract when used as an upgradeable proxy.
    /// @dev This function should be called by the proxy contract after deployment to set all configuration.
    /// @param initialOwner_ The address to be granted `DEFAULT_ADMIN_ROLE`.
    /// @param tokenAddress_ Address of the `ISMARTYield` token.
    /// @param startDate_ Start date of the yield schedule.
    /// @param endDate_ End date of the yield schedule.
    /// @param rate_ Yield rate in basis points.
    /// @param interval_ Duration of each yield interval.
    function initialize(
        address tokenAddress_,
        uint256 startDate_,
        uint256 endDate_,
        uint256 rate_,
        uint256 interval_,
        address initialOwner_
    )
        external
        virtual
        initializer
    {
        __Pausable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __SMARTFixedYieldSchedule_init_unchained(tokenAddress_, startDate_, endDate_, rate_, interval_);

        // Grant the `DEFAULT_ADMIN_ROLE` to the `initialOwner_`.
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner_);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner_);
        _grantRole(EMERGENCY_ROLE, initialOwner_);
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function claimYield() external override nonReentrant whenNotPaused {
        _claimYield();
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function topUpUnderlyingAsset(uint256 amount) external override nonReentrant whenNotPaused {
        _topUpUnderlyingAsset(amount);
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function withdrawUnderlyingAsset(
        address to,
        uint256 amount
    )
        external
        override
        nonReentrant
        onlyRole(SUPPLY_MANAGEMENT_ROLE)
        whenNotPaused
    {
        _withdrawUnderlyingAsset(to, amount);
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function withdrawAllUnderlyingAsset(address to)
        external
        override
        nonReentrant
        onlyRole(SUPPLY_MANAGEMENT_ROLE)
        whenNotPaused
    {
        _withdrawAllUnderlyingAsset(to);
    }

    /// @dev Pause the contract.
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause(); // Internal OpenZeppelin Pausable function.
    }

    /// @dev Unpause the contract.
    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause(); // Internal OpenZeppelin Pausable function.
    }

    /// @dev Overridden from `Context` and `ERC2771Context` to correctly identify the transaction sender,
    /// accounting for meta-transactions if a trusted forwarder is used.
    /// @return The actual sender of the transaction (`msg.sender` or the relayed sender).
    function _msgSender()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable, SMARTFixedYieldScheduleLogic)
        returns (address)
    {
        return super._msgSender();
    }

    /// @dev Overridden from `Context` and `ERC2771Context` to correctly retrieve the transaction data,
    /// accounting for meta-transactions.
    /// @return The actual transaction data (`msg.data` or the relayed data).
    function _msgData()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    /// @dev Overridden from `ERC2771Context` to define the length of the suffix appended to `msg.data` for relayed
    /// calls.
    /// @return The length of the context suffix (typically 20 bytes for the sender's address).
    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(SMARTFixedYieldScheduleLogic, AccessControlUpgradeable, ERC165Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
