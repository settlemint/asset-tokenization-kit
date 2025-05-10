// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// SMART Protocol Dependencies
import { SMARTCompliance } from "smart-protocol/contracts/SMARTCompliance.sol";
import { SMARTIdentityRegistryStorage } from "smart-protocol/contracts/SMARTIdentityRegistryStorage.sol";
import { SMARTIdentityFactory } from "smart-protocol/contracts/SMARTIdentityFactory.sol";
import { SMARTIdentityRegistry } from "smart-protocol/contracts/SMARTIdentityRegistry.sol";
import { SMARTTrustedIssuersRegistry } from "smart-protocol/contracts/SMARTTrustedIssuersRegistry.sol";
import { ISMARTComplianceModule } from "smart-protocol/contracts/interface/ISMARTComplianceModule.sol";

// Local Contracts
import { SMARTTokenRegistry } from "./SMARTTokenRegistry.sol";

// OpenZeppelin Contracts
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

// --- Custom Errors ---
error SMARTDeploymentAlreadyRegistered();
error InvalidSMARTComplianceAddress();
error InvalidSMARTIdentityRegistryStorageAddress();
error InvalidSMARTIdentityFactoryAddress();
error InvalidSMARTIdentityRegistryAddress();
error InvalidSMARTTrustedIssuersRegistryAddress();
error CoreDependenciesNotRegistered();
error InvalidModuleAddress();
error ModuleAlreadyRegistered();
error InvalidTokenRegistryAddress();
error TokenRegistryTypeAlreadyRegistered(bytes32 typeHash);
error TokenRegistryAddressAlreadyUsed(address registryAddress);

/**
 * @title SMARTDeploymentRegistry
 * @author Your Organization
 * @notice This contract allows for the registration of a SMART protocol deployment and supports meta-transactions via
 * ERC2771.
 *         The deployer of this contract receives DEFAULT_ADMIN_ROLE for overall contract administration.
 *         The first address to successfully call `registerDeployment` receives DEPLOYMENT_OWNER_ROLE.
 *         DEPLOYMENT_OWNER_ROLE is self-administering, meaning holders of this role can grant/revoke it to others.
 * @dev Utilizes AccessControl for permissioning and ERC2771Context for meta-transaction support.
 *      Core dependency addresses are stored upon registration.
 */
