import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { t } from "@/lib/utils/typebox";

export const BondMaturedEventFragment = theGraphGraphqlKit(
  `
  fragment BondMaturedEventFragment on BondMaturedEvent {
    id
    timestamp
    emitter {
      id
    }
    sender {
      id
    }
  }
`,
  []
);

export const BondMaturedEventSchema = t.Object({
  id: t.String(),
  timestamp: t.Timestamp(),
  emitter: t.Object({
    id: t.EthereumAddress(),
  }),
  sender: t.Object({
    id: t.EthereumAddress(),
  }),
});
