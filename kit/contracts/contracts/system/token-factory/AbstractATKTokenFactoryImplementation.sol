// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IATKTokenFactory } from "./IATKTokenFactory.sol";
import { ISMART } from "../../smart/interface/ISMART.sol";
import { ATKTokenAccessManagerProxy } from "../access-manager/ATKTokenAccessManagerProxy.sol";
import { ISMARTTokenAccessManager } from "../../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ISMARTIdentityRegistry } from "../../smart/interface/ISMARTIdentityRegistry.sol";
import { ISMARTCompliance } from "../../smart/interface/ISMARTCompliance.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { IATKIdentityFactory } from "../identity-factory/IATKIdentityFactory.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";
import { ATKRoles } from "../../assets/ATKRoles.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";
import { ISMARTComplianceModule } from "../../smart/interface/ISMARTComplianceModule.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IWithTypeIdentifier } from "../../smart/interface/IWithTypeIdentifier.sol";

/// @title ATKTokenFactory - Contract for managing token registries with role-based access control
/// @author SettleMint
/// @notice This contract provides functionality for registering tokens and checking their registration status,
/// managed by roles defined in AccessControl. It also supports deploying proxy contracts using CREATE2.
/// @dev Inherits from AccessControl and ERC2771Context for role management and meta-transaction support.
/// @custom:security-contact support@settlemint.com