contract SMARTDeploymentRegistry is AccessControl, ERC2771Context {
    // --- Roles ---
    bytes32 public constant DEPLOYMENT_OWNER_ROLE = keccak256("DEPLOYMENT_OWNER_ROLE");

    // --- State Variables ---
    bool public areDependenciesRegistered;
    address public deploymentRegistrar; // Address that performed the current active registration
    uint256 public registrationTimestamp;

    // Core SMART Protocol Contract Instances
    SMARTCompliance public smartComplianceContract;
    SMARTIdentityRegistryStorage public smartIdentityRegistryStorageContract;
    SMARTIdentityFactory public smartIdentityFactoryContract;
    SMARTIdentityRegistry public smartIdentityRegistryContract;
    SMARTTrustedIssuersRegistry public smartTrustedIssuersRegistryContract;

    // Compliance Modules
    ISMARTComplianceModule[] public complianceModules;
    mapping(address => bool) public isComplianceModuleRegistered;

    // Token Registries by Type
    mapping(bytes32 => address) public tokenRegistriesByType;
    mapping(address => bool) public isTokenRegistryAddressUsed;
    bytes32[] private allRegistryTypeHashes;

    // --- Events ---
    /// @notice Emitted when a SMART deployment is registered.
    /// @param registrar The address of the registrar.
    /// @param timestamp The timestamp of the registration.
    /// @param complianceAddress The address of the SMARTCompliance contract.
    /// @param identityRegistryStorageAddress The address of the SMARTIdentityRegistryStorage contract.
    /// @param identityFactoryAddress The address of the SMARTIdentityFactory contract.
    event SMARTDeploymentRegistered(
        address indexed registrar,
        uint256 timestamp,
        address complianceAddress,
        address identityRegistryStorageAddress,
        address identityFactoryAddress,
        address identityRegistryAddress,
        address trustedIssuersRegistryAddress
    );

    /// @notice Emitted when a compliance module is registered.
    /// @param registrar The address of the registrar.
    /// @param moduleAddress The address of the compliance module.
    /// @param timestamp The timestamp of the registration.
    event SMARTComplianceModuleRegistered(address indexed registrar, address indexed moduleAddress, uint256 timestamp);

    /// @notice Emitted when a deployment is reset.
    /// @param resetBy The address of the resetter.
    /// @param timestamp The timestamp of the reset.
    event SMARTDeploymentReset(address indexed resetBy, uint256 timestamp);

    /// @notice Emitted when a token registry is registered.
    /// @param registrar The address of the registrar.
    /// @param typeName The type name of the token registry.
    /// @param registryTypeHash The type hash of the token registry.
    /// @param registryAddress The address of the token registry.
    /// @param timestamp The timestamp of the registration.
    event SMARTTokenRegistryRegistered(
        address indexed registrar,
        string typeName,
        bytes32 indexed registryTypeHash,
        address indexed registryAddress,
        uint256 timestamp
    );

    // --- Constructor ---
    /**
     * @notice Initializes the contract, sets up roles, and configures the trusted forwarder for ERC2771.
     * @dev The deployer (_msgSender()) is granted DEFAULT_ADMIN_ROLE.
     *      DEPLOYMENT_OWNER_ROLE is set to be administered by DEPLOYMENT_OWNER_ROLE itself.
     * @param trustedForwarder_ The address of the ERC2771 trusted forwarder contract.
     */
    constructor(address trustedForwarder_) ERC2771Context(trustedForwarder_) {
        // _grantRole(DEFAULT_ADMIN_ROLE, _msgSender()); // TODO: this contract is predeployed and we do not use the
        // DEFAULT_ADMIN_ROLE
        _setRoleAdmin(DEPLOYMENT_OWNER_ROLE, DEPLOYMENT_OWNER_ROLE);
    }

    // --- Registration Functions ---

    /**
     * @notice Registers deployed instances of core SMART protocol dependencies.
     *         Can be called by any address if no deployment is currently registered.
     *         The caller (_msgSender()) is granted DEPLOYMENT_OWNER_ROLE for this registration.
     * @dev Emits SMARTDeploymentRegistered.
     * @param _complianceContract Instance of SMARTCompliance.
     * @param _identityRegistryStorageContract Instance of SMARTIdentityRegistryStorage.
     * @param _identityFactoryContract Instance of SMARTIdentityFactory.
     * @param _identityRegistryContract Instance of SMARTIdentityRegistry.
     * @param _trustedIssuersRegistryContract Instance of SMARTTrustedIssuersRegistry.
     */
    function registerDeployment(
        SMARTCompliance _complianceContract,
        SMARTIdentityRegistryStorage _identityRegistryStorageContract,
        SMARTIdentityFactory _identityFactoryContract,
        SMARTIdentityRegistry _identityRegistryContract,
        SMARTTrustedIssuersRegistry _trustedIssuersRegistryContract
    )
        external
    {
        if (areDependenciesRegistered) revert SMARTDeploymentAlreadyRegistered();
        if (address(_complianceContract) == address(0)) revert InvalidSMARTComplianceAddress();
        if (address(_identityRegistryStorageContract) == address(0)) {
            revert InvalidSMARTIdentityRegistryStorageAddress();
        }
        if (address(_identityFactoryContract) == address(0)) revert InvalidSMARTIdentityFactoryAddress();
        if (address(_identityRegistryContract) == address(0)) revert InvalidSMARTIdentityRegistryAddress();
        if (address(_trustedIssuersRegistryContract) == address(0)) revert InvalidSMARTTrustedIssuersRegistryAddress();

        address sender = _msgSender();

        areDependenciesRegistered = true;
        deploymentRegistrar = sender;
        registrationTimestamp = block.timestamp;

        smartComplianceContract = _complianceContract;
        smartIdentityRegistryStorageContract = _identityRegistryStorageContract;
        smartIdentityFactoryContract = _identityFactoryContract;
        smartIdentityRegistryContract = _identityRegistryContract;
        smartTrustedIssuersRegistryContract = _trustedIssuersRegistryContract;

        _grantRole(DEPLOYMENT_OWNER_ROLE, sender);

        emit SMARTDeploymentRegistered(
            sender,
            block.timestamp,
            address(_complianceContract),
            address(_identityRegistryStorageContract),
            address(_identityFactoryContract),
            address(_identityRegistryContract),
            address(_trustedIssuersRegistryContract)
        );
    }

    /**
     * @notice Registers a compliance module.
     * @dev Requires DEPLOYMENT_OWNER_ROLE. Emits SMARTComplianceModuleRegistered.
     *      Uses _msgSender() for role checks and event emission due to ERC2771Context.
     * @param _module Instance of the compliance module (must implement ISMARTComplianceModule).
     */
    function registerComplianceModule(ISMARTComplianceModule _module) external onlyRole(DEPLOYMENT_OWNER_ROLE) {
        if (!areDependenciesRegistered) revert CoreDependenciesNotRegistered();
        if (address(_module) == address(0)) revert InvalidModuleAddress();
        if (isComplianceModuleRegistered[address(_module)]) revert ModuleAlreadyRegistered();

        isComplianceModuleRegistered[address(_module)] = true;
        complianceModules.push(_module);

        emit SMARTComplianceModuleRegistered(_msgSender(), address(_module), block.timestamp);
    }

    /**
     * @notice Registers a SMARTTokenRegistry instance for a specific type name (e.g., "Bond", "Equity").
     * @dev Requires DEPLOYMENT_OWNER_ROLE. Emits SMARTTokenRegistryRegistered.
     *      The type name is hashed for internal storage.
     *      A registry address can only be registered once.
     *      A type name can only be registered once.
     * @param _typeName The human-readable type of the token registry (e.g., "Bond", "Equity").
     * @param _registryAddress The address of the deployed SMARTTokenRegistry contract.
     */
    function registerTokenRegistry(
        string calldata _typeName,
        SMARTTokenRegistry _registryAddress
    )
        external
        onlyRole(DEPLOYMENT_OWNER_ROLE)
    {
        if (!areDependenciesRegistered) revert CoreDependenciesNotRegistered();
        if (address(_registryAddress) == address(0)) revert InvalidTokenRegistryAddress();

        bytes32 registryTypeHash = keccak256(abi.encodePacked(_typeName));

        if (tokenRegistriesByType[registryTypeHash] != address(0)) {
            revert TokenRegistryTypeAlreadyRegistered(registryTypeHash);
        }
        if (isTokenRegistryAddressUsed[address(_registryAddress)]) {
            revert TokenRegistryAddressAlreadyUsed(address(_registryAddress));
        }

        tokenRegistriesByType[registryTypeHash] = address(_registryAddress);
        isTokenRegistryAddressUsed[address(_registryAddress)] = true;
        allRegistryTypeHashes.push(registryTypeHash);

        emit SMARTTokenRegistryRegistered(
            _msgSender(), _typeName, registryTypeHash, address(_registryAddress), block.timestamp
        );
    }

    // --- Management Functions ---

    /**
     * @notice Resets the current deployment registration, clearing all associated data.
     *         Allows a new call to `registerDeployment`.
     * @dev Requires DEPLOYMENT_OWNER_ROLE. Emits SMARTDeploymentReset.
     *      Uses _msgSender() for role checks and event emission due to ERC2771Context.
     *      Note: This does not automatically revoke DEPLOYMENT_OWNER_ROLE from the caller or others.
     *            Role management is handled separately by DEFAULT_ADMIN_ROLE holders.
     */
    function resetDeployment() external onlyRole(DEPLOYMENT_OWNER_ROLE) {
        areDependenciesRegistered = false;
        deploymentRegistrar = address(0);
        registrationTimestamp = 0;

        smartComplianceContract = SMARTCompliance(address(0));
        smartIdentityRegistryStorageContract = SMARTIdentityRegistryStorage(address(0));
        smartIdentityFactoryContract = SMARTIdentityFactory(address(0));
        smartIdentityRegistryContract = SMARTIdentityRegistry(address(0));
        smartTrustedIssuersRegistryContract = SMARTTrustedIssuersRegistry(address(0));

        uint256 complianceModulesLength = complianceModules.length;
        for (uint256 i = 0; i < complianceModulesLength; i++) {
            isComplianceModuleRegistered[address(complianceModules[i])] = false;
        }
        delete complianceModules;

        // Reset token registries
        uint256 allRegistryTypeHashesLength = allRegistryTypeHashes.length;
        for (uint256 i = 0; i < allRegistryTypeHashesLength; i++) {
            bytes32 typeHash = allRegistryTypeHashes[i];
            address registryAddress = tokenRegistriesByType[typeHash];
            if (registryAddress != address(0)) {
                isTokenRegistryAddressUsed[registryAddress] = false;
                tokenRegistriesByType[typeHash] = address(0);
            }
        }
        delete allRegistryTypeHashes;

        emit SMARTDeploymentReset(_msgSender(), block.timestamp);
    }

    // --- Role Management (DEPLOYMENT_OWNER_ROLE) ---

    /**
     * @notice Grants DEPLOYMENT_OWNER_ROLE to an account.
     * @dev Requires the caller to also have DEPLOYMENT_OWNER_ROLE.
     * @param account The address to grant the role to.
     */
    function grantDeploymentOwnerRole(address account) external onlyRole(DEPLOYMENT_OWNER_ROLE) {
        grantRole(DEPLOYMENT_OWNER_ROLE, account);
    }

    /**
     * @notice Revokes DEPLOYMENT_OWNER_ROLE from an account.
     * @dev Requires the caller to also have DEPLOYMENT_OWNER_ROLE.
     * @param account The address to revoke the role from.
     */
    function revokeDeploymentOwnerRole(address account) external onlyRole(DEPLOYMENT_OWNER_ROLE) {
        revokeRole(DEPLOYMENT_OWNER_ROLE, account);
    }

    /**
     * @notice Allows an account to renounce its own DEPLOYMENT_OWNER_ROLE.
     *      Uses _msgSender() to identify the renouncing account.
     */
    function renounceDeploymentOwnerRole() external {
        renounceRole(DEPLOYMENT_OWNER_ROLE, _msgSender());
    }

    // --- View Functions ---

    /**
     * @notice Returns the list of registered compliance module instances.
     * @return Array of ISMARTComplianceModule instances.
     */
    function getRegisteredComplianceModules() external view returns (ISMARTComplianceModule[] memory) {
        return complianceModules;
    }

    /**
     * @notice Retrieves the address of a registered SMARTTokenRegistry by its type name.
     * @param _typeName The human-readable type of the token registry (e.g., "Bond").
     * @return The address of the SMARTTokenRegistry contract, or address(0) if not found.
     */
    function getTokenRegistryByType(string calldata _typeName) external view returns (SMARTTokenRegistry) {
        bytes32 registryTypeHash = keccak256(abi.encodePacked(_typeName));
        return SMARTTokenRegistry(tokenRegistriesByType[registryTypeHash]);
    }

    /**
     * @notice Checks if an address has the DEPLOYMENT_OWNER_ROLE.
     * @param account The address to check.
     * @return True if the account has the role, false otherwise.
     */
    function isDeploymentOwner(address account) external view returns (bool) {
        return hasRole(DEPLOYMENT_OWNER_ROLE, account);
    }

    /**
     * @notice Checks if an address has the DEFAULT_ADMIN_ROLE.
     * @param account The address to check.
     * @return True if the account has the role, false otherwise.
     */
    function isAdmin(address account) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    // --- ERC2771Context Overrides ---

    /// @dev Overrides the default implementation of _msgSender() to return the actual sender
    ///      instead of the forwarder address when using ERC2771 context.
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return super._msgSender();
    }

    /// @dev Overrides the default implementation of _msgData() to return the actual calldata
    ///      instead of the forwarder calldata when using ERC2771 context.
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    /// @dev Overrides the default implementation of _contextSuffixLength() to return the actual suffix length
    ///      instead of the forwarder suffix length when using ERC2771 context.
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }
}
