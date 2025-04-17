import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import EASModule from "./eas";
import ForwarderModule from "./forwarder";

const CryptoCurrencyFactoryModule = buildModule(
  "CryptoCurrencyFactoryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);
    const { eas } = m.useModule(EASModule);

    const cryptoCurrencyFactory = m.contract("CryptoCurrencyFactory", [
      forwarder,
      eas,
    ]);

    return { cryptoCurrencyFactory };
  }
);

export default CryptoCurrencyFactoryModule;
