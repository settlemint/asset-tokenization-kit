// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IERC3643TrustedIssuersRegistry } from "../../smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";

interface IATKTrustedIssuersRegistry is IERC3643TrustedIssuersRegistry {
    function initialize(address initialAdmin) external;
}
