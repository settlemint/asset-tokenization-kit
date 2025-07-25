// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IWithTypeIdentifier } from "../../smart/interface/IWithTypeIdentifier.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { IATKTokenFactoryRegistry } from "./IATKTokenFactoryRegistry.sol";
import {
    InvalidTokenFactoryAddress,
    TokenFactoryTypeAlreadyRegistered,
    InvalidTokenImplementationAddress,
    InvalidTokenImplementationInterface
} from "../ATKSystemErrors.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";
import { IATKTokenFactory } from "../token-factory/IATKTokenFactory.sol";
import { InvalidImplementationInterface } from "../ATKSystemErrors.sol";
import { IATKTypedImplementationRegistry } from "../IATKTypedImplementationRegistry.sol";
import { ATKTypedImplementationProxy } from "../ATKTypedImplementationProxy.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ISMART } from "../../smart/interface/ISMART.sol";

/**
 * @title ATKTokenFactoryRegistryImplementation
 * @author SettleMint
 * @notice Implementation contract for the ATK Token Factory Registry
 * @dev This contract manages the registration and deployment of token factories within the ATK ecosystem.
 *      Each factory type (Bond, Equity, Fund, etc.) is identified by a unique type hash and deployed
 *      as an upgradeable proxy. The registry ensures that only valid factory implementations supporting
 *      the IATKTokenFactory interface can be registered.
 */
contract ATKTokenFactoryRegistryImplementation is
    Initializable,
    IATKTokenFactoryRegistry,
    IATKTypedImplementationRegistry,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    ERC2771ContextUpgradeable
{
    IATKSystem private _system;

    mapping(bytes32 typeHash => address tokenFactoryImplementationAddress) private tokenFactoryImplementationsByType;
    mapping(bytes32 typeHash => address tokenFactoryProxyAddress) private tokenFactoryProxiesByType;
    bytes4 private constant _IATK_TOKEN_FACTORY_ID = type(IATKTokenFactory).interfaceId;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    function initialize(address initialAdmin, address systemAddress) public override initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE, initialAdmin);
        _grantRole(ATKSystemRoles.REGISTRAR_ROLE, initialAdmin);
        _system = IATKSystem(systemAddress);
    }

    function registerTokenFactory(
        string calldata _name,
        address _factoryImplementation,
        address _tokenImplementation
    )
        external
        override
        nonReentrant
        onlyRole(ATKSystemRoles.REGISTRAR_ROLE)
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

        bytes memory tokenFactoryData = abi.encodeWithSelector(
            IATKTokenFactory.initialize.selector,
            _system,
            _tokenImplementation,
            _msgSender(),
            _system.identityVerificationModule()
        );
        address _tokenFactoryProxy =
            address(new ATKTypedImplementationProxy(address(this), factoryTypeHash, tokenFactoryData));

        tokenFactoryProxiesByType[factoryTypeHash] = _tokenFactoryProxy;

        // Grant compliance management role through the system access manager instead of directly on compliance
        IAccessControl(address(_system.systemAccessManager())).grantRole(
            ATKSystemRoles.COMPLIANCE_MANAGER_ROLE, _tokenFactoryProxy
        );

        // Grant permission to register contract identities in the identity registry
        IAccessControl(address(_system.identityRegistry())).grantRole(ATKSystemRoles.REGISTRAR_ROLE, _tokenFactoryProxy);

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

    function setTokenFactoryImplementation(
        bytes32 factoryTypeHash,
        address implementation_
    )
        public
        override
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert InvalidTokenFactoryAddress();
        if (tokenFactoryImplementationsByType[factoryTypeHash] == address(0)) revert InvalidTokenFactoryAddress();
        _checkInterface(implementation_, _IATK_TOKEN_FACTORY_ID);

        tokenFactoryImplementationsByType[factoryTypeHash] = implementation_;
        emit TokenFactoryImplementationUpdated(_msgSender(), factoryTypeHash, implementation_);
    }

    function implementation(bytes32 factoryTypeHash) public view override returns (address) {
        return tokenFactoryImplementationsByType[factoryTypeHash];
    }

    function tokenFactory(bytes32 factoryTypeHash) public view override returns (address) {
        return tokenFactoryProxiesByType[factoryTypeHash];
    }

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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControlUpgradeable, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId) || interfaceId == type(IATKTokenFactoryRegistry).interfaceId
            || interfaceId == type(IATKTypedImplementationRegistry).interfaceId;
    }

    function _msgSender() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address) {
        return super._msgSender();
    }

    function _msgData()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength();
    }

    /// @dev This function is used to get the registered interfaces of a token implementation.
    /// It is used to avoid reverts when the token implementation is not a IERC165 contract.
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