abstract contract AbstractATKTokenFactoryImplementation is
    ERC2771ContextUpgradeable,
    ERC165Upgradeable,
    AccessControlUpgradeable,
    IATKTokenFactory,
    IWithTypeIdentifier
{
    /// @notice Error when a predicted CREATE2 address is already marked as deployed by this factory.

    /// @notice Mapping indicating whether a token address was deployed by this factory.
    /// @dev Stores a boolean value for each token address, true if deployed by this factory.
    mapping(address tokenAddress => bool isFactoryToken) public isFactoryToken; // Added for
        // CREATE2

    /// @notice Mapping indicating whether an access manager address was deployed by this factory.
    /// @dev Stores a boolean value for each access manager address, true if deployed by this factory.
    mapping(address accessManagerAddress => bool isFactoryAccessManager) public isFactoryAccessManager;

    // --- State Variables ---

    /// @dev The address of the `IATKSystem` contract.
    address internal _systemAddress;

    /// @notice Address of the underlying token implementation contract.
    /// @dev This address points to the contract that holds the core logic for token operations.
    address internal _tokenImplementation;

    /// @notice Address of the identity verification module.
    /// @dev This address points to the contract that holds the core logic for identity verification.
    address internal _identityVerificationModule;

    /// @notice Constructor for the token factory implementation.
    /// @param forwarder The address of the trusted forwarder for meta-transactions (ERC2771).
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _disableInitializers();
    }

    /// @inheritdoc IATKTokenFactory
    /// @param systemAddress The address of the `IATKSystem` contract.
    /// @param tokenImplementation_ The initial address of the token implementation contract.
    /// @param initialAdmin The address to be granted the DEFAULT_ADMIN_ROLE and DEPLOYER_ROLE.
    /// @param identityVerificationModule The address of the identity verification module.
    function initialize(
        address systemAddress,
        address tokenImplementation_,
        address initialAdmin,
        address identityVerificationModule
    )
        public
        virtual
        override
        initializer
    {
        if (initialAdmin == address(0)) {
            revert InvalidTokenAddress(); // Re-using for admin address, consider a more specific error if needed
        }
        if (
            tokenImplementation_ == address(0)
                && IERC165(tokenImplementation_).supportsInterface(type(ISMART).interfaceId)
        ) {
            revert InvalidImplementationAddress();
        }
        if (
            identityVerificationModule == address(0)
                || !IERC165(identityVerificationModule).supportsInterface(type(ISMARTComplianceModule).interfaceId)
        ) {
            revert InvalidIdentityVerificationModuleAddress();
        }
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(ATKSystemRoles.DEPLOYER_ROLE, initialAdmin);
        _grantRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE, initialAdmin);

        _tokenImplementation = tokenImplementation_;
        _systemAddress = systemAddress;
        _identityVerificationModule = identityVerificationModule;
    }

    /// @inheritdoc IATKTokenFactory
    /// @return tokenImplementation The address of the token implementation contract.
    function tokenImplementation() public view override returns (address) {
        return _tokenImplementation;
    }

    // --- Mutative functions ---

    /// @notice Updates the address of the token implementation contract.
    /// @dev This function can only be called by an account with the DEFAULT_ADMIN_ROLE.
    ///      It allows changing the underlying contract that handles token logic.
    ///      Emits a {TokenImplementationUpdated} event on success.
    /// @param newImplementation The new address for the token implementation contract. Cannot be the zero address.
    /// @custom:oz-upgrades-unsafe-allow state-variable-assignment
    function updateTokenImplementation(address newImplementation)
        public
        virtual
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (newImplementation == address(0)) {
            revert InvalidImplementationAddress();
        }
        address oldImplementation = _tokenImplementation;
        _tokenImplementation = newImplementation;
        emit TokenImplementationUpdated(_msgSender(), oldImplementation, newImplementation);
    }

    // --- Internal Functions ---

    /// @notice Returns the identity registry contract.
    /// @return The identity registry contract.
    function _identityRegistry() internal view returns (ISMARTIdentityRegistry) {
        return ISMARTIdentityRegistry(IATKSystem(_systemAddress).identityRegistry());
    }

    /// @notice Returns the compliance contract.
    /// @return The compliance contract.
    function _compliance() internal view returns (ISMARTCompliance) {
        return ISMARTCompliance(IATKSystem(_systemAddress).compliance());
    }

    /// @notice Creates a pair for the identity verification module.
    /// @param requiredClaimTopics The required claim topics.
    /// @return The pair for the identity verification module.
    function _identityVerificationModulePair(uint256[] memory requiredClaimTopics)
        internal
        view
        returns (SMARTComplianceModuleParamPair memory)
    {
        return SMARTComplianceModuleParamPair({
            module: _identityVerificationModule,
            params: abi.encode(requiredClaimTopics)
        });
    }

    /// @notice Adds the identity verification module pair to the module pairs.
    /// @param modulePairs The module pairs.
    /// @param requiredClaimTopics The required claim topics.
    /// @return result The module pairs with the identity verification module pair added.
    function _addIdentityVerificationModulePair(
        SMARTComplianceModuleParamPair[] memory modulePairs,
        uint256[] memory requiredClaimTopics
    )
        internal
        view
        returns (SMARTComplianceModuleParamPair[] memory result)
    {
        result = new SMARTComplianceModuleParamPair[](modulePairs.length + 1);
        result[0] = _identityVerificationModulePair(requiredClaimTopics);
        for (uint256 i = 0; i < modulePairs.length; ++i) {
            result[i + 1] = modulePairs[i];
        }
        return result;
    }

    /// @notice Calculates the salt for CREATE2 deployment.
    /// @dev Can be overridden by derived contracts for custom salt calculation.
    /// @param systemAddress The system address to prevent cross-system collisions.
    /// @param saltInputData The ABI encoded data to be used for salt calculation.
    /// @return The calculated salt for CREATE2 deployment.
    function _calculateSalt(address systemAddress, bytes memory saltInputData) internal pure returns (bytes32) {
        return keccak256(abi.encode(systemAddress, saltInputData));
    }

    /// @notice Calculates the salt for CREATE2 deployment of an access manager.
    /// @dev Prepends "AccessManagerSalt" to the provided saltInputData.
    /// @param systemAddress The system address to prevent cross-system collisions.
    /// @param saltInputData The ABI encoded data to be used for salt calculation.
    /// @return The calculated salt for access manager CREATE2 deployment.
    function _calculateAccessManagerSalt(
        address systemAddress,
        bytes memory saltInputData
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(systemAddress, "AccessManagerSalt", saltInputData));
    }

    /// @notice Builds salt input data for token creation.
    /// @dev Internal helper to build the salt input for access manager and related operations.
    /// Includes the caller address to ensure unique deployments per caller.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param decimals_ The number of decimals for the token.
    /// @return The ABI encoded salt input data.
    function _buildSaltInput(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    )
        internal
        pure
        returns (bytes memory)
    {
        return abi.encode(name_, symbol_, decimals_);
    }

    /// @notice Prepares the data required for access manager creation using CREATE2.
    /// @dev Internal helper function to calculate salt and full creation code.
    /// @param accessManagerSaltInputData The ABI encoded data to be used for salt calculation for the access manager.
    /// @param initialAdmin The address to be set as the initial admin of the access manager.
    /// @return salt The calculated salt for CREATE2 deployment.
    /// @return fullCreationCode The complete bytecode for deploying the access manager.
    function _prepareAccessManagerCreationData(
        bytes memory accessManagerSaltInputData,
        address initialAdmin
    )
        internal
        view
        returns (bytes32 salt, bytes memory fullCreationCode)
    {
        salt = _calculateAccessManagerSalt(_systemAddress, accessManagerSaltInputData);
        address[] memory initialAdmins = new address[](2);
        initialAdmins[0] = initialAdmin;
        initialAdmins[1] = address(this); // Add the factory as an initial admin to allow the access manager to be
            // upgraded
        bytes memory constructorArgs = abi.encode(_systemAddress, initialAdmins);
        bytes memory bytecode = type(ATKTokenAccessManagerProxy).creationCode;
        fullCreationCode = bytes.concat(bytecode, constructorArgs);
    }

    /// @notice Predicts the deployment address of an access manager using CREATE2.
    /// @param accessManagerSaltInputData The ABI encoded data to be used for salt calculation for the access manager.
    /// @return predictedAddress The predicted address where the access manager would be deployed.
    function _predictAccessManagerAddress(bytes memory accessManagerSaltInputData)
        internal
        view
        returns (address predictedAddress)
    {
        // Use _msgSender() as the initial admin to match actual deployment behavior
        (bytes32 salt, bytes memory fullCreationCode) =
            _prepareAccessManagerCreationData(accessManagerSaltInputData, _msgSender());
        bytes32 bytecodeHash = keccak256(fullCreationCode);
        predictedAddress = Create2.computeAddress(salt, bytecodeHash, address(this));
        return predictedAddress;
    }

    /// @notice Creates a new access manager for a token using CREATE2.
    /// @dev Deploys SMARTTokenAccessManagerProxy with a deterministic address.
    /// @param accessManagerSaltInputData The ABI encoded data to be used for salt calculation for the access manager.
    /// @return accessManager The instance of the newly created access manager.
    function _createAccessManager(bytes memory accessManagerSaltInputData)
        internal
        virtual
        onlyRole(ATKSystemRoles.DEPLOYER_ROLE)
        returns (ISMARTTokenAccessManager)
    {
        // Calculate salt and creation code once
        (bytes32 salt, bytes memory fullCreationCode) =
            _prepareAccessManagerCreationData(accessManagerSaltInputData, _msgSender());

        // Predict address using the same parameters that will be used for deployment
        address predictedAccessManagerAddress = _predictAccessManagerAddress(accessManagerSaltInputData);

        if (isFactoryAccessManager[predictedAccessManagerAddress]) {
            revert AccessManagerAlreadyDeployed(predictedAccessManagerAddress);
        }

        address deployedAddress = Create2.deploy(0, salt, fullCreationCode);

        if (deployedAddress != predictedAccessManagerAddress) {
            revert ProxyCreationFailed(); // Could be more specific: AccessManagerCreationFailed
        }

        isFactoryAccessManager[deployedAddress] = true;
        ISMARTTokenAccessManager accessManager = ISMARTTokenAccessManager(deployedAddress);

        return accessManager;
    }

    /// @notice Deploys a proxy contract using CREATE2.
    /// @dev This internal function handles the prediction and deployment of the asset proxy.
    ///      The proxy is deployed uninitialized, pointing to the current `_tokenImplementation`.
    /// @param proxyCreationCode The creation bytecode of the proxy contract.
    /// @param encodedConstructorArgs ABI-encoded constructor arguments for the proxy.
    /// @param tokenSaltInputData The ABI encoded data to be used for salt calculation for the token.
    /// @param accessManager The address of the access manager.
    /// @param description Human-readable description of the contract for indexing.
    /// @param country The country code for the contract identity.
    /// @return deployedAddress The address of the newly deployed proxy contract.
    /// @return deployedTokenIdentityAddress The address of the deployed contract identity.
    function _deployToken(
        bytes memory proxyCreationCode,
        bytes memory encodedConstructorArgs,
        bytes memory tokenSaltInputData,
        address accessManager,
        string memory description,
        uint16 country
    )
        internal
        onlyRole(ATKSystemRoles.DEPLOYER_ROLE)
        returns (address deployedAddress, address deployedTokenIdentityAddress)
    {
        // Combine calculation to reduce stack variables
        bytes32 salt = _calculateSalt(_systemAddress, tokenSaltInputData);

        // Calculate predicted address inline to reduce stack depth
        address predictedAddress = Create2.computeAddress(
            salt, keccak256(bytes.concat(proxyCreationCode, encodedConstructorArgs)), address(this)
        );

        if (isFactoryToken[predictedAddress]) {
            revert AddressAlreadyDeployed(predictedAddress);
        }

        deployedAddress = Create2.deploy(0, salt, bytes.concat(proxyCreationCode, encodedConstructorArgs));

        if (deployedAddress != predictedAddress) {
            revert ProxyCreationFailed();
        }

        isFactoryToken[deployedAddress] = true;

        // Create identity using simple address-based approach - no complex salt needed
        deployedTokenIdentityAddress = _deployContractIdentity(deployedAddress, description, country);

        // Grant the factory the GOVERNANCE_ROLE to allow it to upgrade the onchain ID
        ISMARTTokenAccessManager(accessManager).grantRole(ATKRoles.GOVERNANCE_ROLE, address(this));

        // Set the onchain ID on the token contract
        ISMART(deployedAddress).setOnchainID(deployedTokenIdentityAddress);

        bytes32[] memory roles = new bytes32[](2);
        roles[0] = ATKRoles.GOVERNANCE_ROLE;
        roles[1] = ATKRoles.DEFAULT_ADMIN_ROLE;
        ISMARTTokenAccessManager(accessManager).renounceMultipleRoles(roles, address(this));

        emit TokenAssetCreated(
            _msgSender(),
            deployedAddress,
            deployedTokenIdentityAddress,
            ISMART(deployedAddress).registeredInterfaces(),
            accessManager
        );

        return (deployedAddress, deployedTokenIdentityAddress);
    }

    /// @notice Predicts the deployment address of a proxy using CREATE2.
    /// @dev Internal function to compute the address without performing deployment.
    ///      Assumes the proxy constructor takes (address _logic, bytes memory _data).
    /// @param proxyCreationCode The creation bytecode of the proxy contract.
    /// @param encodedConstructorArgs ABI-encoded constructor arguments for the proxy.
    /// @param tokenSaltInputData The ABI encoded data to be used for salt calculation for the token.
    /// @return predictedAddress The predicted address where the proxy would be deployed.
    function _predictProxyAddress(
        bytes memory proxyCreationCode,
        bytes memory encodedConstructorArgs,
        bytes memory tokenSaltInputData
    )
        internal
        view
        returns (address predictedAddress)
    {
        bytes32 salt = _calculateSalt(_systemAddress, tokenSaltInputData);
        bytes memory fullCreationCode = bytes.concat(proxyCreationCode, encodedConstructorArgs);
        bytes32 bytecodeHash = keccak256(fullCreationCode);
        predictedAddress = Create2.computeAddress(salt, bytecodeHash, address(this));
    }

    /// @notice Finalizes the token creation process after deployment and initialization.
    /// @dev Sets up contract identity, on-chain ID, and necessary roles.
    /// @param contractAddress The address of the deployed contract (proxy).
    /// @param description Human-readable description of the contract.
    /// @param country The numeric country code (ISO 3166-1 alpha-2 standard) representing the contract's jurisdiction.
    /// @return The address of the deployed contract identity.
    function _deployContractIdentity(
        address contractAddress,
        string memory description,
        uint16 country
    )
        internal
        returns (address)
    {
        // Create the contract identity using simple address-based salt
        address contractIdentity =
            IATKIdentityFactory(IATKSystem(_systemAddress).identityFactory()).createContractIdentity(contractAddress);

        // Register the contract identity with the identity registry (same as any other identity)
        ISMARTIdentityRegistry(IATKSystem(_systemAddress).identityRegistry()).registerIdentity(
            contractAddress, IIdentity(contractIdentity), country
        );

        // Emit registration event for indexing
        emit ContractIdentityRegistered(_msgSender(), contractAddress, description);

        return contractIdentity;
    }

    // --- ERC165 Overrides ---

    /// @notice Checks if the contract supports a specific interface
    /// @param interfaceId The interface identifier to check
    /// @return True if the interface is supported, false otherwise
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable, ERC165Upgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IATKTokenFactory).interfaceId || super.supportsInterface(interfaceId);
    }

    // --- ERC2771Context Overrides ---

    /// @notice Returns the address of the current message sender
    /// @dev Overrides the default implementation of _msgSender() to return the actual sender
    ///      instead of the forwarder address when using ERC2771 context.
    /// @return The address of the message sender
    function _msgSender() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address) {
        return super._msgSender();
    }

    /// @notice Returns the calldata of the current message
    /// @dev Overrides the default implementation of _msgData() to return the actual calldata
    ///      instead of the forwarder calldata when using ERC2771 context.
    /// @return The calldata of the message
    function _msgData()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    /// @notice Returns the length of the context suffix in the calldata
    /// @dev Overrides the default implementation of _contextSuffixLength() to return the actual suffix length
    ///      instead of the forwarder suffix length when using ERC2771 context.
    /// @return The length of the context suffix
    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength();
    }
}
