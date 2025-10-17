// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ATKXvPSettlementImplementation } from "./ATKXvPSettlementImplementation.sol";
import { IATKXvPSettlement } from "./IATKXvPSettlement.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IATKXvPSettlementFactory } from "./IATKXvPSettlementFactory.sol";
import { IWithTypeIdentifier } from "../../smart/interface/IWithTypeIdentifier.sol";
import { AbstractATKSystemAddonFactoryImplementation } from
    "../../system/addons/AbstractATKSystemAddonFactoryImplementation.sol";
import { ATKXvPSettlementProxy } from "./ATKXvPSettlementProxy.sol";
import { ATKPeopleRoles } from "../../system/ATKPeopleRoles.sol";

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
    /// @notice Type identifier for this factory contract
    bytes32 public constant TYPE_ID = keccak256("ATKXvPSettlementFactory");

    /// @notice Returns the type identifier for this factory
    /// @return The bytes32 type identifier
    function typeId() external pure override(IATKXvPSettlementFactory, IWithTypeIdentifier) returns (bytes32) {
        return TYPE_ID;
    }

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

    /// @notice Constructor that disables initializers to prevent implementation contract initialization
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) AbstractATKSystemAddonFactoryImplementation(forwarder) {
        _disableInitializers();
    }

    /// @notice Initializes the factory with system address and admin
    /// @dev Can only be called once, sets up initial roles and system integration
    /// @param accessManager The address of the access manager.
    /// @param systemAddress The address of the `IATKSystem` contract.
    function initialize(address accessManager, address systemAddress) public initializer {
        _initializeAbstractSystemAddonFactory(accessManager, systemAddress);

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
        onlySystemRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE)
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
    /// @param hashlock The optional HTLC hashlock (required if external flows are present)
    /// @return contractAddress The address of the newly created settlement contract
    function create(
        string calldata name,
        IATKXvPSettlement.Flow[] calldata flows,
        uint256 cutoffDate,
        bool autoExecute,
        bytes32 hashlock
    )
        external
        onlySystemRole(ATKPeopleRoles.ADDON_MANAGER_ROLE)
        returns (address contractAddress)
    {
        if (cutoffDate < block.timestamp + 1) {
            revert InvalidCutoffDate();
        }
        if (flows.length == 0) revert EmptyFlows();

        bytes memory saltInputData =
            abi.encode(address(this), name, flows, cutoffDate, autoExecute, hashlock, _msgSender());
        bytes memory constructorArgs = abi.encode(address(this), name, cutoffDate, autoExecute, flows, hashlock);
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
    /// @param hashlock The optional HTLC hashlock (required if external flows are present)
    /// @return predicted The address where the settlement contract would be deployed
    function predictAddress(
        string memory name,
        IATKXvPSettlement.Flow[] memory flows,
        uint256 cutoffDate,
        bool autoExecute,
        bytes32 hashlock
    )
        public
        view
        returns (address predicted)
    {
        bytes memory saltInputData =
            abi.encode(address(this), name, flows, cutoffDate, autoExecute, hashlock, _msgSender());
        bytes memory constructorArgs = abi.encode(address(this), name, cutoffDate, autoExecute, flows, hashlock);
        bytes memory proxyBytecode = type(ATKXvPSettlementProxy).creationCode;

        return _predictProxyAddress(proxyBytecode, constructorArgs, saltInputData);
    }

    /// @notice Checks if an address was deployed by this factory
    /// @dev Returns true if the address was created by this factory, false otherwise
    /// @param settlement The address to check
    /// @return True if the address was created by this factory, false otherwise
    function isAddressDeployed(address settlement) public view returns (bool) {
        for (uint256 i = 0; i < allSettlements.length; ++i) {
            if (address(allSettlements[i]) == settlement) {
                return true;
            }
        }
        return false;
    }

    /// @notice Returns the total number of settlements created by this factory
    /// @return The total number of settlements created
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
