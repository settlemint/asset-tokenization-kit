import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating update currency mutation inputs
 *
 * @property {string} currency - The currency code to set as user preference
 */
export function UpdateCurrencySchema() {
  return t.Object(
    {
      currency: t.Union(
        [
          t.Literal("USD"),
          t.Literal("EUR"),
          t.Literal("JPY"),
          t.Literal("AED"),
          t.Literal("SGD"),
          t.Literal("SAR"),
          t.Literal("GBP"),
          t.Literal("CHF"),
        ],
        {
          description: "The currency code to set as user preference",
        }
      ),
    },
    {
      description: "Schema for validating update currency mutation inputs",
    }
  );
}

export type UpdateCurrencyInput = StaticDecode<
  ReturnType<typeof UpdateCurrencySchema>
>;
