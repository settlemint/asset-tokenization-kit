import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { XVP_SETTLEMENT_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import type { CreateXvpInput } from "./create-schema";

const XvpFactoryCreate = portalGraphql(`
  mutation XvPSettlementFactoryCreate($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: XvPSettlementFactoryCreateInput!) {
    XvPSettlementFactoryCreate(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      address: $address
      from: $from
      input: $input
    ) {
      transactionHash
    }
  }
`);

export const createXvpFunction = async ({
  parsedInput: {
    flows,
    expiry,
    autoExecute,
    verificationCode,
    verificationType,
  },
  ctx: { user },
}: {
  parsedInput: CreateXvpInput;
  ctx: { user: User };
}) => {
  const transformedFlows = flows.map((flow) => ({
    from: flow.from,
    to: flow.to,
    asset: flow.asset.id,
    amount: parseUnits(flow.amount.toString(), flow.asset.decimals).toString(),
  }));

  const result = await portalClient.request(XvpFactoryCreate, {
    address: XVP_SETTLEMENT_FACTORY_ADDRESS,
    from: user.wallet,
    input: {
      autoExecute,
      cutoffDate: formatDate(expiry, {
        type: "unixSeconds",
      }),
      flows: transformedFlows,
    },
    ...(await handleChallenge(
      user,
      user.wallet,
      verificationCode,
      verificationType
    )),
  });

  const createTxHash = result.XvPSettlementFactoryCreate?.transactionHash;
  if (!createTxHash) {
    throw new Error("Failed to create XVP: no transaction hash received");
  }
  const hashes = safeParse(t.Hashes(), [createTxHash]);
  return await waitForIndexingTransactions(hashes);
};
