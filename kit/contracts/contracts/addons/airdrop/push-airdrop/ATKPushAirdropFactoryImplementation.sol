// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin Contracts
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interfaces
import { IATKPushAirdropFactory } from "./IATKPushAirdropFactory.sol";
import { IATKPushAirdrop } from "./IATKPushAirdrop.sol";

// Implementations
import { AbstractATKSystemAddonFactoryImplementation } from
    "../../../system/addons/AbstractATKSystemAddonFactoryImplementation.sol";
import { ATKPushAirdropImplementation } from "./ATKPushAirdropImplementation.sol";
import { ATKPushAirdropProxy } from "./ATKPushAirdropProxy.sol";

// Constants
import { ATKPeopleRoles } from "../../../system/ATKPeopleRoles.sol";

/// @title Factory for Creating ATKPushAirdrop Proxies
/// @author SettleMint
/// @notice This contract serves as a factory to deploy new UUPS proxy instances of `ATKPushAirdrop` contracts.
/// It manages a single implementation contract and allows for updating this implementation.
/// @dev Key features of this factory:
/// - **Deployment of Proxies**: Provides a `create` function to deploy new `ATKPushAirdropProxy` instances,
///   which point to a shared `ATKPushAirdrop` implementation.
/// - **CREATE2**: Leverages `CREATE2` for deploying proxies, allowing their addresses to be pre-calculated.
/// - **Implementation Management**: Deploys an initial implementation and allows the owner to update it.
/// - **Authorization**: The `create` function requires the `DEPLOYER_ROLE` for proper access control.
/// - **Registry**: Maintains an array `allAirdrops` to keep track of all airdrop proxies created.
/// - **Meta-transactions**: Inherits `ERC2771Context` to support gasless operations if a trusted forwarder is
/// configured.
contract ATKPushAirdropFactoryImplementation is AbstractATKSystemAddonFactoryImplementation, IATKPushAirdropFactory {
    /// @notice Type identifier for the factory
    /// @return The keccak256 hash of "ATKPushAirdropFactory"
    function typeId() external pure override returns (bytes32) {
        return keccak256("ATKPushAirdropFactory");
    }

    /// @notice Address of the current `ATKPushAirdrop` logic contract (implementation).
    address public override atkPushAirdropImplementation;

    /// @notice An array that stores references (addresses cast to `IATKPushAirdrop`) to all push
    /// airdrop proxy contracts created by this factory.
    IATKPushAirdrop[] private allAirdrops;

    /// @notice Constructor that disables initializers to prevent implementation contract initialization
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) AbstractATKSystemAddonFactoryImplementation(forwarder) { }

    /// @notice Initializes the `ATKPushAirdropFactory`.
    /// @dev Initializes the factory, deploys the initial `ATKPushAirdrop` implementation,
    /// and sets up support for meta-transactions via ERC2771Context.
    /// @param accessManager The address of the access manager.
    /// @param systemAddress The address of the `IATKSystem` contract.
    function initialize(address accessManager, address systemAddress) public initializer {
        _initializeAbstractSystemAddonFactory(accessManager, systemAddress);

        address forwarder = trustedForwarder();
        // Deploy the initial implementation contract for ATKPushAirdrop.
        // The ATKPushAirdropImplementation constructor now only calls _disableInitializers().
        ATKPushAirdropImplementation initialImplementation = new ATKPushAirdropImplementation(forwarder);

        atkPushAirdropImplementation = address(initialImplementation);
        emit ImplementationUpdated(address(0), atkPushAirdropImplementation);
    }

    /// @notice Updates the address of the `ATKPushAirdrop` implementation contract.
    /// @dev Only callable by the factory owner. New proxies created after this call will use the new implementation.
    /// This does NOT automatically upgrade existing proxy instances.
    /// @param _newImplementation The address of the new `ATKPushAirdrop` logic contract.
    function updateImplementation(address _newImplementation)
        external
        onlySystemRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE)
    {
        if (_newImplementation == address(0)) revert IATKPushAirdropFactory.InvalidAddress();
        if (_newImplementation == atkPushAirdropImplementation) revert IATKPushAirdropFactory.SameAddress();
        if (!IERC165(_newImplementation).supportsInterface(type(IATKPushAirdrop).interfaceId)) {
            revert IATKPushAirdropFactory.InvalidImplementation();
        }

        address oldImplementation = atkPushAirdropImplementation;
        atkPushAirdropImplementation = _newImplementation;
        emit ImplementationUpdated(oldImplementation, atkPushAirdropImplementation);
    }

    /// @notice Creates and deploys a new `ATKPushAirdropProxy` contract for a given configuration.
    /// The proxy will point to the current `atkPushAirdropImplementation`.
    /// @dev This function performs the following steps:
    /// 1. **Authorization Check**: Verifies the caller has the `DEPLOYER_ROLE`.
    /// 2. **Salt Generation**: Computes a unique `salt` for CREATE2.
    /// 3. **Initialization Data**: Prepares the `initData` for the proxy to call `initialize` on the implementation.
    /// 4. **Proxy Deployment**: Deploys a `ATKPushAirdropProxy` using CREATE2.
    /// 5. **Event Emission**: Emits `ATKPushAirdropCreated`.
    /// 6. **Registry Update**: Adds the new proxy to `allAirdrops`.
    /// @param name The human-readable name for the airdrop.
    /// @param token The address of the ERC20 token to be distributed.
    /// @param root The Merkle root for verifying distributions.
    /// @param owner The initial owner of the contract (admin who can distribute tokens).
    /// @param distributionCap The maximum tokens that can be distributed (0 for no cap).
    /// @return airdropProxyAddress The address of the newly created `ATKPushAirdropProxy` contract.
    function create(
        string calldata name,
        address token,
        bytes32 root,
        address owner,
        uint256 distributionCap
    )
        external
        override(IATKPushAirdropFactory)
        onlySystemRole(ATKPeopleRoles.ADDON_MANAGER_ROLE)
        returns (address airdropProxyAddress)
    {
        bytes memory saltInputData = abi.encode(address(this), name, token, root, owner, distributionCap);
        bytes memory constructorArgs = abi.encode(address(this), name, token, root, owner, distributionCap);
        bytes memory proxyBytecode = type(ATKPushAirdropProxy).creationCode;

        // Predict the address first for validation
        address expectedAddress = _predictProxyAddress(proxyBytecode, constructorArgs, saltInputData);

        // Deploy using the abstract factory method
        airdropProxyAddress = _deploySystemAddon(proxyBytecode, constructorArgs, saltInputData, expectedAddress);

        // Emit an event to log the creation of the new airdrop proxy.
        emit ATKPushAirdropCreated(airdropProxyAddress, _msgSender());

        // Add the new airdrop proxy to the list of all airdrops created by this factory.
        // Cast the proxy to IATKPushAirdrop for storage, as the proxy behaves like one.
        allAirdrops.push(IATKPushAirdrop(payable(airdropProxyAddress)));

        return airdropProxyAddress;
    }

    /// @notice Returns the total number of push airdrop proxy contracts created by this factory.
    /// @return count The number of push airdrop proxies created
    function allAirdropsLength() external view override(IATKPushAirdropFactory) returns (uint256 count) {
        return allAirdrops.length;
    }

    /// @notice Predicts the deployment address of a push airdrop proxy.
    /// @param name The human-readable name for the airdrop.
    /// @param token The address of the ERC20 token to be distributed.
    /// @param root The Merkle root for verifying distributions.
    /// @param owner The initial owner of the contract.
    /// @param distributionCap The maximum tokens that can be distributed.
    /// @return predictedAddress The predicted address of the push airdrop proxy.
    function predictPushAirdropAddress(
        string calldata name,
        address token,
        bytes32 root,
        address owner,
        uint256 distributionCap
    )
        external
        view
        override(IATKPushAirdropFactory)
        returns (address predictedAddress)
    {
        bytes memory saltInputData = abi.encode(address(this), name, token, root, owner, distributionCap);
        bytes memory constructorArgs = abi.encode(address(this), name, token, root, owner, distributionCap);
        bytes memory proxyBytecode = type(ATKPushAirdropProxy).creationCode;

        return _predictProxyAddress(proxyBytecode, constructorArgs, saltInputData);
    }

    /// @notice Checks if the factory supports a specific interface
    /// @param interfaceId The interface identifier to check
    /// @return True if the interface is supported, false otherwise
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AbstractATKSystemAddonFactoryImplementation)
        returns (bool)
    {
        return interfaceId == type(IATKPushAirdropFactory).interfaceId || super.supportsInterface(interfaceId);
    }
}
