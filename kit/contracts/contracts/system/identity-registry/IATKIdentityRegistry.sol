// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ISMARTIdentityRegistry } from "../../smart/interface/ISMARTIdentityRegistry.sol";

interface IATKIdentityRegistry is ISMARTIdentityRegistry {
    function initialize(
        address initialAdmin,
        address identityStorage,
        address trustedIssuersRegistry,
        address topicSchemeRegistry
    )
        external;
}
