import { ResultOf } from "gql.tada";
import { theGraphGraphql } from "./thegraph-client";

type TOKEN_QUERY = ReturnType<
  typeof theGraphGraphql<
    `query {
    tokens {
      basePriceClaim {
        values {
          key
          value
        }
      }
      totalSupply
      bond {
        faceValue
        denominationAsset {
          basePriceClaim {
            values {
              key
              value
            }
          }
        }
      }
    }
  }
`,
    []
  >
>;

type Token = ResultOf<TOKEN_QUERY>["tokens"][number];

export const getBasePrice = (
  token: Omit<Token, "totalSupply"> | undefined
): number => {
  if (!token) {
    return 0;
  }
  let basePriceClaim: Token["basePriceClaim"] | undefined;
  if (token.bond) {
    basePriceClaim = token.bond.denominationAsset?.basePriceClaim;
  } else {
    basePriceClaim = token.basePriceClaim;
  }
  const basePrice = basePriceClaim?.values.find(
    (value) => value.key === "amount"
  )?.value;
  const basePriceDecimals =
    basePriceClaim?.values.find((value) => value.key === "decimals")?.value ??
    "0";
  const basePriceParsed =
    Number(basePrice) / Math.pow(10, Number(basePriceDecimals));
  if (token.bond) {
    return basePriceParsed * Number(token.bond.faceValue);
  }
  return basePriceParsed;
};

export const getTotalValueInBaseCurrency = (
  token: Token | undefined
): number => {
  if (!token) {
    return 0;
  }
  return getBasePrice(token) * Number(token.totalSupply);
};
