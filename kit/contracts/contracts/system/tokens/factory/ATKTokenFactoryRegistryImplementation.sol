// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { IWithTypeIdentifier } from "../../../smart/interface/IWithTypeIdentifier.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { IATKSystem } from "../../IATKSystem.sol";
import { IATKTokenFactoryRegistry } from "./IATKTokenFactoryRegistry.sol";
import {
    InvalidTokenFactoryAddress,
    TokenFactoryTypeAlreadyRegistered,
    InvalidTokenImplementationAddress,
    InvalidTokenImplementationInterface
} from "../../ATKSystemErrors.sol";
import { ATKPeopleRoles } from "../../ATKPeopleRoles.sol";
import { ATKSystemRoles } from "../../ATKSystemRoles.sol";
import { IATKTokenFactory } from "./IATKTokenFactory.sol";
import { InvalidImplementationInterface } from "../../ATKSystemErrors.sol";
import { IATKTypedImplementationRegistry } from "../../IATKTypedImplementationRegistry.sol";
import { ATKTypedImplementationProxy } from "../../ATKTypedImplementationProxy.sol";
import { ISMART } from "../../../smart/interface/ISMART.sol";
import { ATKSystemAccessManaged } from "../../access-manager/ATKSystemAccessManaged.sol";
import { IATKSystemAccessManager } from "../../access-manager/IATKSystemAccessManager.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IATKSystemAccessManaged } from "../../access-manager/IATKSystemAccessManaged.sol";

