// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { ERC2771Forwarder } from "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

contract Forwarder is ERC2771Forwarder {
    constructor() ERC2771Forwarder("AssetTokenizationForwarder") { }
}
