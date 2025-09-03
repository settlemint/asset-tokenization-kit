// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IATKTokenFactory } from "./IATKTokenFactory.sol";
import { ISMART } from "../../../smart/interface/ISMART.sol";
import { ATKTokenAccessManagerProxy } from "../access/ATKTokenAccessManagerProxy.sol";
import { ISMARTTokenAccessManager } from "../../../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ISMARTIdentityRegistry } from "../../../smart/interface/ISMARTIdentityRegistry.sol";
import { ISMARTCompliance } from "../../../smart/interface/ISMARTCompliance.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IATKSystem } from "../../IATKSystem.sol";
import { IATKIdentityFactory } from "../../identity-factory/IATKIdentityFactory.sol";
import { ATKPeopleRoles } from "../../ATKPeopleRoles.sol";
import { ATKRoles } from "../../ATKRoles.sol";
import { ATKAssetRoles } from "../../../assets/ATKAssetRoles.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";
import { IWithTypeIdentifier } from "../../../smart/interface/IWithTypeIdentifier.sol";
import { ATKSystemAccessManaged } from "../../access-manager/ATKSystemAccessManaged.sol";
import { IATKSystemAccessManaged } from "../../access-manager/IATKSystemAccessManaged.sol";
import { ATKTopics } from "../../ATKTopics.sol";
import { IATKTopicSchemeRegistry } from "../../topic-scheme-registry/IATKTopicSchemeRegistry.sol";
import { TokenTrustedIssuersRegistry } from "../trusted-issuers-registry/TokenTrustedIssuersRegistry.sol";
import { IATKTrustedIssuersMetaRegistry } from "../../trusted-issuers-registry/IATKTrustedIssuersMetaRegistry.sol";
import { IATKTrustedIssuersRegistry } from "../../trusted-issuers-registry/IATKTrustedIssuersRegistry.sol";

/// @title ATKTokenFactory - Contract for managing token registries with role-based access control
/// @author SettleMint
/// @notice This contract provides functionality for registering tokens and checking their registration status,
/// managed by roles defined in AccessControl. It also supports deploying proxy contracts using CREATE2.
/// @dev Inherits from AccessControl and ERC2771Context for role management and meta-transaction support.
/// @custom:security-contact support@settlemint.com

