export const OffChainStableCoinSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the stablecoin token",
    }),
    valueInBaseCurrency: t.Number({
      minimum: 0,
      description: "The token's value in terms of the base fiat currency",
    }),
  },
  {
    description:
      "Off-chain data for stablecoin tokens including market value information",
  }
);
