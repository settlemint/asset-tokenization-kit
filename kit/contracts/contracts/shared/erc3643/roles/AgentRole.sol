// SPDX-License-Identifier: GPL-3.0
/**
 *     T-REX is a suite of smart contracts implementing the ERC-3643 standard and
 *     developed by Tokeny to manage and transfer financial assets on EVM blockchains
 *
 *     Copyright (C) 2023, Tokeny sàrl.
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
pragma solidity ^0.8.27;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Roles } from "./Roles.sol";
import { ZeroAddress } from "../errors/InvalidArgumentErrors.sol";
import { CallerDoesNotHaveAgentRole } from "../errors/RoleErrors.sol";

/// Events

/// @dev This event is emitted when an agent is added.
/// @param _agent Address of agent contract
event AgentAdded(address indexed _agent);

/// @dev This event is emitted when an agent is removed.
/// @param _agent Address of agent contract
event AgentRemoved(address indexed _agent);

contract AgentRole is Ownable {
    using Roles for Roles.Role;

    Roles.Role private _agents;

    modifier onlyAgent() {
        require(isAgent(_msgSender()), CallerDoesNotHaveAgentRole());
        _;
    }

    constructor() Ownable(_msgSender()) { }

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
