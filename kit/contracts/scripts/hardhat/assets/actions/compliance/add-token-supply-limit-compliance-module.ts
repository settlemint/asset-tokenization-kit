import { encodeAbiParameters, parseAbiParameters } from "viem";
import { owner } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";
import type { Asset } from "../../../entities/asset";
import { atkDeployer } from "../../../services/deployer";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const addTokenSupplyLimitComplianceModule = async (
  asset: Asset<any>,
  {
    maxSupplyExact,
    periodLengthDays,
    rolling,
    useBasePrice,
    global,
  }: {
    maxSupplyExact: number;
    periodLengthDays: number;
    rolling: boolean;
    useBasePrice: boolean;
    global: boolean;
  }
) => {
  console.log(
    `[Add token supply limit compliance module] → Starting module addition...`
  );

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  // Encode SupplyLimitConfig struct: (uint256 maxSupply, uint256 periodLength, bool rolling, bool useBasePrice, bool global)
  const encodedParams = encodeAbiParameters(
    parseAbiParameters("(uint256,uint256,bool,bool,bool)"),
    [
      [
        BigInt(maxSupplyExact),
        BigInt(periodLengthDays),
        rolling,
        useBasePrice,
        global,
      ],
    ]
  );

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.addComplianceModule([
      atkDeployer.getContractAddress("tokenSupplyLimitModule"),
      encodedParams,
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Add token supply limit compliance module] ✓ ${maxSupplyExact} added for ${asset.name} (${asset.address})`
  );
};
