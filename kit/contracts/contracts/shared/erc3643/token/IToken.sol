// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { IERC3643 } from "../ERC-3643/IERC3643.sol";
import { TokenRoles } from "./TokenStructs.sol";
/// @dev This event is emitted when restrictions on an agent's roles are updated.
/// @param _agent is the address of the agent whose roles are being restricted.
/// @param _disableMint indicates whether the agent is restricted from minting tokens.
/// @param _disableBurn indicates whether the agent is restricted from burning tokens.
/// @param _disableAddressFreeze indicates whether the agent is restricted from freezing addresses.
/// @param _disableForceTransfer indicates whether the agent is restricted from forcing transfers.
/// @param _disablePartialFreeze indicates whether the agent is restricted from partially freezing tokens.
/// @param _disablePause indicates whether the agent is restricted from pausing the token contract.
/// @param _disableRecovery indicates whether the agent is restricted from performing recovery operations.

event AgentRestrictionsSet(
    address indexed _agent,
    bool _disableMint,
    bool _disableBurn,
    bool _disableAddressFreeze,
    bool _disableForceTransfer,
    bool _disablePartialFreeze,
    bool _disablePause,
    bool _disableRecovery
);

/// @dev This event is emitted when the owner gives or cancels a default allowance.
/// @param _to Address of target.
/// @param _allowance Allowance or disallowance.
event DefaultAllowance(address _to, bool _allowance);

/// @dev This event is emitted when a user remove the default allowance.
/// @param _user Address of user.
event DefaultAllowanceDisabled(address _user);

/// @dev This event is emitted when a user adds the default allowance back after disabling.
/// @param _user Address of user.
event DefaultAllowanceEnabled(address _user);

/// @dev interface
interface IToken is IERC3643 {
    /// functions

    /**
     * @dev The owner of this address can allow or disallow spending without allowance.
     * Any `TransferFrom` from these targets won't need allowance (allow = true) or will need allowance (allow = false).
     * @param _allow Allow or disallow spending without allowance.
     * @param _targets Addresses without allowance needed.
     */
    function setAllowanceForAll(bool _allow, address[] calldata _targets) external;

    /**
     * @dev The caller can remove default allowance globally.
     */
    function disableDefaultAllowance() external;

    /**
     * @dev The caller can get default allowance back globally.
     */
    function enableDefaultAllowance() external;

    /**
     *  @dev Set restrictions on agent's roles.
     *  This function can only be called by the contract owner, as enforced by the `onlyOwner` modifier.
     *  emits an `AgentRestrictionsSet` event upon successfully updating an agent's restrictions.
     *  @param agent The address of the agent whose permissions are being modified.
     *  @param restrictions A `TokenRoles` struct containing boolean flags for each role to be restricted.
     *  Each flag set to `true` disables the corresponding capability for the agent.
     *  throws AddressNotAgent error if the specified address is not an agent.
     */
    function setAgentRestrictions(address agent, TokenRoles memory restrictions) external;

    /**
     *  @dev Returns A `TokenRoles` struct containing boolean flags for each restricted role.
     *  Each flag set to `true` disables the corresponding capability for the agent.
     */
    function getAgentRestrictions(address agent) external view returns (TokenRoles memory);
}
