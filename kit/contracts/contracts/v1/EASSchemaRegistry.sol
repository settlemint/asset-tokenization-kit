// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { SchemaRegistry } from "@ethereum-attestation-service/eas-contracts/SchemaRegistry.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract EASSchemaRegistry is SchemaRegistry, ERC2771Context {
    constructor(address forwarder) ERC2771Context(forwarder) { }

    function _msgSender() internal view virtual override(ERC2771Context) returns (address) {
        return super._msgSender();
    }

    function _msgData() internal view virtual override(ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }
}
