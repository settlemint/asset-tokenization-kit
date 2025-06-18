// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// OpenZeppelin Contracts
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interfaces
import { IATKFixedYieldScheduleFactory } from "./IATKFixedYieldScheduleFactory.sol";
import { ISMARTFixedYieldSchedule } from "../../smart/extensions/yield/schedules/fixed/ISMARTFixedYieldSchedule.sol";
import { ISMARTYield } from "../../smart/extensions/yield/ISMARTYield.sol";
import { IATKSystem } from "../../system/IATKSystem.sol";
import { IATKComplianceBypassList } from "../../system/compliance/IATKComplianceBypassList.sol";
import { IWithTypeIdentifier } from "../../system/IWithTypeIdentifier.sol";

// Implementations
import { SMARTFixedYieldScheduleUpgradeable } from
    "../../smart/extensions/yield/schedules/fixed/SMARTFixedYieldScheduleUpgradeable.sol";
import { ATKFixedYieldProxy } from "./ATKFixedYieldProxy.sol";

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
    Initializable,
    IATKFixedYieldScheduleFactory,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    AccessControlUpgradeable,
    IWithTypeIdentifier
{
    bytes32 public constant override typeId = keccak256("ATKFixedYieldScheduleFactory");

    /// @notice Address of the current `ATKFixedYieldSchedule` logic contract (implementation).
    address public atkFixedYieldScheduleImplementation;

    /// @notice The address of the `IATKSystem` contract.
    address private systemAddress;

    /// @notice An array that stores references (addresses cast to `ISMARTFixedYieldSchedule`) to all fixed yield
    /// schedule proxy contracts created by this factory.
    ISMARTFixedYieldSchedule[] private allSchedules;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _disableInitializers();
    }

    /// @notice Initializes the `ATKFixedYieldScheduleFactory`.
    /// @dev Initializes the factory, deploys the initial `ATKFixedYieldSchedule` implementation,
    /// and sets up support for meta-transactions via ERC2771Context.
    /// @param systemAddress_ The address of the `IATKSystem` contract.
    /// @param initialAdmin_ The address of the initial admin.
    function initialize(address systemAddress_, address initialAdmin_) public initializer {
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin_);
        _grantRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE, initialAdmin_);
        _grantRole(ATKSystemRoles.DEPLOYER_ROLE, initialAdmin_);

        systemAddress = systemAddress_;

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
    /// 2. **Salt Generation**: Computes a unique `salt` for CREATE2.
    /// 3. **Initialization Data**: Prepares the `initData` for the proxy to call `initialize` on the implementation.
    /// 4. **Proxy Deployment**: Deploys a `ATKFixedYieldProxy` using CREATE2.
    /// 5. **Event Emission**: Emits `ATKFixedYieldScheduleCreated`.
    /// 6. **Registry Update**: Adds the new proxy to `allSchedules`.
    /// @param token The `ISMARTYield`-compliant token for which the yield schedule is being created.
    /// @param startTime The Unix timestamp for the schedule start.
    /// @param endTime The Unix timestamp for the schedule end.
    /// @param rate The yield rate in basis points.
    /// @param interval The interval for yield distributions in seconds.
    /// @return scheduleProxyAddress The address of the newly created `ATKFixedYieldProxy` contract.
    function create(
        ISMARTYield token,
        uint256 startTime,
        uint256 endTime,
        uint256 rate,
        uint256 interval
    )
        external
        override(IATKFixedYieldScheduleFactory)
        onlyRole(ATKSystemRoles.DEPLOYER_ROLE)
        returns (address scheduleProxyAddress)
    {
        bytes32 salt = keccak256(abi.encode(address(this), address(token), startTime, endTime, rate, interval));

        // Deploy the new ATKFixedYieldProxy contract using CREATE2, pointing to the current implementation.
        ATKFixedYieldProxy newScheduleProxy = new ATKFixedYieldProxy{ salt: salt }(
            address(this), address(token), startTime, endTime, rate, interval, _msgSender()
        );
        scheduleProxyAddress = address(newScheduleProxy);

        // Emit an event to log the creation of the new schedule proxy.
        emit ATKFixedYieldScheduleCreated(scheduleProxyAddress, _msgSender());
        // Add the new schedule proxy to the list of all schedules created by this factory.
        // Cast the proxy to ISMARTFixedYieldSchedule for storage, as the proxy behaves like one.
        allSchedules.push(ISMARTFixedYieldSchedule(payable(scheduleProxyAddress)));

        address complianceProxy = IATKSystem(systemAddress).complianceProxy();
        if (
            complianceProxy != address(0)
                && IERC165(complianceProxy).supportsInterface(type(IATKComplianceBypassList).interfaceId)
        ) {
            // Allow schedule to receive tokens
            IATKComplianceBypassList(complianceProxy).addToBypassList(scheduleProxyAddress);
        }

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
        override(AccessControlUpgradeable, ERC165Upgradeable)
        returns (bool)
    {
        return interfaceId == type(IATKFixedYieldScheduleFactory).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @dev Overridden from `Context` and `ERC2771Context` to correctly identify the transaction sender,
    /// accounting for meta-transactions if a trusted forwarder is used.
    /// @return The actual sender of the transaction (`msg.sender` or the relayed sender).
    function _msgSender() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address) {
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
}
