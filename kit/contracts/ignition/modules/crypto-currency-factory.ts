import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const CryptoCurrencyFactoryModule = buildModule(
  "CryptoCurrencyFactoryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);
    const cryptoCurrencyFactory = m.contract("CryptoCurrencyFactory", [
      forwarder,
    ]);

    return { cryptoCurrencyFactory };
  },
);

export default CryptoCurrencyFactoryModule;
