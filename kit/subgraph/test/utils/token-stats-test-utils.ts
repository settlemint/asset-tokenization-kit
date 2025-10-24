import type { ResultOf } from "gql.tada";
import { theGraphGraphql } from "./thegraph-client";

type TOKEN_QUERY = ReturnType<
  typeof theGraphGraphql<
    `query {
    tokens {
      basePrice
      totalSupply
      bond {
        faceValue
        denominationAsset {
          basePrice
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
  if (token.bond) {
    return (
      Number(token.bond.denominationAsset.basePrice) *
      Number(token.bond.faceValue)
    );
  }
  return token.basePrice;
};

export const getTotalValueInBaseCurrency = (
  token: Token | undefined
): number => {
  if (!token) {
    return 0;
  }
  return getBasePrice(token) * Number(token.totalSupply);
};
