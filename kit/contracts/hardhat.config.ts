import "@nomicfoundation/hardhat-foundry";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomiclabs/hardhat-solhint";
import type { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          evmVersion: "cancun",
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {},
    btp: {
      url: process.env.BTP_RPC_URL || "",
      gasPrice: process.env.BTP_GAS_PRICE
        ? Number.parseInt(process.env.BTP_GAS_PRICE)
        : "auto",
    },
  },
};

export default config;
