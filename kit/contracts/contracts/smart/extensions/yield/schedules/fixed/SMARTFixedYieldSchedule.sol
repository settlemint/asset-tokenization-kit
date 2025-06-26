// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import { ISMARTFixedYieldSchedule } from "./ISMARTFixedYieldSchedule.sol";
import { SMARTFixedYieldScheduleLogic } from "./internal/SMARTFixedYieldScheduleLogic.sol";

contract SMARTFixedYieldSchedule is
    SMARTFixedYieldScheduleLogic,
    ERC165,
    AccessControl,
    Pausable,
    ERC2771Context,
    ReentrancyGuard
{
    /// @notice Role for managing token supply operations
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");
    /// @notice Role for emergency operations including pausing the contract and ERC20 recovery
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    /// @notice Constructor to deploy a new `SMARTFixedYieldSchedule` contract.
    /// @dev If not a logic contract, initializes all parameters. Otherwise, defers to `initialize()`.
    /// @param tokenAddress_ Address of the `ISMARTYield` token.
    /// @param startDate_ Start date of the yield schedule.
    /// @param endDate_ End date of the yield schedule.
    /// @param rate_ Yield rate in basis points.
    /// @param interval_ Duration of each yield interval.
    /// @param initialOwner_ The address to be granted `DEFAULT_ADMIN_ROLE`.
    /// @param forwarder The address of the trusted forwarder for ERC2771 meta-transactions.
    constructor(
        address tokenAddress_,
        uint256 startDate_,
        uint256 endDate_,
        uint256 rate_,
        uint256 interval_,
        address initialOwner_,
        address forwarder
    )
        ERC2771Context(forwarder)
        AccessControl()
        Pausable()
        ReentrancyGuard()
    {
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
        override(Context, ERC2771Context, SMARTFixedYieldScheduleLogic)
        returns (address)
    {
        return super._msgSender();
    }

    /// @dev Overridden from `Context` and `ERC2771Context` to correctly retrieve the transaction data,
    /// accounting for meta-transactions.
    /// @return The actual transaction data (`msg.data` or the relayed data).
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    /// @dev Overridden from `ERC2771Context` to define the length of the suffix appended to `msg.data` for relayed
    /// calls.
    /// @return The length of the context suffix (typically 20 bytes for the sender's address).
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(SMARTFixedYieldScheduleLogic, AccessControl, ERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
