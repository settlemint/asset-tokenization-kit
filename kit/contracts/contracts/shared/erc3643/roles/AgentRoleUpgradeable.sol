// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { OwnableOnceNext2StepUpgradeable } from "../utils/OwnableOnceNext2StepUpgradeable.sol";
import { Roles } from "./Roles.sol";
import { ZeroAddress } from "../errors/InvalidArgumentErrors.sol";
import { CallerDoesNotHaveAgentRole } from "../errors/RoleErrors.sol";

/// Events

/// @dev This event is emmited when an agent is added.
/// @param _agent Address of agent contract
event AgentAdded(address indexed _agent);

/// @dev This event is emmited when an agent is removed.
/// @param _agent Address of agent contract
event AgentRemoved(address indexed _agent);

contract AgentRoleUpgradeable is OwnableOnceNext2StepUpgradeable {
    using Roles for Roles.Role;

    Roles.Role private _agents;

    modifier onlyAgent() {
        require(isAgent(msg.sender), CallerDoesNotHaveAgentRole());
        _;
    }

    function addAgent(address _agent) public onlyOwner {
        require(_agent != address(0), ZeroAddress());
        _agents.add(_agent);
        emit AgentAdded(_agent);
    }

    function removeAgent(address _agent) public onlyOwner {
        require(_agent != address(0), ZeroAddress());
        _agents.remove(_agent);
        emit AgentRemoved(_agent);
    }

    function isAgent(address _agent) public view returns (bool) {
        return _agents.has(_agent);
    }
}
