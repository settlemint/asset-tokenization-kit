import { t } from "@/lib/utils/typebox";

export const AirdropDistributionSchema = t.Array(
  t.Object({
    amount: t
      .Transform(t.String())
      .Decode((value) => {
        const amount = Number(value);
        if (isNaN(amount)) {
          throw new Error(`Invalid amount: ${value}. Amount must be a number.`);
        }

        return amount;
      })
      .Encode((value) => value.toString()),
    recipient: t.EthereumAddress({
      description: "The address of the recipient",
    }),
  })
);
