// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// OpenZeppelin Contracts
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interfaces
import { IATKVestingAirdropFactory } from "./IATKVestingAirdropFactory.sol";
import { IATKVestingAirdrop } from "./IATKVestingAirdrop.sol";
import { IATKSystem } from "../../../system/IATKSystem.sol";
import { IATKCompliance } from "../../../system/compliance/IATKCompliance.sol";

// Implementations
import { AbstractATKSystemAddonFactoryImplementation } from
    "../../../system/addons/AbstractATKSystemAddonFactoryImplementation.sol";
import { ATKVestingAirdropImplementation } from "./ATKVestingAirdropImplementation.sol";
import { ATKVestingAirdropProxy } from "./ATKVestingAirdropProxy.sol";

// Constants
import { ATKSystemRoles } from "../../../system/ATKSystemRoles.sol";

/// @title Factory for Creating ATKVestingAirdrop Proxies
/// @notice This contract serves as a factory to deploy new UUPS proxy instances of `ATKVestingAirdrop` contracts.
/// It manages a single implementation contract and allows for updating this implementation.
/// @dev Key features of this factory:
/// - **Deployment of Proxies**: Provides a `create` function to deploy new `ATKVestingAirdropProxy` instances,
///   which point to a shared `ATKVestingAirdrop` implementation.
/// - **CREATE2**: Leverages `CREATE2` for deploying proxies, allowing their addresses to be pre-calculated.
/// - **Implementation Management**: Deploys an initial implementation and allows the owner to update it.
/// - **Authorization**: The `create` function requires the `DEPLOYER_ROLE` for proper access control.
/// - **Registry**: Maintains an array `allAirdrops` to keep track of all airdrop proxies created.
/// - **Meta-transactions**: Inherits `ERC2771Context` to support gasless operations if a trusted forwarder is
/// configured.
contract ATKVestingAirdropFactoryImplementation is
    AbstractATKSystemAddonFactoryImplementation,
    IATKVestingAirdropFactory
{
    bytes32 public constant override typeId = keccak256("ATKVestingAirdropFactory");

    /// @notice Address of the current `ATKVestingAirdrop` logic contract (implementation).
    address public atkVestingAirdropImplementation;

    /// @notice An array that stores references (addresses cast to `IATKVestingAirdrop`) to all vesting
    /// airdrop proxy contracts created by this factory.
    IATKVestingAirdrop[] private allAirdrops;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) AbstractATKSystemAddonFactoryImplementation(forwarder) { }

    /// @notice Initializes the `ATKVestingAirdropFactory`.
    /// @dev Initializes the factory, deploys the initial `ATKVestingAirdrop` implementation,
    /// and sets up support for meta-transactions via ERC2771Context.
    /// @param systemAddress_ The address of the `IATKSystem` contract.
    /// @param initialAdmin_ The address of the initial admin.
    function initialize(address systemAddress_, address initialAdmin_) public initializer {
        _initializeAbstractSystemAddonFactory(systemAddress_, initialAdmin_);

        address forwarder = trustedForwarder();
        // Deploy the initial implementation contract for ATKVestingAirdrop.
        // The ATKVestingAirdropImplementation constructor now only calls _disableInitializers().
        ATKVestingAirdropImplementation initialImplementation = new ATKVestingAirdropImplementation(forwarder);

        atkVestingAirdropImplementation = address(initialImplementation);
        emit ImplementationUpdated(address(0), atkVestingAirdropImplementation);
    }

    /// @notice Updates the address of the `ATKVestingAirdrop` implementation contract.
    /// @dev Only callable by the factory owner. New proxies created after this call will use the new implementation.
    /// This does NOT automatically upgrade existing proxy instances.
    /// @param _newImplementation The address of the new `ATKVestingAirdrop` logic contract.
    function updateImplementation(address _newImplementation)
        external
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (_newImplementation == address(0)) revert InvalidAddress();
        if (_newImplementation == atkVestingAirdropImplementation) revert SameAddress();
        if (!IERC165(_newImplementation).supportsInterface(type(IATKVestingAirdrop).interfaceId)) {
            revert InvalidImplementation();
        }

        address oldImplementation = atkVestingAirdropImplementation;
        atkVestingAirdropImplementation = _newImplementation;
        emit ImplementationUpdated(oldImplementation, atkVestingAirdropImplementation);
    }

    /// @notice Creates and deploys a new `ATKVestingAirdropProxy` contract for a given configuration.
    /// The proxy will point to the current `atkVestingAirdropImplementation`.
    /// @dev This function performs the following steps:
    /// 1. **Authorization Check**: Verifies the caller has the `DEPLOYER_ROLE`.
    /// 2. **Salt Generation**: Computes a unique `salt` for CREATE2.
    /// 3. **Initialization Data**: Prepares the `initData` for the proxy to call `initialize` on the implementation.
    /// 4. **Proxy Deployment**: Deploys a `ATKVestingAirdropProxy` using CREATE2.
    /// 5. **Event Emission**: Emits `ATKVestingAirdropCreated`.
    /// 6. **Registry Update**: Adds the new proxy to `allAirdrops`.
    /// @param token The address of the ERC20 token to be distributed.
    /// @param root The Merkle root for verifying claims.
    /// @param owner The initial owner of the contract.
    /// @param vestingStrategy The address of the vesting strategy contract for vesting calculations.
    /// @param initializationDeadline The timestamp after which no new vesting can be initialized.
    /// @return airdropProxyAddress The address of the newly created `ATKVestingAirdropProxy` contract.
    function create(
        address token,
        bytes32 root,
        address owner,
        address vestingStrategy,
        uint256 initializationDeadline
    )
        external
        override(IATKVestingAirdropFactory)
        onlyRole(ATKSystemRoles.DEPLOYER_ROLE)
        returns (address airdropProxyAddress)
    {
        bytes memory saltInputData =
            abi.encode(address(this), token, root, owner, vestingStrategy, initializationDeadline);
        bytes memory constructorArgs =
            abi.encode(address(this), token, root, owner, vestingStrategy, initializationDeadline);
        bytes memory proxyBytecode = type(ATKVestingAirdropProxy).creationCode;

        // Predict the address first for validation
        address expectedAddress = _predictProxyAddress(proxyBytecode, constructorArgs, saltInputData);

        // Deploy using the abstract factory method
        airdropProxyAddress = _deploySystemAddon(proxyBytecode, constructorArgs, saltInputData, expectedAddress);

        // Emit an event to log the creation of the new airdrop proxy.
        emit ATKVestingAirdropCreated(airdropProxyAddress, _msgSender());

        // Add the new airdrop proxy to the list of all airdrops created by this factory.
        // Cast the proxy to IATKVestingAirdrop for storage, as the proxy behaves like one.
        allAirdrops.push(IATKVestingAirdrop(payable(airdropProxyAddress)));

        return airdropProxyAddress;
    }

    /// @notice Returns the total number of vesting airdrop proxy contracts created by this factory.
    function allAirdropsLength() external view override(IATKVestingAirdropFactory) returns (uint256 count) {
        return allAirdrops.length;
    }

    /// @notice Predicts the deployment address of a vesting airdrop proxy.
    /// @param token The address of the ERC20 token to be distributed.
    /// @param root The Merkle root for verifying claims.
    /// @param owner The initial owner of the contract.
    /// @param vestingStrategy The address of the vesting strategy contract for vesting calculations.
    /// @param initializationDeadline The timestamp after which no new vesting can be initialized.
    /// @return predictedAddress The predicted address of the vesting airdrop proxy.
    function predictVestingAirdropAddress(
        address token,
        bytes32 root,
        address owner,
        address vestingStrategy,
        uint256 initializationDeadline
    )
        external
        view
        override(IATKVestingAirdropFactory)
        returns (address predictedAddress)
    {
        bytes memory saltInputData =
            abi.encode(address(this), token, root, owner, vestingStrategy, initializationDeadline);
        bytes memory constructorArgs =
            abi.encode(address(this), token, root, owner, vestingStrategy, initializationDeadline);
        bytes memory proxyBytecode = type(ATKVestingAirdropProxy).creationCode;

        return _predictProxyAddress(proxyBytecode, constructorArgs, saltInputData);
    }

    /// @notice Returns the address of the current `ATKVestingAirdrop` logic contract (implementation).
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AbstractATKSystemAddonFactoryImplementation)
        returns (bool)
    {
        return interfaceId == type(IATKVestingAirdropFactory).interfaceId || super.supportsInterface(interfaceId);
    }
}
