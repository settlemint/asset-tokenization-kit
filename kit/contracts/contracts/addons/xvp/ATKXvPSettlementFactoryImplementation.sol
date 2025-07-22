// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { ATKXvPSettlementImplementation } from "./ATKXvPSettlementImplementation.sol";
import { IATKXvPSettlement } from "./IATKXvPSettlement.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IATKXvPSettlementFactory } from "./IATKXvPSettlementFactory.sol";
import { IWithTypeIdentifier } from "../../smart/interface/IWithTypeIdentifier.sol";
import { AbstractATKSystemAddonFactoryImplementation } from
    "../../system/addons/AbstractATKSystemAddonFactoryImplementation.sol";
import { ATKXvPSettlementProxy } from "./ATKXvPSettlementProxy.sol";
import { ATKSystemRoles } from "../../system/ATKSystemRoles.sol";
import { IATKSystem } from "../../system/IATKSystem.sol";
import { IATKCompliance } from "../../system/compliance/IATKCompliance.sol";

/// @title ATKXvPSettlementFactoryImplementation - A factory contract for creating XvPSettlement contracts
/// @author SettleMint
/// @notice This contract allows the creation of new XvPSettlement contracts with deterministic addresses using CREATE2.
/// @dev Inherits from ERC2771ContextUpgradeable for meta-transaction support and AccessControlUpgradeable for role
/// management.
/// Uses CREATE2 for deterministic deployment addresses and maintains a registry of deployed settlement contracts.
/// @custom:security-contact support@settlemint.com
contract ATKXvPSettlementFactoryImplementation is
    AbstractATKSystemAddonFactoryImplementation,
    IATKXvPSettlementFactory
{
    bytes32 public constant override(IATKXvPSettlementFactory, IWithTypeIdentifier) typeId =
        keccak256("ATKXvPSettlementFactory");

    /// @notice Custom errors for the XvPSettlementFactory contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error ZeroAddressNotAllowed();
    error InvalidCutoffDate();
    error EmptyFlows();
    error InvalidAddress();
    error SameAddress();
    error InvalidImplementation();

    /// @notice Address of the current XvPSettlement logic contract (implementation).
    address public xvpSettlementImplementation;

    /// @notice An array that stores references (addresses cast to `IATKXvPSettlement`) to all XvP settlement
    /// proxy contracts created by this factory.
    IATKXvPSettlement[] private allSettlements;

    /// @notice Emitted when the implementation is updated
    /// @param oldImplementation The address of the previous implementation
    /// @param newImplementation The address of the new implementation
    event ImplementationUpdated(address indexed oldImplementation, address indexed newImplementation);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) AbstractATKSystemAddonFactoryImplementation(forwarder) {
        _disableInitializers();
    }

    /// @notice Initializes the factory with system address and admin
    /// @dev Can only be called once, sets up initial roles and system integration
    /// @param systemAddress The address of the ATK system contract
    /// @param initialAdmin The address that will be granted admin role
    function initialize(address systemAddress, address initialAdmin) public initializer {
        if (systemAddress == address(0)) revert ZeroAddressNotAllowed();
        if (initialAdmin == address(0)) revert ZeroAddressNotAllowed();

        __ERC165_init();
        _initializeAbstractSystemAddonFactory(systemAddress, initialAdmin);

        // Deploy the initial XvPSettlement implementation
        ATKXvPSettlementImplementation initialImplementation = new ATKXvPSettlementImplementation(trustedForwarder());

        xvpSettlementImplementation = address(initialImplementation);
        emit ImplementationUpdated(address(0), xvpSettlementImplementation);
    }

    /// @notice Updates the address of the XvPSettlement implementation contract.
    /// @dev Only callable by the implementation manager. New proxies created after this call will use the new
    /// implementation.
    /// This does NOT automatically upgrade existing proxy instances.
    /// @param _newImplementation The address of the new XvPSettlement logic contract.
    function updateImplementation(address _newImplementation)
        external
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (_newImplementation == address(0)) revert InvalidAddress();
        if (_newImplementation == xvpSettlementImplementation) revert SameAddress();
        if (!IERC165(_newImplementation).supportsInterface(type(IATKXvPSettlement).interfaceId)) {
            revert InvalidImplementation();
        }

        address oldImplementation = xvpSettlementImplementation;
        xvpSettlementImplementation = _newImplementation;
        emit ImplementationUpdated(oldImplementation, xvpSettlementImplementation);
    }

    /// @notice Creates a new XvPSettlement contract
    /// @dev Uses CREATE2 for deterministic addresses and the system addon pattern for deployment.
    /// @param name The name of the settlement
    /// @param flows The array of token flows to include in the settlement
    /// @param cutoffDate Timestamp after which the settlement expires
    /// @param autoExecute If true, settlement executes automatically when all approvals are received
    /// @return contractAddress The address of the newly created settlement contract
    function create(
        string memory name,
        IATKXvPSettlement.Flow[] memory flows,
        uint256 cutoffDate,
        bool autoExecute
    )
        external
        onlyRole(ATKSystemRoles.DEPLOYER_ROLE)
        returns (address contractAddress)
    {
        if (cutoffDate <= block.timestamp) revert InvalidCutoffDate();
        if (flows.length == 0) revert EmptyFlows();

        bytes memory saltInputData = abi.encode(address(this), name, flows, cutoffDate, autoExecute, _msgSender());
        bytes memory constructorArgs = abi.encode(address(this), name, cutoffDate, autoExecute, flows);
        bytes memory proxyBytecode = type(ATKXvPSettlementProxy).creationCode;

        // Predict the address first for validation
        address expectedAddress = _predictProxyAddress(proxyBytecode, constructorArgs, saltInputData);

        // Deploy using the abstract factory method
        contractAddress = _deploySystemAddon(proxyBytecode, constructorArgs, saltInputData, expectedAddress);

        // Add to registry
        // Cast the proxy to IATKXvPSettlement for storage, as the proxy behaves like one.
        allSettlements.push(IATKXvPSettlement(contractAddress));

        emit ATKXvPSettlementCreated(contractAddress, _msgSender());
        return contractAddress;
    }

    /// @notice Predicts the address where a XvPSettlement contract would be deployed
    /// @dev Calculates the deterministic address using CREATE2 with the same parameters and salt
    /// computation as the create function. This allows users to know the contract's address before deployment.
    /// @param name The name of the settlement
    /// @param flows The array of token flows that will be used in deployment
    /// @param cutoffDate Timestamp after which the settlement expires
    /// @param autoExecute If true, settlement executes automatically when all approvals are received
    /// @return predicted The address where the settlement contract would be deployed
    function predictAddress(
        string memory name,
        IATKXvPSettlement.Flow[] memory flows,
        uint256 cutoffDate,
        bool autoExecute
    )
        public
        view
        returns (address predicted)
    {
        bytes memory saltInputData = abi.encode(address(this), name, flows, cutoffDate, autoExecute, _msgSender());
        bytes memory constructorArgs = abi.encode(address(this), name, cutoffDate, autoExecute, flows);
        bytes memory proxyBytecode = type(ATKXvPSettlementProxy).creationCode;

        return _predictProxyAddress(proxyBytecode, constructorArgs, saltInputData);
    }

    /// @notice Checks if an address was deployed by this factory
    /// @dev Returns true if the address was created by this factory, false otherwise
    /// @param settlement The address to check
    /// @return True if the address was created by this factory, false otherwise
    function isAddressDeployed(address settlement) public view returns (bool) {
        for (uint256 i = 0; i < allSettlements.length; i++) {
            if (address(allSettlements[i]) == settlement) {
                return true;
            }
        }
        return false;
    }

    /// @notice Returns the total number of settlements created by this factory
    function allSettlementsLength() external view returns (uint256) {
        return allSettlements.length;
    }

    /// @notice Checks if the contract implements an interface
    /// @param interfaceId The interface identifier
    /// @return True if the contract implements the interface, false otherwise
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AbstractATKSystemAddonFactoryImplementation, IERC165)
        returns (bool)
    {
        return interfaceId == type(IATKXvPSettlementFactory).interfaceId || super.supportsInterface(interfaceId);
    }
}