abstract contract AbstractATKTokenFactoryImplementation is
    ERC2771ContextUpgradeable,
    ERC165Upgradeable,
    ATKSystemAccessManaged,
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

    /// @notice Constructor for the token factory implementation.
    /// @param forwarder The address of the trusted forwarder for meta-transactions (ERC2771).
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _disableInitializers();
    }

    /// @inheritdoc IATKTokenFactory
    /// @param accessManager The address of the access manager
    /// @param systemAddress The address of the `IATKSystem` contract.
    /// @param tokenImplementation_ The initial address of the token implementation contract.
    function initialize(
        address accessManager,
        address systemAddress,
        address tokenImplementation_
    )
        public
        virtual
        override
        initializer
    {
        if (
            tokenImplementation_ == address(0)
                || !IERC165(tokenImplementation_).supportsInterface(type(ISMART).interfaceId)
        ) {
            revert InvalidImplementationAddress();
        }

        __ATKSystemAccessManaged_init(accessManager);
        __ERC165_init_unchained();

        _tokenImplementation = tokenImplementation_;
        _systemAddress = systemAddress;
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
        onlySystemRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE)
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

    /// @notice Returns the trusted issuers meta registry contract.
    /// @return The trusted issuers meta registry contract.
    function _trustedIssuersRegistry() internal view returns (IATKTrustedIssuersRegistry) {
        return IATKTrustedIssuersRegistry(IATKSystem(_systemAddress).trustedIssuersRegistry());
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
        onlySystemRole(ATKPeopleRoles.TOKEN_MANAGER_ROLE)
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
        onlySystemRole(ATKPeopleRoles.TOKEN_MANAGER_ROLE)
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
        ISMARTTokenAccessManager(accessManager).grantRole(ATKAssetRoles.GOVERNANCE_ROLE, address(this));
        ISMARTTokenAccessManager(accessManager).grantRole(ATKRoles.DEFAULT_ADMIN_ROLE, address(this));

        // Set the onchain ID on the token contract
        ISMART(deployedAddress).setOnchainID(deployedTokenIdentityAddress);

        // Deploy and register TokenTrustedIssuersRegistry for this token
        _deployAndRegisterTokenTrustedIssuersRegistry(deployedAddress, deployedTokenIdentityAddress);

        bytes32[] memory roles = new bytes32[](2);
        roles[0] = ATKAssetRoles.GOVERNANCE_ROLE;
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
    /// @dev Sets up contract identity, on-chain ID, and necessary roles. Also issues TOPIC_ISSUER claim.
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
        IATKSystem system = IATKSystem(_systemAddress);

        // Create the contract identity using simple address-based salt
        address contractIdentity = IATKIdentityFactory(system.identityFactory()).createContractIdentity(contractAddress);

        // Register the contract identity with the identity registry (same as any other identity)
        ISMARTIdentityRegistry(system.identityRegistry()).registerIdentity(
            contractAddress, IIdentity(contractIdentity), country
        );

        // Issue TOPIC_ASSET_ISSUER claim to link the asset to its issuer
        address organisationIdentity = system.organisationIdentity();

        if (organisationIdentity != address(0)) {
            uint256 topicId =
                IATKTopicSchemeRegistry(system.topicSchemeRegistry()).getTopicId(ATKTopics.TOPIC_ASSET_ISSUER);
            bytes memory claimData = abi.encode(organisationIdentity);

            // Call the system function to issue the organisation claim
            // This is necessary because only the system contract can manage claims on the organisation identity
            system.issueClaimByOrganisation(contractIdentity, topicId, claimData);
        }

        // Emit registration event for indexing
        emit ContractIdentityRegistered(_msgSender(), contractAddress, description);

        return contractIdentity;
    }

    /// @notice Deploys a TokenTrustedIssuersRegistry for a token and registers it with the meta registry
    /// @dev This function creates a token-specific trusted issuers registry and registers it
    ///      with the system's meta registry, enabling token-specific trusted issuer management
    /// @param tokenAddress The address of the token contract
    /// @param tokenIdentityAddress The address of the token identity contract
    function _deployAndRegisterTokenTrustedIssuersRegistry(address tokenAddress, address tokenIdentityAddress) internal {
        // Register the token-specific registry with the meta registry
        IATKTrustedIssuersRegistry registry = _trustedIssuersRegistry();

        if (IERC165(address(registry)).supportsInterface(type(IATKTrustedIssuersMetaRegistry).interfaceId)) {
            IATKTrustedIssuersMetaRegistry metaRegistry = IATKTrustedIssuersMetaRegistry(address(registry));
            // Deploy TokenTrustedIssuersRegistry for this specific token
            // Use the same trusted forwarder as the factory for consistent meta-transaction support
            TokenTrustedIssuersRegistry tokenRegistry = new TokenTrustedIssuersRegistry(
                trustedForwarder(), // Use factory's trusted forwarder for token registries
                tokenAddress
            );

            metaRegistry.setRegistryForContract(tokenIdentityAddress, address(tokenRegistry));
        }
    }

    // --- ERC165 Overrides ---

    /// @notice Checks if the contract supports a specific interface
    /// @param interfaceId The interface identifier to check
    /// @return True if the interface is supported, false otherwise
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IATKTokenFactory).interfaceId
            || interfaceId == type(IATKSystemAccessManaged).interfaceId || super.supportsInterface(interfaceId);
    }

    // --- ERC2771Context Overrides ---

    /// @notice Returns the address of the current message sender
    /// @dev Overrides the default implementation of _msgSender() to return the actual sender
    ///      instead of the forwarder address when using ERC2771 context.
    /// @return The address of the message sender
    function _msgSender() internal view override(ERC2771ContextUpgradeable, ATKSystemAccessManaged) returns (address) {
        return ERC2771ContextUpgradeable._msgSender();
    }
}
