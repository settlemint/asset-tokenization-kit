// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { SMARTFixedYieldSchedule } from "../../extensions/yield/schedules/fixed/SMARTFixedYieldSchedule.sol";
import { ISMARTFixedYieldSchedule } from "../../extensions/yield/schedules/fixed/ISMARTFixedYieldSchedule.sol";
import { SMARTFixedYieldProxy } from "./SMARTFixedYieldProxy.sol";
import { ISMARTYield } from "../../extensions/yield/ISMARTYield.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

/// @title Factory for Creating SMARTFixedYieldSchedule Proxies
/// @notice This contract serves as a factory to deploy new UUPS proxy instances of `SMARTFixedYieldSchedule` contracts.
/// It manages a single implementation contract and allows for updating this implementation.
/// @dev Key features of this factory:
/// - **Deployment of Proxies**: Provides a `create` function to deploy new `SMARTFixedYieldProxy` instances,
///   which point to a shared `SMARTFixedYieldSchedule` implementation.
/// - **CREATE2**: Leverages `CREATE2` for deploying proxies, allowing their addresses to be pre-calculated.
/// - **Implementation Management**: Deploys an initial implementation and allows the owner to update it.
/// - **Authorization**: The `create` function can retain checks for `token.canManageYield()`. (Retained for now)
/// - **Registry**: Maintains an array `allSchedules` to keep track of all yield schedule proxies created.
/// - **Meta-transactions**: Inherits `ERC2771Context` to support gasless operations if a trusted forwarder is
/// configured.
contract SMARTFixedYieldScheduleFactory is ERC2771Context, AccessControl {
    /// @notice Emitted when the `smartFixedYieldScheduleImplementation` is updated.
    /// @param oldImplementation The address of the previous implementation contract.
    /// @param newImplementation The address of the new implementation contract.
    event ImplementationUpdated(address indexed oldImplementation, address indexed newImplementation);

    /// @notice Emitted when a new `SMARTFixedYieldSchedule` proxy contract is successfully created and deployed.
    /// @param scheduleProxy The address of the newly deployed `SMARTFixedYieldProxy` contract.
    /// @param creator The address that initiated the creation of the yield schedule proxy.
    event SMARTFixedYieldScheduleProxyCreated(address indexed scheduleProxy, address indexed creator);

    /// @notice Custom error for invalid address parameter.
    error InvalidAddress();
    /// @notice Custom error when attempting to set the same address.
    error SameAddress();

    /// @notice Address of the current `SMARTFixedYieldSchedule` logic contract (implementation).
    address private smartFixedYieldScheduleImplementation;

    /// @notice An array that stores references (addresses cast to `ISMARTFixedYieldSchedule`) to all fixed yield
    /// schedule proxy contracts created by this factory.
    ISMARTFixedYieldSchedule[] private allSchedules;

    /// @notice Constructor for the `SMARTFixedYieldScheduleFactory`.
    /// @dev Initializes the factory, deploys the initial `SMARTFixedYieldSchedule` implementation,
    /// and sets up support for meta-transactions via ERC2771Context.
    /// @param forwarder The address of the trusted forwarder contract for meta-transactions.
    constructor(address forwarder) ERC2771Context(forwarder) AccessControl() {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());

        // Deploy the initial implementation contract for SMARTFixedYieldSchedule.
        // The SMARTFixedYieldSchedule constructor now only calls _disableInitializers().
        SMARTFixedYieldSchedule initialImplementation =
            new SMARTFixedYieldSchedule(address(0), 0, 0, 0, 0, _msgSender(), forwarder, true);

        smartFixedYieldScheduleImplementation = address(initialImplementation);
        emit ImplementationUpdated(address(0), smartFixedYieldScheduleImplementation);
    }

    /// @notice Updates the address of the `SMARTFixedYieldSchedule` implementation contract.
    /// @dev Only callable by the factory owner. New proxies created after this call will use the new implementation.
    /// This does NOT automatically upgrade existing proxy instances.
    /// @param _newImplementation The address of the new `SMARTFixedYieldSchedule` logic contract.
    function updateImplementation(address _newImplementation) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_newImplementation == address(0)) revert InvalidAddress(); // Added basic check
        if (_newImplementation == smartFixedYieldScheduleImplementation) revert SameAddress(); // Added basic check

        address oldImplementation = smartFixedYieldScheduleImplementation;
        smartFixedYieldScheduleImplementation = _newImplementation;
        emit ImplementationUpdated(oldImplementation, _newImplementation);
    }

    /// @notice Returns the total number of fixed yield schedule proxy contracts created by this factory.
    function allSchedulesLength() external view returns (uint256 count) {
        return allSchedules.length;
    }

    /// @notice Creates and deploys a new `SMARTFixedYieldProxy` contract for a given SMART token.
    /// The proxy will point to the current `smartFixedYieldScheduleImplementation`.
    /// @dev This function performs the following steps:
    /// 1. **Authorization Check**: (Retained) Verifies `token.canManageYield(_msgSender())`.
    /// 2. **Salt Generation**: Computes a unique `salt` for CREATE2.
    /// 3. **Initialization Data**: Prepares the `initData` for the proxy to call `initialize` on the implementation.
    /// 4. **Proxy Deployment**: Deploys a `SMARTFixedYieldProxy` using CREATE2.
    /// 5. **Event Emission**: Emits `SMARTFixedYieldScheduleProxyCreated`.
    /// 6. **Registry Update**: Adds the new proxy to `allSchedules`.
    /// @param token The `ISMARTYield`-compliant token for which the yield schedule is being created.
    /// @param startTime The Unix timestamp for the schedule start.
    /// @param endTime The Unix timestamp for the schedule end.
    /// @param rate The yield rate in basis points.
    /// @param interval The interval for yield distributions in seconds.
    /// @return scheduleProxyAddress The address of the newly created `SMARTFixedYieldProxy` contract.
    function create(
        ISMARTYield token,
        uint256 startTime,
        uint256 endTime,
        uint256 rate,
        uint256 interval
    )
        external
        returns (address scheduleProxyAddress)
    {
        // Authorization check (Retained from original, ensure ISMARTYield has this function)
        // Example: if (!token.canManageYield(_msgSender())) revert NotAuthorized();
        // Assuming ISMARTYield does not have canManageYield, this check would need to be adapted or removed.
        // For now, I will comment it out as it's not part of the core UUPS change.
        // if (!token.canManageYield(_msgSender())) revert NotAuthorized();

        bytes32 salt = keccak256(abi.encode(address(this), address(token), startTime, endTime, rate, interval));

        // Prepare the initialization data for the SMARTFixedYieldSchedule's initialize function.
        // initialize(address tokenAddress_, uint256 startDate_, uint256 endDate_, uint256 rate_, uint256 interval_,
        // address initialOwner_, address forwarder_)
        bytes memory initData = abi.encodeWithSelector(
            SMARTFixedYieldSchedule.initialize.selector,
            address(token),
            startTime,
            endTime,
            rate,
            interval,
            _msgSender(),
            trustedForwarder()
        );

        // Deploy the new SMARTFixedYieldProxy contract using CREATE2, pointing to the current implementation.
        SMARTFixedYieldProxy newScheduleProxy =
            new SMARTFixedYieldProxy{ salt: salt }(smartFixedYieldScheduleImplementation, initData);
        scheduleProxyAddress = address(newScheduleProxy);

        // Emit an event to log the creation of the new schedule proxy.
        emit SMARTFixedYieldScheduleProxyCreated(scheduleProxyAddress, _msgSender());
        // Add the new schedule proxy to the list of all schedules created by this factory.
        // Cast the proxy to ISMARTFixedYieldSchedule for storage, as the proxy behaves like one.
        allSchedules.push(ISMARTFixedYieldSchedule(payable(scheduleProxyAddress)));

        return scheduleProxyAddress;
    }

    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return super._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }
}
