// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { SMARTFixedYieldSchedule } from "./SMARTFixedYieldSchedule.sol";
import { ISMARTFixedYieldSchedule } from "./ISMARTFixedYieldSchedule.sol";
import { ISMARTYield } from "../../ISMARTYield.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @title Factory for Creating SMARTFixedYieldSchedule Contracts
/// @notice This contract serves as a factory to deploy new instances of `SMARTFixedYieldSchedule` contracts.
/// It allows for the creation of these yield schedules with deterministic addresses using the CREATE2 opcode,
/// if a unique salt is derived from the schedule parameters.
/// @dev Key features of this factory:
/// - **Deployment of Schedules**: Provides a `create` function to deploy new `SMARTFixedYieldSchedule` instances.
/// - **CREATE2**: Leverages `CREATE2` for deploying schedules, allowing their addresses to be pre-calculated if the
/// salt (derived from creation parameters) is known.
/// - **Authorization**: The `create` function checks if the caller (`_msgSender()`) is authorized to manage yield on
/// the target `token` (via `token.canManageYield()`).
/// - **Registry**: Maintains an array `allSchedules` to keep track of all yield schedule contracts created by this
/// factory.
/// - **Meta-transactions**: Inherits `ERC2771Context` to support gasless schedule creation if a trusted forwarder is
/// configured.
/// This factory simplifies the deployment process for fixed yield schedules and ensures that only authorized parties
/// can set them up for a given token.
/// @custom:security-contact support@settlemint.com Ensure the `trustedForwarder` is correctly configured if
/// meta-transactions are used.
contract SMARTFixedYieldScheduleFactory is ERC2771Context {
    /// @notice Custom error types for the factory contract.
    /// @dev Provides more gas-efficient and descriptive error handling.

    /// @dev Reverted by the `create` function if the caller (`_msgSender()`) does not have permission
    /// to manage yield for the specified `token` (as determined by `token.canManageYield(_msgSender())`).
    error NotAuthorized();

    /// @notice Emitted when a new `SMARTFixedYieldSchedule` contract is successfully created and deployed by this
    /// factory.
    /// @param schedule The address of the newly deployed `SMARTFixedYieldSchedule` contract.
    /// @param creator The address that initiated the creation of the yield schedule (the `_msgSender()` in the `create`
    /// function).
    event SMARTFixedYieldScheduleCreated(address indexed schedule, address indexed creator);

    /// @notice An array that stores references (addresses cast to `ISMARTFixedYieldSchedule`) to all fixed yield
    /// schedule contracts created by this factory.
    /// @dev This allows for enumeration or tracking of all deployed schedules. It is `public`, so a getter
    /// `allSchedules(uint256)` is automatically generated.
    /// Use `allSchedulesLength()` to get the number of schedules created.
    ISMARTFixedYieldSchedule[] public allSchedules;

    /// @notice Constructor for the `SMARTFixedYieldScheduleFactory`.
    /// @dev Initializes the factory contract, including setting up support for meta-transactions via ERC2771Context.
    /// @param forwarder The address of the trusted forwarder contract for meta-transactions (e.g., a GSN forwarder).
    ///                  If meta-transactions are not used, this can be `address(0)`, but then `ERC2771Context` features
    /// related to it won't be active.
    constructor(address forwarder) ERC2771Context(forwarder) {
        // The ERC2771Context constructor is called with the forwarder address.
    }

    /// @notice Returns the total number of fixed yield schedule contracts that have been created by this factory.
    /// @dev This can be used in conjunction with the public `allSchedules` array getter to iterate through all created
    /// schedules.
    /// For example, a loop from `0` to `allSchedulesLength() - 1` can retrieve each schedule address using
    /// `allSchedules(i)`.
    /// @return count The total count of schedules in the `allSchedules` array.
    function allSchedulesLength() external view returns (uint256 count) {
        return allSchedules.length;
    }

    /// @notice Creates and deploys a new `SMARTFixedYieldSchedule` contract for a given SMART token.
    /// @dev This function performs the following steps:
    /// 1. **Authorization Check**: Verifies that the caller (`_msgSender()`) has permission to manage yield for the
    /// target `token` by calling `token.canManageYield(_msgSender())`. If not, it reverts with `NotAuthorized`.
    /// 2. **Salt Generation**: Computes a unique `salt` for the CREATE2 opcode. The salt is derived from the `token`
    /// address and all the schedule parameters (`startTime`, `endTime`, `rate`, `interval`). This ensures that
    /// deploying a schedule with the exact same parameters for the same token will result in the same contract address
    /// (if deployed via this factory and salt scheme).
    /// 3. **Deployment**: Deploys a new `SMARTFixedYieldSchedule` contract using the `new SMARTFixedYieldSchedule{salt:
    /// salt}(...)` syntax (CREATE2).
    ///    The `initialOwner` of the new schedule contract is set to the `_msgSender()` (the creator).
    ///    The `trustedForwarder()` of this factory is passed to the new schedule for its own ERC2771 context.
    /// 4. **Event Emission**: Emits a `SMARTFixedYieldScheduleCreated` event with the address of the new schedule and
    /// the creator's address.
    /// 5. **Registry Update**: Adds the new schedule contract's address (cast to `ISMARTFixedYieldSchedule`) to the
    /// `allSchedules` array.
    /// Note: The line `token.setYieldSchedule(scheduleAddress)` is commented out. This implies that setting the
    /// schedule on the token itself is a separate step, to be performed by an authorized party after the schedule
    /// contract is deployed. This separation can be useful for operational workflows or if `setYieldSchedule` has its
    /// own complex authorization that shouldn't be mixed here.
    /// @param token The `ISMARTYield`-compliant token for which the yield schedule is being created.
    /// @param startTime The Unix timestamp when the yield distribution should start. Must be in the future at the time
    /// of schedule deployment.
    /// @param endTime The Unix timestamp when the yield distribution should end. Must be after `startTime`.
    /// @param rate The yield rate in basis points (e.g., 500 for 5%). Must be greater than 0.
    /// @param interval The interval between yield distributions in seconds (e.g., 86400 for daily). Must be greater
    /// than 0.
    /// @return scheduleAddress The address of the newly created and deployed `SMARTFixedYieldSchedule` contract.
    function create(
        ISMARTYield token,
        uint256 startTime,
        uint256 endTime,
        uint256 rate,
        uint256 interval
    )
        external
        returns (address scheduleAddress)
    {
        // Generate a unique salt for CREATE2 deployment based on factory, token and schedule parameters.
        // This allows for deterministic address generation while preventing cross-factory collisions.
        bytes32 salt = keccak256(abi.encode(address(this), address(token), startTime, endTime, rate, interval));

        // Deploy the new SMARTFixedYieldSchedule contract using CREATE2 (via the `salt` option).
        // The creator (`_msgSender()`) becomes the initial owner/admin of the new schedule.
        // The factory's trusted forwarder is passed to the new schedule.
        SMARTFixedYieldSchedule newScheduleInstance = new SMARTFixedYieldSchedule{ salt: salt }(
            address(token), // The token this schedule is for.
            _msgSender(), // The creator becomes the initial admin of the schedule.
            startTime, // Schedule start time.
            endTime, // Schedule end time.
            rate, // Yield rate (basis points).
            interval, // Distribution interval (seconds).
            trustedForwarder() // Forwarder for meta-transactions for the new schedule.
        );
        scheduleAddress = address(newScheduleInstance);

        // Emit an event to log the creation of the new schedule.
        emit SMARTFixedYieldScheduleCreated(scheduleAddress, _msgSender());
        // Add the new schedule to the list of all schedules created by this factory.
        allSchedules.push(newScheduleInstance); // Implicit cast from SMARTFixedYieldSchedule to
            // ISMARTFixedYieldSchedule
        return scheduleAddress;
    }
}
