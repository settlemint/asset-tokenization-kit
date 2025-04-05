// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import { IERC173 } from "../roles/IERC173.sol";
import { IToken } from "../token/IToken.sol";
import { ITREXImplementationAuthority } from "../proxy/authority/ITREXImplementationAuthority.sol";
import { IIAFactory } from "../proxy/authority/IIAFactory.sol";
import { ITREXGateway } from "../factory/ITREXGateway.sol";
import { IModule } from "../compliance/modular/modules/IModule.sol";
import { IModularCompliance } from "../compliance/modular/IModularCompliance.sol";
import { IIdentityRegistry } from "../registry/interface/IIdentityRegistry.sol";
import { IERC3643 } from "../ERC-3643/IERC3643.sol";
import { IERC3643ClaimTopicsRegistry } from "../ERC-3643/IERC3643ClaimTopicsRegistry.sol";
import { IERC3643IdentityRegistry } from "../ERC-3643/IERC3643IdentityRegistry.sol";
import { IERC3643IdentityRegistryStorage } from "../ERC-3643/IERC3643IdentityRegistryStorage.sol";
import { IERC3643TrustedIssuersRegistry } from "../ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { IERC3643Compliance } from "../ERC-3643/IERC3643Compliance.sol";

contract InterfaceIdCalculator {
    /**
     * @dev Returns the interface ID for the IERC20 interface.
     * IERC20 interface ID is 0x36372b07
     */
    function getIERC20InterfaceId() external pure returns (bytes4) {
        return type(IERC20).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IERC20Permit interface.
     * IERC20Permit interface ID is 0x0b4c7e4d
     */
    function getIERC20PermitInterfaceId() external pure returns (bytes4) {
        return type(IERC20Permit).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IERC3643 interface.
     * IERC3643 interface ID is 0xb97d944c
     */
    function getIERC3643InterfaceId() external pure returns (bytes4) {
        return type(IERC3643).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IToken interface.
     * IToken interface ID is 0x5c0cda7e
     */
    function getITokenInterfaceId() external pure returns (bytes4) {
        return type(IToken).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IERC173 interface.
     * IERC173 interface ID is 0x7f5828d0
     */
    function getIERC173InterfaceId() external pure returns (bytes4) {
        return type(IERC173).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IERC165 interface.
     * IERC165 interface ID is 0x01ffc9a7
     */
    function getIERC165InterfaceId() external pure returns (bytes4) {
        return type(IERC165).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IERC3643ClaimTopicsRegistry interface.
     * IERC3643ClaimTopicsRegistry interface ID is 0x10928b13
     */
    function getIERC3643ClaimTopicsRegistryInterfaceId() external pure returns (bytes4) {
        return type(IERC3643ClaimTopicsRegistry).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IIdentityRegistry interface.
     * IIdentityRegistry interface ID is 0xacb7b4db
     */
    function getIIdentityRegistryInterfaceId() external pure returns (bytes4) {
        return type(IIdentityRegistry).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IERC3643IdentityRegistry interface.
     * IERC3643IdentityRegistry interface ID is 0x8ff89f73
     */
    function getIERC3643IdentityRegistryInterfaceId() external pure returns (bytes4) {
        return type(IERC3643IdentityRegistry).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IERC3643IdentityRegistryStorage interface.
     * IERC3643IdentityRegistryStorage interface ID is 0x57defe0d
     */
    function getIERC3643IdentityRegistryStorageInterfaceId() external pure returns (bytes4) {
        return type(IERC3643IdentityRegistryStorage).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IERC3643TrustedIssuersRegistry interface.
     * IERC3643TrustedIssuersRegistry interface ID is 0xb0f773b8
     */
    function getIERC3643TrustedIssuersRegistryInterfaceId() external pure returns (bytes4) {
        return type(IERC3643TrustedIssuersRegistry).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the ITREXImplementationAuthority interface.
     * ITREXImplementationAuthority interface ID is 0x62dd69be
     */
    function getITREXImplementationAuthorityInterfaceId() external pure returns (bytes4) {
        return type(ITREXImplementationAuthority).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IIAFactory interface.
     * IIAFactory interface ID is 0x8c76edf0
     */
    function getIIAFactoryInterfaceId() external pure returns (bytes4) {
        return type(IIAFactory).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the ITREXGateway interface.
     * ITREXGateway interface ID is 0x80e89461
     */
    function getITREXGatewayInterfaceId() external pure returns (bytes4) {
        return type(ITREXGateway).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IModularCompliance interface.
     * IModularCompliance interface ID is 0x4d6b83d6
     */
    function getIModularComplianceInterfaceId() external pure returns (bytes4) {
        return type(IModularCompliance).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IERC3643Compliance interface.
     * IERC3643Compliance interface ID is 0x3144991c
     */
    function getIERC3643ComplianceInterfaceId() external pure returns (bytes4) {
        return type(IERC3643Compliance).interfaceId;
    }

    /**
     * @dev Returns the interface ID for the IModule interface.
     * IModule interface ID is 0xb795d01e
     */
    function getIModuleInterfaceId() external pure returns (bytes4) {
        return type(IModule).interfaceId;
    }
}
