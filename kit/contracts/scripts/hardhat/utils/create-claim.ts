import type { Address, LocalAccount } from 'viem';
import { encodeAbiParameters, keccak256, parseAbiParameters } from 'viem';

export async function createClaim(
  signer: LocalAccount,
  subjectIdentityAddress: `0x${string}`,
  claimTopic: bigint,
  claimData: `0x${string}`
): Promise<{
  data: `0x${string}`;
  signature: `0x${string}`;
  topicId: bigint;
}> {
  // Encode data to match Solidity's abi.encode(address, uint256, bytes)
  const dataToSign = encodeAbiParameters(
    parseAbiParameters(
      'address subject, uint256 topicValue, bytes memory dataBytes'
    ),
    [subjectIdentityAddress, claimTopic, claimData]
  );

  // Hash the encoded data
  const dataHash = keccak256(dataToSign);

  // Sign the dataHash directly. Viem's signMessage with a raw Hex message (`{ raw: dataHash }`)
  // will correctly apply the EIP-191 prefix "\x19Ethereum Signed Message:\n32" before hashing and signing,
  // aligning with Solidity's `keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash))`.
  const signatureHex = await signer.signMessage({ message: { raw: dataHash } });

  return {
    data: claimData,
    signature: signatureHex,
    topicId: claimTopic,
  };
}
