// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin Contracts
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interfaces
import { IATKTimeBoundAirdropFactory } from "./IATKTimeBoundAirdropFactory.sol";
import { IATKTimeBoundAirdrop } from "./IATKTimeBoundAirdrop.sol";

// Implementations
import { AbstractATKSystemAddonFactoryImplementation } from
    "../../../system/addons/AbstractATKSystemAddonFactoryImplementation.sol";
import { ATKTimeBoundAirdropImplementation } from "./ATKTimeBoundAirdropImplementation.sol";
import { ATKTimeBoundAirdropProxy } from "./ATKTimeBoundAirdropProxy.sol";

// Constants
import { ATKPeopleRoles } from "../../../system/ATKPeopleRoles.sol";

/// @title Factory for Creating ATKTimeBoundAirdrop Proxies
/// @author SettleMint
/// @notice This contract serves as a factory to deploy new UUPS proxy instances of `ATKTimeBoundAirdrop` contracts.
/// It manages a single implementation contract and allows for updating this implementation.
/// @dev Key features of this factory:
/// - **Deployment of Proxies**: Provides a `create` function to deploy new `ATKTimeBoundAirdropProxy` instances,
///   which point to a shared `ATKTimeBoundAirdrop` implementation.
/// - **CREATE2**: Leverages `CREATE2` for deploying proxies, allowing their addresses to be pre-calculated.
/// - **Implementation Management**: Deploys an initial implementation and allows the owner to update it.
/// - **Authorization**: The `create` function requires the `DEPLOYER_ROLE` for proper access control.
/// - **Registry**: Maintains an array `allAirdrops` to keep track of all airdrop proxies created.
/// - **Meta-transactions**: Inherits `ERC2771Context` to support gasless operations if a trusted forwarder is
/// configured.
contract ATKTimeBoundAirdropFactoryImplementation is
    AbstractATKSystemAddonFactoryImplementation,
    IATKTimeBoundAirdropFactory
{
    /// @notice Unique type identifier for this factory contract.
    bytes32 public constant TYPE_ID = keccak256("ATKTimeBoundAirdropFactory");

    /// @notice Returns the unique type identifier for this factory.
    /// @return The type identifier as a bytes32 hash.
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }

    /// @notice Address of the current `ATKTimeBoundAirdrop` logic contract (implementation).
    address public override atkTimeBoundAirdropImplementation;

    /// @notice An array that stores references (addresses cast to `IATKTimeBoundAirdrop`) to all time-bound
    /// airdrop proxy contracts created by this factory.
    IATKTimeBoundAirdrop[] private allAirdrops;

    /// @custom:oz-upgrades-unsafe-allow constructor
    /// @notice Constructor that disables initializers to prevent implementation contract initialization
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(address forwarder) AbstractATKSystemAddonFactoryImplementation(forwarder) { }

    /// @notice Initializes the `ATKTimeBoundAirdropFactory`.
    /// @dev Initializes the factory, deploys the initial `ATKTimeBoundAirdrop` implementation,
    /// and sets up support for meta-transactions via ERC2771Context.
    /// @param accessManager The address of the access manager.
    /// @param systemAddress The address of the `IATKSystem` contract.
    function initialize(address accessManager, address systemAddress) public initializer {
        _initializeAbstractSystemAddonFactory(accessManager, systemAddress);

        address forwarder = trustedForwarder();
        // Deploy the initial implementation contract for ATKTimeBoundAirdrop.
        // The ATKTimeBoundAirdropImplementation constructor now only calls _disableInitializers().
        ATKTimeBoundAirdropImplementation initialImplementation = new ATKTimeBoundAirdropImplementation(forwarder);

        atkTimeBoundAirdropImplementation = address(initialImplementation);
        emit ImplementationUpdated(address(0), atkTimeBoundAirdropImplementation);
    }

    /// @notice Updates the address of the `ATKTimeBoundAirdrop` implementation contract.
    /// @dev Only callable by the factory owner. New proxies created after this call will use the new implementation.
    /// This does NOT automatically upgrade existing proxy instances.
    /// @param _newImplementation The address of the new `ATKTimeBoundAirdrop` logic contract.
    function updateImplementation(address _newImplementation)
        external
        onlySystemRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE)
    {
        if (_newImplementation == address(0)) revert IATKTimeBoundAirdropFactory.InvalidAddress();
        if (_newImplementation == atkTimeBoundAirdropImplementation) revert IATKTimeBoundAirdropFactory.SameAddress();
        if (!IERC165(_newImplementation).supportsInterface(type(IATKTimeBoundAirdrop).interfaceId)) {
            revert IATKTimeBoundAirdropFactory.InvalidImplementation();
        }

        address oldImplementation = atkTimeBoundAirdropImplementation;
        atkTimeBoundAirdropImplementation = _newImplementation;
        emit ImplementationUpdated(oldImplementation, atkTimeBoundAirdropImplementation);
    }

    /// @notice Creates and deploys a new `ATKTimeBoundAirdropProxy` contract for a given configuration.
    /// The proxy will point to the current `atkTimeBoundAirdropImplementation`.
    /// @dev This function performs the following steps:
    /// 1. **Authorization Check**: Verifies the caller has the `DEPLOYER_ROLE`.
    /// 2. **Salt Generation**: Computes a unique `salt` for CREATE2.
    /// 3. **Initialization Data**: Prepares the `initData` for the proxy to call `initialize` on the implementation.
    /// 4. **Proxy Deployment**: Deploys a `ATKTimeBoundAirdropProxy` using CREATE2.
    /// 5. **Event Emission**: Emits `ATKTimeBoundAirdropCreated`.
    /// 6. **Registry Update**: Adds the new proxy to `allAirdrops`.
    /// @param name The human-readable name for the airdrop.
    /// @param token The address of the ERC20 token to be distributed.
    /// @param root The Merkle root for verifying claims.
    /// @param owner The initial owner of the contract.
    /// @param startTime The timestamp when claims can begin.
    /// @param endTime The timestamp when claims end.
    /// @return airdropProxyAddress The address of the newly created `ATKTimeBoundAirdropProxy` contract.
    function create(
        string calldata name,
        address token,
        bytes32 root,
        address owner,
        uint256 startTime,
        uint256 endTime
    )
        external
        override(IATKTimeBoundAirdropFactory)
        onlySystemRole(ATKPeopleRoles.ADDON_MANAGER_ROLE)
        returns (address airdropProxyAddress)
    {
        bytes memory saltInputData = abi.encode(address(this), name, token, root, owner, startTime, endTime);
        bytes memory constructorArgs = abi.encode(address(this), name, token, root, owner, startTime, endTime);
        bytes memory proxyBytecode = type(ATKTimeBoundAirdropProxy).creationCode;

        // Predict the address first for validation
        address expectedAddress = _predictProxyAddress(proxyBytecode, constructorArgs, saltInputData);

        // Deploy using the abstract factory method
        airdropProxyAddress = _deploySystemAddon(proxyBytecode, constructorArgs, saltInputData, expectedAddress);

        // Emit an event to log the creation of the new airdrop proxy.
        emit ATKTimeBoundAirdropCreated(airdropProxyAddress, _msgSender());

        // Add the new airdrop proxy to the list of all airdrops created by this factory.
        // Cast the proxy to IATKTimeBoundAirdrop for storage, as the proxy behaves like one.
        allAirdrops.push(IATKTimeBoundAirdrop(payable(airdropProxyAddress)));

        return airdropProxyAddress;
    }

    /// @notice Returns the total number of time-bound airdrop proxy contracts created by this factory.
    /// @return count The number of time-bound airdrop proxy contracts created
    function allAirdropsLength() external view override(IATKTimeBoundAirdropFactory) returns (uint256 count) {
        return allAirdrops.length;
    }

    /// @notice Predicts the deployment address of a time-bound airdrop proxy.
    /// @param name The human-readable name for the airdrop.
    /// @param token The address of the ERC20 token to be distributed.
    /// @param root The Merkle root for verifying claims.
    /// @param owner The initial owner of the contract.
    /// @param startTime The timestamp when claims can begin.
    /// @param endTime The timestamp when claims end.
    /// @return predictedAddress The predicted address of the time-bound airdrop proxy.
    function predictTimeBoundAirdropAddress(
        string calldata name,
        address token,
        bytes32 root,
        address owner,
        uint256 startTime,
        uint256 endTime
    )
        external
        view
        override(IATKTimeBoundAirdropFactory)
        returns (address predictedAddress)
    {
        bytes memory saltInputData = abi.encode(address(this), name, token, root, owner, startTime, endTime);
        bytes memory constructorArgs = abi.encode(address(this), name, token, root, owner, startTime, endTime);
        bytes memory proxyBytecode = type(ATKTimeBoundAirdropProxy).creationCode;

        return _predictProxyAddress(proxyBytecode, constructorArgs, saltInputData);
    }

    /// @notice Checks if the contract supports a given interface
    /// @param interfaceId The interface identifier to check
    /// @return True if the contract supports the interface, false otherwise
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AbstractATKSystemAddonFactoryImplementation)
        returns (bool)
    {
        return interfaceId == type(IATKTimeBoundAirdropFactory).interfaceId || super.supportsInterface(interfaceId);
    }
}
