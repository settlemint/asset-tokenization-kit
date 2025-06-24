// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ISMARTTopicSchemeRegistry } from "../../smart/interface/ISMARTTopicSchemeRegistry.sol";

interface IATKTopicSchemeRegistry is ISMARTTopicSchemeRegistry {
    function initialize(address initialAdmin, address[] memory initialRegistrars) external;
}
