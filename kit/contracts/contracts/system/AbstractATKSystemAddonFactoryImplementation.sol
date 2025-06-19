// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// OpenZeppelin Contracts
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";

// Interfaces
import { IATKSystem } from "./IATKSystem.sol";
import { IATKCompliance } from "./compliance/IATKCompliance.sol";
import { IWithTypeIdentifier } from "./../smart/interface/IWithTypeIdentifier.sol";

// Constants
import { ATKSystemRoles } from "./ATKSystemRoles.sol";

/// @title Abstract Factory for Creating ATK System Addon Proxies
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
    AccessControlUpgradeable,
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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _disableInitializers();
    }

    /// @notice Initializes the abstract airdrop factory.
    /// @dev Sets up access control and system address.
    /// @param systemAddress_ The address of the `IATKSystem` contract.
    /// @param initialAdmin_ The address of the initial admin.
    function _initializeAbstractSystemAddonFactory(address systemAddress_, address initialAdmin_) internal {
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin_);
        _grantRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE, initialAdmin_);
        _grantRole(ATKSystemRoles.DEPLOYER_ROLE, initialAdmin_);

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
        onlyRole(ATKSystemRoles.DEPLOYER_ROLE)
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
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable, ERC165Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
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
