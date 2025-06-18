// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IATKTypedImplementationRegistry is IERC165 {
    function implementation(bytes32 typeHash) external view returns (address);
}
