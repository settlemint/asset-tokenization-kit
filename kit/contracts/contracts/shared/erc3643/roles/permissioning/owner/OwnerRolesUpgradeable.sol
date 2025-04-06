// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { Roles } from "../../Roles.sol";
import { SenderIsNotAdmin } from "../../../errors/RoleErrors.sol";

/// Events

/// @dev This event is emmited when a role is added.
/// @param _owner Address of contract
/// @param _role Role label.
event RoleAdded(address indexed _owner, string _role);

/// @dev This event is emmited when a role is removed.
/// @param _owner Address of contract
/// @param _role Role label.
event RoleRemoved(address indexed _owner, string _role);

contract OwnerRolesUpgradeable is OwnableUpgradeable {
    using Roles for Roles.Role;

    /// variables

    Roles.Role private _ownerAdmin;
    Roles.Role private _registryAddressSetter;
    Roles.Role private _complianceSetter;
    Roles.Role private _complianceManager;
    Roles.Role private _claimRegistryManager;
    Roles.Role private _issuersRegistryManager;
    Roles.Role private _tokenInfoManager;

    /// modifiers

    modifier onlyAdmin() {
        require(owner() == _msgSender() || isOwnerAdmin(_msgSender()), SenderIsNotAdmin());
        _;
    }

    /// functions

    function addOwnerAdmin(address _owner) external onlyAdmin {
        _ownerAdmin.add(_owner);
        string memory _role = "OwnerAdmin";
        emit RoleAdded(_owner, _role);
    }

    function removeOwnerAdmin(address _owner) external onlyAdmin {
        _ownerAdmin.remove(_owner);
        string memory _role = "OwnerAdmin";
        emit RoleRemoved(_owner, _role);
    }

    function addRegistryAddressSetter(address _owner) external onlyAdmin {
        _registryAddressSetter.add(_owner);
        string memory _role = "RegistryAddressSetter";
        emit RoleAdded(_owner, _role);
    }

    function removeRegistryAddressSetter(address _owner) external onlyAdmin {
        _registryAddressSetter.remove(_owner);
        string memory _role = "RegistryAddressSetter";
        emit RoleRemoved(_owner, _role);
    }

    function addComplianceSetter(address _owner) external onlyAdmin {
        _complianceSetter.add(_owner);
        string memory _role = "ComplianceSetter";
        emit RoleAdded(_owner, _role);
    }

    function removeComplianceSetter(address _owner) external onlyAdmin {
        _complianceSetter.remove(_owner);
        string memory _role = "ComplianceSetter";
        emit RoleRemoved(_owner, _role);
    }

    function addComplianceManager(address _owner) external onlyAdmin {
        _complianceManager.add(_owner);
        string memory _role = "ComplianceManager";
        emit RoleAdded(_owner, _role);
    }

    function removeComplianceManager(address _owner) external onlyAdmin {
        _complianceManager.remove(_owner);
        string memory _role = "ComplianceManager";
        emit RoleRemoved(_owner, _role);
    }

    function addClaimRegistryManager(address _owner) external onlyAdmin {
        _claimRegistryManager.add(_owner);
        string memory _role = "ClaimRegistryManager";
        emit RoleAdded(_owner, _role);
    }

    function removeClaimRegistryManager(address _owner) external onlyAdmin {
        _claimRegistryManager.remove(_owner);
        string memory _role = "ClaimRegistryManager";
        emit RoleRemoved(_owner, _role);
    }

    function addIssuersRegistryManager(address _owner) external onlyAdmin {
        _issuersRegistryManager.add(_owner);
        string memory _role = "IssuersRegistryManager";
        emit RoleAdded(_owner, _role);
    }

    function removeIssuersRegistryManager(address _owner) external onlyAdmin {
        _issuersRegistryManager.remove(_owner);
        string memory _role = "IssuersRegistryManager";
        emit RoleRemoved(_owner, _role);
    }

    function addTokenInfoManager(address _owner) external onlyAdmin {
        _tokenInfoManager.add(_owner);
        string memory _role = "TokenInfoManager";
        emit RoleAdded(_owner, _role);
    }

    function removeTokenInfoManager(address _owner) external onlyAdmin {
        _tokenInfoManager.remove(_owner);
        string memory _role = "TokenInfoManager";
        emit RoleRemoved(_owner, _role);
    }

    function isOwnerAdmin(address _owner) public view returns (bool) {
        return _ownerAdmin.has(_owner);
    }

    function isTokenInfoManager(address _owner) public view returns (bool) {
        return _tokenInfoManager.has(_owner);
    }

    function isIssuersRegistryManager(address _owner) public view returns (bool) {
        return _issuersRegistryManager.has(_owner);
    }

    function isClaimRegistryManager(address _owner) public view returns (bool) {
        return _claimRegistryManager.has(_owner);
    }

    function isComplianceManager(address _owner) public view returns (bool) {
        return _complianceManager.has(_owner);
    }

    function isComplianceSetter(address _owner) public view returns (bool) {
        return _complianceSetter.has(_owner);
    }

    function isRegistryAddressSetter(address _owner) public view returns (bool) {
        return _registryAddressSetter.has(_owner);
    }
}
