import { owner } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";
import type { Asset } from "../../../entities/asset";
import { atkDeployer } from "../../../services/deployer";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";
import {
  encodeExpressionParams,
  ExpressionNode,
  expressionToString,
} from "../../utils/expression-builder";

export const updateRequiredTopics = async (
  asset: Asset<any>,
  expression: ExpressionNode[]
) => {
  console.log(`[Update Required Topics] → Starting topic update...`);

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.setParametersForComplianceModule([
      atkDeployer.getContractAddress("identityVerificationModule"),
      encodeExpressionParams(expression),
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Update Required Topics] ✓ ${expressionToString(expression)} set for ${asset.name} (${asset.address})`
  );
};
