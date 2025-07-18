// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// OpenZeppelin Contracts
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interfaces
import { IATKVaultFactory } from "./IATKVaultFactory.sol";
import { IATKSystem } from "../../system/IATKSystem.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

// Implementations
import { AbstractATKSystemAddonFactoryImplementation } from
    "../../system/addons/AbstractATKSystemAddonFactoryImplementation.sol";
import { ATKVault } from "./ATKVault.sol";

// Constants
import { ATKSystemRoles } from "../../system/ATKSystemRoles.sol";

/// @title Factory for Creating ATKVault Proxies
/// @notice This contract serves as a factory to deploy new UUPS proxy instances of `ATKVault` contracts.
/// It manages a single implementation contract and allows for updating this implementation.
/// @dev Key features of this factory:
/// - **Deployment of Proxies**: Provides a `createVault` function to deploy new `ATKVaultProxy` instances,
///   which point to a shared `ATKVault` implementation.
/// - **CREATE2**: Leverages `CREATE2` for deploying proxies, allowing their addresses to be pre-calculated.
/// - **Implementation Management**: Deploys an initial implementation and allows the owner to update it.
/// - **Authorization**: The `createVault` function requires the `DEPLOYER_ROLE` for proper access control.
/// - **Registry**: Maintains an array `allVaults` to keep track of all vault proxies created.
/// - **Meta-transactions**: Inherits `ERC2771Context` to support gasless operations if a trusted forwarder is
/// configured.
contract ATKVaultFactoryImplementation is AbstractATKSystemAddonFactoryImplementation, IATKVaultFactory {
    bytes32 public constant override typeId = keccak256("ATKVaultFactory");

    /// @notice An array that stores references (addresses) to all vault
    /// contracts created by this factory.
    address[] private allVaults;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) AbstractATKSystemAddonFactoryImplementation(forwarder) { }

    /// @notice Initializes the `ATKVaultFactory`.
    /// @dev Initializes the factory and sets up support for meta-transactions via ERC2771Context.
    /// @param systemAddress_ The address of the `IATKSystem` contract.
    /// @param initialAdmin_ The address of the initial admin.
    function initialize(address systemAddress_, address initialAdmin_) public initializer {
        _initializeAbstractSystemAddonFactory(systemAddress_, initialAdmin_);
    }

    /// @notice Generates consistent deployment data for vault creation and address prediction
    /// @param signers Array of initial signer addresses
    /// @param required Number of confirmations required to execute a transaction
    /// @param initialOwner Address that will have admin role
    /// @param salt Salt value for deterministic address generation
    /// @return saltInputData The salt input data for CREATE2
    /// @return constructorArgs The constructor arguments for the vault
    /// @return vaultBytecode The bytecode for the vault contract
    function _getVaultDeploymentData(
        address[] memory signers,
        uint256 required,
        address initialOwner,
        bytes32 salt
    )
        private
        view
        returns (bytes memory saltInputData, bytes memory constructorArgs, bytes memory vaultBytecode)
    {
        saltInputData = abi.encode(address(this), signers, required, initialOwner, salt);

        address[] memory initialAdmins = new address[](2);
        initialAdmins[0] = initialOwner;
        initialAdmins[1] = address(this);

        constructorArgs = abi.encode(signers, required, trustedForwarder(), address(0), initialAdmins);
        vaultBytecode = type(ATKVault).creationCode;
    }

    /// @notice Creates and deploys a new `ATKVault` contract for a given configuration.
    /// @dev This function performs the following steps:
    /// 1. **Authorization Check**: Verifies the caller has the `DEPLOYER_ROLE`.
    /// 2. **Salt Generation**: Computes a unique `salt` for CREATE2.
    /// 3. **Constructor Arguments**: Prepares the constructor arguments for the ATKVault contract (without onchainId).
    /// 4. **Vault Deployment**: Deploys an `ATKVault` using CREATE2.
    /// 5. **Identity Creation**: Creates a contract identity for the vault and registers it with the identity registry.
    /// 6. **Identity Assignment**: Sets the onchainId on the vault.
    /// 7. **Event Emission**: Emits `ATKVaultCreated`.
    /// 8. **Registry Update**: Adds the new vault to `allVaults`.
    /// @param signers Array of initial signer addresses
    /// @param required Number of confirmations required to execute a transaction
    /// @param initialOwner Address that will have admin role
    /// @param salt Salt value for deterministic address generation
    /// @param country Country code for compliance purposes
    /// @return contractAddress Address of the newly created vault
    function createVault(
        address[] memory signers,
        uint256 required,
        address initialOwner,
        bytes32 salt,
        uint16 country
    )
        external
        override(IATKVaultFactory)
        onlyRole(ATKSystemRoles.DEPLOYER_ROLE)
        returns (address contractAddress)
    {
        (bytes memory saltInputData, bytes memory constructorArgs, bytes memory vaultBytecode) =
            _getVaultDeploymentData(signers, required, initialOwner, salt);

        // Predict the vault address
        address expectedAddress = _predictProxyAddress(vaultBytecode, constructorArgs, saltInputData);

        // Deploy the vault first (without onchainId)
        contractAddress = _deploySystemAddon(vaultBytecode, constructorArgs, saltInputData, expectedAddress);

        // Create contract identity for the vault
        address contractIdentity = _deployContractIdentity(contractAddress, country);

        IAccessControl(contractAddress).grantRole(ATKVault(payable(contractAddress)).GOVERNANCE_ROLE(), address(this));

        // Set the onchainId on the vault
        ATKVault(payable(contractAddress)).setOnchainId(contractIdentity);

        IAccessControl(contractAddress).renounceRole(
            ATKVault(payable(contractAddress)).GOVERNANCE_ROLE(), address(this)
        );
        IAccessControl(contractAddress).renounceRole(
            ATKVault(payable(contractAddress)).DEFAULT_ADMIN_ROLE(), address(this)
        );

        // Emit an event to log the creation of the new vault.
        emit ATKVaultCreated(_msgSender(), contractAddress, contractIdentity);

        // Add the new vault to the list of all vaults created by this factory.
        allVaults.push(contractAddress);

        return contractAddress;
    }

    /// @notice Predicts the address where an ATK Vault contract would be deployed
    /// @param signers Array of initial signer addresses
    /// @param required Number of confirmations required to execute a transaction
    /// @param initialOwner Address that will have admin role
    /// @param salt Salt value for deterministic address generation
    /// @return predictedAddress The predicted address of the vault
    function predictVaultAddress(
        address[] memory signers,
        uint256 required,
        address initialOwner,
        bytes32 salt
    )
        external
        view
        override(IATKVaultFactory)
        returns (address predictedAddress)
    {
        (bytes memory saltInputData, bytes memory constructorArgs, bytes memory vaultBytecode) =
            _getVaultDeploymentData(signers, required, initialOwner, salt);

        return _predictProxyAddress(vaultBytecode, constructorArgs, saltInputData);
    }

    /// @notice Returns the total number of vault contracts created by this factory.
    function allVaultsLength() external view returns (uint256 count) {
        return allVaults.length;
    }

    /// @notice Returns the address of the ATKVault implementation (not used in this pattern).
    /// @dev Since we deploy ATKVault contracts directly, this returns address(0).
    function atkVaultImplementation() external pure returns (address) {
        return address(0);
    }

    /// @notice Checks if a contract supports a given interface.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AbstractATKSystemAddonFactoryImplementation)
        returns (bool)
    {
        return interfaceId == type(IATKVaultFactory).interfaceId || super.supportsInterface(interfaceId);
    }
}
