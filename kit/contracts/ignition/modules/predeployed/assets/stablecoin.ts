import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../forwarder';

const StableCoinModule = buildModule('StableCoinModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const stablecoinFactoryImplementation = m.contract(
    'ATKStableCoinFactoryImplementation',
    [forwarder]
  );
  const stablecoinImplementation = m.contract('ATKStableCoinImplementation', [
    forwarder,
  ]);

  return { stablecoinFactoryImplementation, stablecoinImplementation };
});

export default StableCoinModule;
