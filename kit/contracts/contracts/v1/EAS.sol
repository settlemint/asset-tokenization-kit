// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { EAS as BaseEAS, ISchemaRegistry } from "@ethereum-attestation-service/eas-contracts/EAS.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract EAS is BaseEAS, ERC2771Context {
    constructor(
        ISchemaRegistry registry,
        address forwarder
    ) BaseEAS(registry) ERC2771Context(forwarder) {}

    function _msgSender() internal view virtual override(ERC2771Context) returns (address) {
        return super._msgSender();
    }

    function _msgData() internal view virtual override(ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }
} 