// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin Contracts
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";

// Interfaces
import { IATKSystem } from "../IATKSystem.sol";
import { IATKCompliance } from "../compliance/IATKCompliance.sol";
import { IWithTypeIdentifier } from "./../../smart/interface/IWithTypeIdentifier.sol";
import { IATKIdentityFactory } from "../identity-factory/IATKIdentityFactory.sol";
import { ISMARTIdentityRegistry } from "../../smart/interface/ISMARTIdentityRegistry.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

// Constants
import { ATKPeopleRoles } from "../ATKPeopleRoles.sol";

// Extensions
import { ATKSystemAccessManaged } from "../access-manager/ATKSystemAccessManaged.sol";

/// @title Abstract Factory for Creating ATK System Addon Proxies
/// @author SettleMint
/// @notice This abstract contract provides common functionality for system addon factory implementations.
/// It manages implementation contracts and provides CREATE2 address prediction capabilities.
/// @dev Key features of this abstract factory:
/// - **Implementation Management**: Manages implementation contracts and allows for updating them.
/// - **CREATE2 Support**: Provides utilities for CREATE2 deployment and address prediction.
/// - **Authorization**: Access control with role-based permissions.
/// - **Registry**: Maintains tracking of deployed system addon contracts.
/// - **Meta-transactions**: Inherits `ERC2771Context` to support gasless operations.
abstract contract AbstractATKSystemAddonFactoryImplementation is
    Initializable,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    ATKSystemAccessManaged,
    IWithTypeIdentifier
{
    /// @notice Error thrown when a CREATE2 address is already deployed.
    error AddressAlreadyDeployed(address deployedAddress);

    /// @notice Error thrown when proxy creation fails.
    error ProxyCreationFailed();

    /// @notice The address of the `IATKSystem` contract.
    address internal _systemAddress;

    /// @notice Mapping indicating whether an system addon address was deployed by this factory.
    /// @dev Stores a boolean value for each system addon address, true if deployed by this factory.
    mapping(address systemAddonAddress => bool isFactorySystemAddon) public isFactorySystemAddon;

    /// @notice Emitted when a contract identity is registered for an addon
    /// @param factory The address of the factory that registered the identity
    /// @param contractAddress The address of the addon contract
    event ContractIdentityRegistered(address indexed factory, address indexed contractAddress);

    /// @notice Constructor that disables initializers and sets the trusted forwarder
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _disableInitializers();
    }

    /// @notice Initializes the abstract airdrop factory.
    /// @dev Sets up access control and system address.
    /// @param accessManager The address of the access manager
    /// @param systemAddress_ The address of the `IATKSystem` contract.
    function _initializeAbstractSystemAddonFactory(address accessManager, address systemAddress_) internal {
        __ATKSystemAccessManaged_init(accessManager);
        __ERC165_init_unchained();

        _systemAddress = systemAddress_;
    }

    /// @notice Calculates the salt for CREATE2 deployment.
    /// @dev Can be overridden by derived contracts for custom salt calculation.
    /// @param saltInputData The ABI encoded data to be used for salt calculation.
    /// @return The calculated salt for CREATE2 deployment.
    function _calculateSalt(bytes memory saltInputData) internal view returns (bytes32) {
        return keccak256(abi.encode(address(this), saltInputData));
    }

    /// @notice Predicts the deployment address of a proxy using CREATE2.
    /// @dev Internal function to compute the address without performing deployment.
    /// @param proxyCreationCode The creation bytecode of the proxy contract.
    /// @param encodedConstructorArgs ABI-encoded constructor arguments for the proxy.
    /// @param saltInputData The ABI encoded data to be used for salt calculation.
    /// @return predictedAddress The predicted address where the proxy would be deployed.
    function _predictProxyAddress(
        bytes memory proxyCreationCode,
        bytes memory encodedConstructorArgs,
        bytes memory saltInputData
    )
        internal
        view
        returns (address predictedAddress)
    {
        bytes32 salt = _calculateSalt(saltInputData);
        bytes memory fullCreationCode = bytes.concat(proxyCreationCode, encodedConstructorArgs);
        bytes32 bytecodeHash = keccak256(fullCreationCode);
        predictedAddress = Create2.computeAddress(salt, bytecodeHash, address(this));
    }

    /// @notice Deploys a proxy contract using CREATE2.
    /// @dev This internal function handles the prediction and deployment of the system addon proxy.
    /// @param proxyCreationCode The creation bytecode of the proxy contract.
    /// @param encodedConstructorArgs ABI-encoded constructor arguments for the proxy.
    /// @param saltInputData The ABI encoded data to be used for salt calculation.
    /// @param expectedAddress The expected deployment address for validation.
    /// @return deployedAddress The address of the newly deployed proxy contract.
    function _deploySystemAddon(
        bytes memory proxyCreationCode,
        bytes memory encodedConstructorArgs,
        bytes memory saltInputData,
        address expectedAddress
    )
        internal
        onlySystemRole(ATKPeopleRoles.ADDON_MANAGER_ROLE)
        returns (address deployedAddress)
    {
        if (isFactorySystemAddon[expectedAddress]) {
            revert AddressAlreadyDeployed(expectedAddress);
        }

        bytes32 salt = _calculateSalt(saltInputData);
        bytes memory fullCreationCode = bytes.concat(proxyCreationCode, encodedConstructorArgs);

        deployedAddress = Create2.deploy(0, salt, fullCreationCode);

        if (deployedAddress != expectedAddress) {
            revert ProxyCreationFailed();
        }

        isFactorySystemAddon[deployedAddress] = true;

        // Add to compliance bypass list if available
        _addToComplianceBypassList(deployedAddress);

        return deployedAddress;
    }

    /// @notice Adds an system addon address to the compliance bypass list if available.
    /// @dev Internal helper to handle compliance bypass list registration.
    /// @param systemAddonAddress The address of the system addon contract to add.
    function _addToComplianceBypassList(address systemAddonAddress) internal {
        address complianceProxy = IATKSystem(_systemAddress).compliance();
        if (
            complianceProxy != address(0)
                && IERC165(complianceProxy).supportsInterface(type(IATKCompliance).interfaceId)
        ) {
            // Allow system addons to receive tokens
            IATKCompliance(complianceProxy).addToBypassList(systemAddonAddress);
        }
    }

    /// @notice Checks if a contract supports a given interface.
    /// @param interfaceId The interface identifier.
    /// @return bool True if the contract supports the interface, false otherwise.
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165Upgradeable) returns (bool) {
        return interfaceId == type(IATKSystemAccessManaged).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @notice Returns the address of the current message sender
    /// @dev Overridden from `Context` and `ERC2771Context` to correctly identify the transaction sender,
    /// accounting for meta-transactions if a trusted forwarder is used.
    /// @return The actual sender of the transaction (`msg.sender` or the relayed sender).
    function _msgSender() internal view override(ERC2771ContextUpgradeable, ATKSystemAccessManaged) returns (address) {
        return ERC2771ContextUpgradeable._msgSender();
    }

    /// @notice Creates a contract identity and registers it with the identity registry
    /// @dev Centralized function for addon factories to create and register contract identities
    /// @param contractAddress The address of the addon contract
    /// @param country Country code for compliance purposes
    /// @return contractIdentity The address of the created contract identity
    function _deployContractIdentity(
        address contractAddress,
        uint16 country
    )
        internal
        returns (address contractIdentity)
    {
        IATKSystem system_ = IATKSystem(_systemAddress);
        IATKIdentityFactory identityFactory_ = IATKIdentityFactory(system_.identityFactory());

        // Create the contract identity
        contractIdentity = identityFactory_.createContractIdentity(contractAddress);

        // Register the contract identity with the identity registry (same as any other identity)
        ISMARTIdentityRegistry identityRegistry = ISMARTIdentityRegistry(system_.identityRegistry());
        identityRegistry.registerIdentity(contractAddress, IIdentity(contractIdentity), country);

        // Emit registration event for indexing
        emit ContractIdentityRegistered(_msgSender(), contractAddress);

        return contractIdentity;
    }
}