/// @title ATKTokenFactoryRegistryImplementation
/// @author SettleMint
/// @notice Implementation contract for the ATK Token Factory Registry
/// @dev This contract manages the registration and deployment of token factories within the ATK ecosystem.
///      Each factory type (Bond, Equity, Fund, etc.) is identified by a unique type hash and deployed
///      as an upgradeable proxy. The registry ensures that only valid factory implementations supporting
///      the IATKTokenFactory interface can be registered.
contract ATKTokenFactoryRegistryImplementation is
    Initializable,
    IATKTokenFactoryRegistry,
    IATKTypedImplementationRegistry,
    ATKSystemAccessManaged,
    ReentrancyGuardUpgradeable,
    ERC2771ContextUpgradeable,
    ERC165Upgradeable
{
    IATKSystem private _system;

    mapping(bytes32 typeHash => address tokenFactoryImplementationAddress) private tokenFactoryImplementationsByType;
    mapping(bytes32 typeHash => address tokenFactoryProxyAddress) private tokenFactoryProxiesByType;
    bytes4 private constant _IATK_TOKEN_FACTORY_ID = type(IATKTokenFactory).interfaceId;

    /// @notice Constructor that disables initializers and sets the trusted forwarder
    /// @param trustedForwarder The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    /// @notice Initializes the token factory registry with initial admin and system address
    /// @param accessManager The address of the access manager
    /// @param systemAddress The address of the ATK system contract
    function initialize(address accessManager, address systemAddress) public override initializer {
        __ATKSystemAccessManaged_init(accessManager);
        __ReentrancyGuard_init();

        _system = IATKSystem(systemAddress);
    }

    /// @notice Registers a new token factory type in the registry
    /// @param _name The name of the token factory type (e.g., "Bond", "Equity")
    /// @param _factoryImplementation The implementation contract address for this factory type
    /// @param _tokenImplementation The implementation contract address for tokens created by this factory
    /// @return The address of the deployed factory proxy
    /// @dev Creates an upgradeable proxy for the factory and grants necessary permissions
    function registerTokenFactory(
        string calldata _name,
        address _factoryImplementation,
        address _tokenImplementation
    )
        external
        override
        nonReentrant
        onlySystemRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE)
        returns (address)
    {
        if (address(_factoryImplementation) == address(0)) revert InvalidTokenFactoryAddress();
        _checkInterface(_factoryImplementation, _IATK_TOKEN_FACTORY_ID);

        if (address(_tokenImplementation) == address(0)) revert InvalidTokenImplementationAddress();
        if (!IATKTokenFactory(_factoryImplementation).isValidTokenImplementation(_tokenImplementation)) {
            revert InvalidTokenImplementationInterface();
        }

        bytes32 factoryTypeHash = keccak256(abi.encodePacked(_name));

        if (tokenFactoryImplementationsByType[factoryTypeHash] != address(0)) {
            revert TokenFactoryTypeAlreadyRegistered(_name);
        }

        tokenFactoryImplementationsByType[factoryTypeHash] = _factoryImplementation;

        bytes memory tokenFactoryData =
            abi.encodeWithSelector(IATKTokenFactory.initialize.selector, _accessManager, _system, _tokenImplementation);
        address _tokenFactoryProxy =
            address(new ATKTypedImplementationProxy(address(this), factoryTypeHash, tokenFactoryData));

        tokenFactoryProxiesByType[factoryTypeHash] = _tokenFactoryProxy;

        IATKSystemAccessManager(_accessManager).grantRole(ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE, _tokenFactoryProxy);

        emit TokenFactoryRegistered(
            _msgSender(),
            _name,
            IWithTypeIdentifier(_factoryImplementation).typeId(),
            _tokenFactoryProxy,
            _factoryImplementation,
            _tokenImplementation,
            _getRegisteredInterfacesSafely(_tokenImplementation),
            block.timestamp
        );

        return _tokenFactoryProxy;
    }

    /// @notice Updates the implementation address for an existing token factory type
    /// @param factoryTypeHash The type hash of the factory to update
    /// @param implementation_ The new implementation contract address
    /// @dev Only callable by addresses with IMPLEMENTATION_MANAGER_ROLE
    function setTokenFactoryImplementation(
        bytes32 factoryTypeHash,
        address implementation_
    )
        public
        override
        onlySystemRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert InvalidTokenFactoryAddress();
        if (tokenFactoryImplementationsByType[factoryTypeHash] == address(0)) revert InvalidTokenFactoryAddress();
        _checkInterface(implementation_, _IATK_TOKEN_FACTORY_ID);

        tokenFactoryImplementationsByType[factoryTypeHash] = implementation_;
        emit TokenFactoryImplementationUpdated(_msgSender(), factoryTypeHash, implementation_);
    }

    /// @notice Returns the implementation address for a given factory type
    /// @param factoryTypeHash The type hash of the factory
    /// @return The implementation contract address
    function implementation(bytes32 factoryTypeHash) public view override returns (address) {
        return tokenFactoryImplementationsByType[factoryTypeHash];
    }

    /// @notice Returns the proxy address for a given factory type
    /// @param factoryTypeHash The type hash of the factory
    /// @return The factory proxy contract address
    function tokenFactory(bytes32 factoryTypeHash) public view override returns (address) {
        return tokenFactoryProxiesByType[factoryTypeHash];
    }

    /// @notice Checks if a contract implements the required interface
    /// @param implAddress The address of the contract to check
    /// @param interfaceId The interface ID to verify
    /// @dev Reverts if the contract doesn't implement the interface
    function _checkInterface(address implAddress, bytes4 interfaceId) private view {
        if (implAddress == address(0)) return;
        try IERC165(implAddress).supportsInterface(interfaceId) returns (bool supported) {
            if (!supported) {
                revert InvalidImplementationInterface(implAddress, interfaceId);
            }
        } catch {
            revert InvalidImplementationInterface(implAddress, interfaceId);
        }
    }

    /// @notice Checks if the contract supports a given interface
    /// @param interfaceId The interface identifier to check
    /// @return bool True if the interface is supported, false otherwise
    function supportsInterface(bytes4 interfaceId) public view override(ERC165Upgradeable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId) || interfaceId == type(IATKTokenFactoryRegistry).interfaceId
            || interfaceId == type(IATKTypedImplementationRegistry).interfaceId
            || interfaceId == type(IATKSystemAccessManaged).interfaceId;
    }

    /// @notice Returns the address of the current message sender
    /// @return The address of the message sender, accounting for meta-transactions
    /// @dev Overrides to use ERC2771 context for meta-transaction support
    function _msgSender() internal view override(ERC2771ContextUpgradeable, ATKSystemAccessManaged) returns (address) {
        return ERC2771ContextUpgradeable._msgSender();
    }

    /// @notice Safely retrieves the registered interfaces of a token implementation
    /// @param _tokenImplementation The address of the token implementation to query
    /// @return An array of interface IDs supported by the token, or empty array if not supported
    /// @dev This function is used to avoid reverts when the token implementation is not a IERC165 contract.
    function _getRegisteredInterfacesSafely(address _tokenImplementation) private view returns (bytes4[] memory) {
        // Attempt to call supportsInterface on the _tokenImplementation.
        // The `try` block handles potential reverts if _tokenImplementation is not a contract,
        // or if it's a contract that doesn't implement IERC165 or its supportsInterface function.
        try IERC165(_tokenImplementation).supportsInterface(type(ISMART).interfaceId) returns (bool isSmartSupported) {
            // If supportsInterface call succeeds and returns true for ISMART interfaceId
            if (isSmartSupported) {
                // Now, try to call registeredInterfaces() on the ISMART interface.
                // This nested try-catch handles cases where the token might claim ISMART support
                // but its registeredInterfaces() function might still revert for some reason.
                try ISMART(_tokenImplementation).registeredInterfaces() returns (bytes4[] memory interfaces) {
                    return interfaces;
                } catch {
                    // If registeredInterfaces() reverts, return an empty array.
                    return new bytes4[](0);
                }
            } else {
                // If supportsInterface returns false for ISMART interfaceId, return an empty array.
                return new bytes4[](0);
            }
        } catch {
            // If supportsInterface call itself reverts (e.g., _tokenImplementation is not a contract,
            // or doesn't have the supportsInterface function), return an empty array.
            return new bytes4[](0);
        }
    }
}
