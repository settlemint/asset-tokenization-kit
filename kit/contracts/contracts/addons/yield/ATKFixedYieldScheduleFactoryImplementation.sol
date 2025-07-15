// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// OpenZeppelin Contracts
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interfaces
import { IATKFixedYieldScheduleFactory } from "./IATKFixedYieldScheduleFactory.sol";
import { ISMARTFixedYieldSchedule } from "../../smart/extensions/yield/schedules/fixed/ISMARTFixedYieldSchedule.sol";
import { ISMARTYield } from "../../smart/extensions/yield/ISMARTYield.sol";

// Implementations
import { AbstractATKSystemAddonFactoryImplementation } from
    "../../system/addons/AbstractATKSystemAddonFactoryImplementation.sol";
import { SMARTFixedYieldScheduleUpgradeable } from
    "../../smart/extensions/yield/schedules/fixed/SMARTFixedYieldScheduleUpgradeable.sol";
import { ATKFixedYieldProxy } from "./ATKFixedYieldProxy.sol";
import { ATKFixedYieldScheduleUpgradeable } from "./ATKFixedYieldScheduleUpgradeable.sol";

// Constants
import { ATKSystemRoles } from "../../system/ATKSystemRoles.sol";

/// @title Factory for Creating ATKFixedYieldSchedule Proxies
/// @notice This contract serves as a factory to deploy new UUPS proxy instances of `ATKFixedYieldSchedule` contracts.
/// It manages a single implementation contract and allows for updating this implementation.
/// @dev Key features of this factory:
/// - **Deployment of Proxies**: Provides a `create` function to deploy new `ATKFixedYieldProxy` instances,
///   which point to a shared `ATKFixedYieldSchedule` implementation.
/// - **CREATE2**: Leverages `CREATE2` for deploying proxies, allowing their addresses to be pre-calculated.
/// - **Implementation Management**: Deploys an initial implementation and allows the owner to update it.
/// - **Authorization**: The `create` function can retain checks for `token.canManageYield()`. (Retained for now)
/// - **Registry**: Maintains an array `allSchedules` to keep track of all yield schedule proxies created.
/// - **Meta-transactions**: Inherits `ERC2771Context` to support gasless operations if a trusted forwarder is
/// configured.
contract ATKFixedYieldScheduleFactoryImplementation is
    AbstractATKSystemAddonFactoryImplementation,
    IATKFixedYieldScheduleFactory
{
    bytes32 public constant override typeId = keccak256("ATKFixedYieldScheduleFactory");

    /// @notice Address of the current `ATKFixedYieldSchedule` logic contract (implementation).
    address public atkFixedYieldScheduleImplementation;

    /// @notice An array that stores references (addresses cast to `ISMARTFixedYieldSchedule`) to all fixed yield
    /// schedule proxy contracts created by this factory.
    ISMARTFixedYieldSchedule[] private allSchedules;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) AbstractATKSystemAddonFactoryImplementation(forwarder) { }

    /// @notice Initializes the `ATKFixedYieldScheduleFactory`.
    /// @dev Initializes the factory, deploys the initial `ATKFixedYieldSchedule` implementation,
    /// and sets up support for meta-transactions via ERC2771Context.
    /// @param systemAddress_ The address of the `IATKSystem` contract.
    /// @param initialAdmin_ The address of the initial admin.
    function initialize(address systemAddress_, address initialAdmin_) public initializer {
        _initializeAbstractSystemAddonFactory(systemAddress_, initialAdmin_);

        address forwarder = trustedForwarder();
        // Deploy the initial implementation contract for SMARTFixedYieldSchedule.
        // The SMARTFixedYieldSchedule constructor now only calls _disableInitializers().
        SMARTFixedYieldScheduleUpgradeable initialImplementation = new SMARTFixedYieldScheduleUpgradeable(forwarder);

        atkFixedYieldScheduleImplementation = address(initialImplementation);
        emit ImplementationUpdated(address(0), atkFixedYieldScheduleImplementation);
    }

    /// @notice Updates the address of the `ATKFixedYieldSchedule` implementation contract.
    /// @dev Only callable by the factory owner. New proxies created after this call will use the new implementation.
    /// This does NOT automatically upgrade existing proxy instances.
    /// @param _newImplementation The address of the new `ATKFixedYieldSchedule` logic contract.
    function updateImplementation(address _newImplementation)
        external
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (_newImplementation == address(0)) revert InvalidAddress(); // Added basic check
        if (_newImplementation == atkFixedYieldScheduleImplementation) revert SameAddress(); // Added basic check
        if (!IERC165(_newImplementation).supportsInterface(type(ISMARTFixedYieldSchedule).interfaceId)) {
            revert InvalidImplementation();
        }

        address oldImplementation = atkFixedYieldScheduleImplementation;
        atkFixedYieldScheduleImplementation = _newImplementation;
        emit ImplementationUpdated(oldImplementation, atkFixedYieldScheduleImplementation);
    }

    /// @notice Creates and deploys a new `ATKFixedYieldProxy` contract for a given SMART token.
    /// The proxy will point to the current `atkFixedYieldScheduleImplementation`.
    /// @dev This function performs the following steps:
    /// 1. **Authorization Check**: (Retained) Verifies `token.canManageYield(_msgSender())`.
    /// 2. **Identity Creation**: Creates a contract identity for the yield schedule and registers it with the identity
    /// registry.
    /// 3. **Salt Generation**: Computes a unique `salt` for CREATE2.
    /// 4. **Initialization Data**: Prepares the `initData` for the proxy to call `initialize` on the implementation.
    /// 5. **Proxy Deployment**: Deploys a `ATKFixedYieldProxy` using CREATE2.
    /// 6. **Event Emission**: Emits `ATKFixedYieldScheduleCreated`.
    /// 7. **Registry Update**: Adds the new proxy to `allSchedules`.
    /// @param token The `ISMARTYield`-compliant token for which the yield schedule is being created.
    /// @param startTime The Unix timestamp for the schedule start.
    /// @param endTime The Unix timestamp for the schedule end.
    /// @param rate The yield rate in basis points.
    /// @param interval The interval for yield distributions in seconds.
    /// @param country Country code for compliance purposes.
    /// @return scheduleProxyAddress The address of the newly created `ATKFixedYieldProxy` contract.
    function create(
        ISMARTYield token,
        uint256 startTime,
        uint256 endTime,
        uint256 rate,
        uint256 interval,
        uint16 country
    )
        external
        override(IATKFixedYieldScheduleFactory)
        onlyRole(ATKSystemRoles.DEPLOYER_ROLE)
        returns (address scheduleProxyAddress)
    {
        bytes memory saltInputData = abi.encode(address(this), address(token), startTime, endTime, rate, interval);
        bytes memory constructorArgs =
            abi.encode(address(this), address(token), startTime, endTime, rate, interval, _msgSender());
        bytes memory proxyBytecode = type(ATKFixedYieldProxy).creationCode;

        // Predict the address first for validation
        address expectedAddress = _predictProxyAddress(proxyBytecode, constructorArgs, saltInputData);

        // Deploy using the abstract factory method
        scheduleProxyAddress = _deploySystemAddon(proxyBytecode, constructorArgs, saltInputData, expectedAddress);

        // Create contract identity for the yield schedule
        address contractIdentity = _deployContractIdentity(scheduleProxyAddress, country);

        // Set the onchain ID on the yield schedule contract
        ATKFixedYieldScheduleUpgradeable(scheduleProxyAddress).setOnchainId(contractIdentity);

        // Emit an event to log the creation of the new schedule proxy.
        emit ATKFixedYieldScheduleCreated(scheduleProxyAddress, _msgSender());

        // Add the new schedule proxy to the list of all schedules created by this factory.
        // Cast the proxy to ISMARTFixedYieldSchedule for storage, as the proxy behaves like one.
        allSchedules.push(ISMARTFixedYieldSchedule(payable(scheduleProxyAddress)));

        return scheduleProxyAddress;
    }

    /// @notice Returns the total number of fixed yield schedule proxy contracts created by this factory.
    function allSchedulesLength() external view returns (uint256 count) {
        return allSchedules.length;
    }

    /// @notice Returns the address of the current `ATKFixedYieldSchedule` logic contract (implementation).
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AbstractATKSystemAddonFactoryImplementation)
        returns (bool)
    {
        return interfaceId == type(IATKFixedYieldScheduleFactory).interfaceId || super.supportsInterface(interfaceId);
    }
}
