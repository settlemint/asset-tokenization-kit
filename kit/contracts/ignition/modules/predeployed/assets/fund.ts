import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../forwarder';

const FundModule = buildModule('FundModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const fundFactoryImplementation = m.contract('ATKFundFactoryImplementation', [
    forwarder,
  ]);
  const fundImplementation = m.contract('ATKFundImplementation', [forwarder]);

  return { fundFactoryImplementation, fundImplementation };
});

export default FundModule;
