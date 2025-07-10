// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ISMARTIdentityRegistry } from "../../smart/interface/ISMARTIdentityRegistry.sol";

interface IATKIdentityRegistry is ISMARTIdentityRegistry {
    function initialize(
        address[] memory initialAdmins,
        address initialRegistrar,
        address identityStorage,
        address trustedIssuersRegistry,
        address topicSchemeRegistry
    )
        external;
}
