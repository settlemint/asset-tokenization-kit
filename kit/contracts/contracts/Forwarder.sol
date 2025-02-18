// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { ERC2771Forwarder } from "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";
import { Errors } from "@openzeppelin/contracts/utils/Errors.sol";

error ERC2771ForwarderInvalidSignerWithNonce(address signer, address from, uint256 expectedNonce);
error ERC2771ForwarderInvalidSigner(address signer, address from);
error ERC2771ForwarderMismatchedValue(uint256 requestedValue, uint256 msgValue);

contract Forwarder is ERC2771Forwarder {
    constructor() ERC2771Forwarder("AssetTokenizationForwarder") { }

    function execute(ForwardRequestData calldata request) public payable virtual override {
        // We make sure that msg.value and request.value match exactly.
        // If the request is invalid or the call reverts, this whole function
        // will revert, ensuring value isn't stuck.
        if (msg.value != request.value) {
            revert ERC2771ForwarderMismatchedValue(request.value, msg.value);
        }

        try this.executeInternal(request) returns (bool success) {
            if (!success) {
                revert Errors.FailedCall();
            }
        } catch Error(string memory reason) {
            // Re-throw string errors as is
            revert(reason);
        } catch Panic(uint256 errorCode) {
            // Re-throw panics as isgit b
            assembly {
                mstore(0x0, 0x4e487b71) // `bytes4(keccak256("Panic(uint256)")))`
                mstore(0x4, errorCode)
                revert(0x0, 0x24)
            }
        } catch (bytes memory reason) {
            // Check if this is an ERC2771ForwarderInvalidSigner error
            bytes4 selector = bytes4(reason);
            if (selector == ERC2771ForwarderInvalidSigner.selector) {
                // Extract the error parameters using assembly since we know the layout
                address signer;
                address from;
                assembly {
                    signer := mload(add(reason, 36)) // 32 (offset) + 4 (selector)
                    from := mload(add(reason, 68)) // 32 (offset) + 4 (selector) + 32 (first param)
                }
                // Get the current nonce and throw our enhanced error
                revert ERC2771ForwarderInvalidSignerWithNonce(signer, from, nonces(from));
            }
            // Re-throw any other errors
            assembly {
                revert(add(reason, 32), mload(reason))
            }
        }
    }

    function executeInternal(ForwardRequestData calldata request) public payable returns (bool) {
        super.execute(request);
        return true; // If we get here, it means the call succeeded
    }
}
