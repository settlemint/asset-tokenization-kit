// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { ATKSystemAccessControlled } from "../access-manager/ATKSystemAccessControlled.sol";
import { IATKSystemAccessManager } from "../access-manager/IATKSystemAccessManager.sol";
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

contract ATKTokenFactoryRegistryImplementation is
    Initializable,
    IATKTokenFactoryRegistry,
    IATKTypedImplementationRegistry,
    ATKSystemAccessControlled,
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
        __ReentrancyGuard_init();

        // Note: Access control is now managed centrally through ATKSystemAccessManager
        // The system access manager is set automatically when the system is initialized
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
        onlyTokenManagerOrModule
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

        // Role granting is now handled by the centralized system access manager
        // This would be done through the system's access manager instead

        emit TokenFactoryRegistered(
            _msgSender(),
            _name,
            IWithTypeIdentifier(_factoryImplementation).typeId(),
            _tokenFactoryProxy,
            _factoryImplementation,
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
        onlySystemManager
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

    function supportsInterface(bytes4 interfaceId) public view override(IERC165) returns (bool) {
        return interfaceId == type(IATKTokenFactoryRegistry).interfaceId
            || interfaceId == type(IATKTypedImplementationRegistry).interfaceId || interfaceId == type(IERC165).interfaceId;
    }

    function _msgSender() internal view override(ERC2771ContextUpgradeable) returns (address) {
        return ERC2771ContextUpgradeable._msgSender();
    }

    function _msgData() internal view override(ERC2771ContextUpgradeable) returns (bytes calldata) {
        return ERC2771ContextUpgradeable._msgData();
    }

    function _contextSuffixLength() internal view override(ERC2771ContextUpgradeable) returns (uint256) {
        return ERC2771ContextUpgradeable._contextSuffixLength();
    }

    // IAccessControl implementation - delegate to centralized system access manager
    function hasRole(
        bytes32 role,
        address account
    )
        public
        view
        override(ATKSystemAccessControlled, IAccessControl)
        returns (bool)
    {
        return ATKSystemAccessControlled.hasRole(role, account);
    }

    function getRoleAdmin(bytes32 role) external view override returns (bytes32) {
        return IATKSystemAccessManager(getSystemAccessManager()).getRoleAdmin(role);
    }

    function grantRole(bytes32 role, address account) external override {
        IATKSystemAccessManager(getSystemAccessManager()).grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) external override {
        IATKSystemAccessManager(getSystemAccessManager()).revokeRole(role, account);
    }

    function renounceRole(bytes32 role, address callerConfirmation) external override {
        IATKSystemAccessManager(getSystemAccessManager()).renounceRole(role, callerConfirmation);
    }
}
