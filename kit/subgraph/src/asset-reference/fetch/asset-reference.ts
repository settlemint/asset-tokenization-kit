import { Address, BigInt, ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";
import { AssetReference } from "../../../generated/schema";
import { fetchToken } from "../../token/fetch/token";

export function fetchAssetReference(asset: Address, chainId: BigInt): AssetReference {
  const keyMaterial = asset.toHexString().concat(":").concat(chainId.toString());
  const referenceId = Bytes.fromByteArray(crypto.keccak256(ByteArray.fromUTF8(keyMaterial)));

  let assetReference = AssetReference.load(referenceId);
  if (!assetReference) {
    assetReference = new AssetReference(referenceId);
  }

  assetReference.chainId = chainId;
  assetReference.address = asset;

  if (chainId.equals(BigInt.zero())) {
    const localToken = fetchToken(asset);
    assetReference.token = localToken.id;
  } else {
    assetReference.token = null;
  }

  assetReference.save();

  return assetReference;
}
