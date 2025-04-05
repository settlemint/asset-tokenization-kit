// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Roles } from "../../Roles.sol";
import { SenderIsNotAdmin } from "../../../errors/RoleErrors.sol";

/// events

/// @dev This event is emmited when a role is added.
/// @param _agent Address of agent contract
/// @param _role Role label.
event RoleAdded(address indexed _agent, string _role);

/// @dev This event is emmited when a role is removed.
/// @param _agent Address of agent contract
/// @param _role Role label.
event RoleRemoved(address indexed _agent, string _role);

contract AgentRoles is Ownable {
    using Roles for Roles.Role;

    /// variables

    Roles.Role private _supplyModifiers;
    Roles.Role private _freezers;
    Roles.Role private _transferManagers;
    Roles.Role private _recoveryAgents;
    Roles.Role private _complianceAgents;
    Roles.Role private _whiteListManagers;
    Roles.Role private _agentAdmin;

    /// modifiers

    modifier onlyAdmin() {
        require(owner() == msg.sender || isAgentAdmin(_msgSender()), SenderIsNotAdmin());
        _;
    }

    constructor() Ownable(_msgSender()) { }

    /// functions

    /// @dev AgentAdmin Role _agentAdmin

    function addAgentAdmin(address _agent) external onlyAdmin {
        _agentAdmin.add(_agent);
        string memory _role = "AgentAdmin";
        emit RoleAdded(_agent, _role);
    }

    function removeAgentAdmin(address _agent) external onlyAdmin {
        _agentAdmin.remove(_agent);
        string memory _role = "AgentAdmin";
        emit RoleRemoved(_agent, _role);
    }

    function addSupplyModifier(address _agent) external onlyAdmin {
        _supplyModifiers.add(_agent);
        string memory _role = "SupplyModifier";
        emit RoleAdded(_agent, _role);
    }

    function removeSupplyModifier(address _agent) external onlyAdmin {
        _supplyModifiers.remove(_agent);
        string memory _role = "SupplyModifier";
        emit RoleRemoved(_agent, _role);
    }

    function addFreezer(address _agent) external onlyAdmin {
        _freezers.add(_agent);
        string memory _role = "Freezer";
        emit RoleAdded(_agent, _role);
    }

    function removeFreezer(address _agent) external onlyAdmin {
        _freezers.remove(_agent);
        string memory _role = "Freezer";
        emit RoleRemoved(_agent, _role);
    }

    function addTransferManager(address _agent) external onlyAdmin {
        _transferManagers.add(_agent);
        string memory _role = "TransferManager";
        emit RoleAdded(_agent, _role);
    }

    function removeTransferManager(address _agent) external onlyAdmin {
        _transferManagers.remove(_agent);
        string memory _role = "TransferManager";
        emit RoleRemoved(_agent, _role);
    }

    function addRecoveryAgent(address _agent) external onlyAdmin {
        _recoveryAgents.add(_agent);
        string memory _role = "RecoveryAgent";
        emit RoleAdded(_agent, _role);
    }

    function removeRecoveryAgent(address _agent) external onlyAdmin {
        _recoveryAgents.remove(_agent);
        string memory _role = "RecoveryAgent";
        emit RoleRemoved(_agent, _role);
    }

    function addComplianceAgent(address _agent) external onlyAdmin {
        _complianceAgents.add(_agent);
        string memory _role = "ComplianceAgent";
        emit RoleAdded(_agent, _role);
    }

    function removeComplianceAgent(address _agent) external onlyAdmin {
        _complianceAgents.remove(_agent);
        string memory _role = "ComplianceAgent";
        emit RoleRemoved(_agent, _role);
    }

    function addWhiteListManager(address _agent) external onlyAdmin {
        _whiteListManagers.add(_agent);
        string memory _role = "WhiteListManager";
        emit RoleAdded(_agent, _role);
    }

    function removeWhiteListManager(address _agent) external onlyAdmin {
        _whiteListManagers.remove(_agent);
        string memory _role = "WhiteListManager";
        emit RoleRemoved(_agent, _role);
    }

    function isAgentAdmin(address _agent) public view returns (bool) {
        return _agentAdmin.has(_agent);
    }

    function isWhiteListManager(address _agent) public view returns (bool) {
        return _whiteListManagers.has(_agent);
    }

    function isComplianceAgent(address _agent) public view returns (bool) {
        return _complianceAgents.has(_agent);
    }

    function isRecoveryAgent(address _agent) public view returns (bool) {
        return _recoveryAgents.has(_agent);
    }

    function isTransferManager(address _agent) public view returns (bool) {
        return _transferManagers.has(_agent);
    }

    function isFreezer(address _agent) public view returns (bool) {
        return _freezers.has(_agent);
    }

    function isSupplyModifier(address _agent) public view returns (bool) {
        return _supplyModifiers.has(_agent);
    }
}
