// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTForwarder } from "smart-protocol/contracts/vendor/SMARTForwarder.sol";

contract ATKForwarder is SMARTForwarder {
    constructor() SMARTForwarder() { }
}
