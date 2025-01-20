import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import BondFactoryModule from './bond-factory';

const BondsModule = buildModule('BondsModule', (m) => {
  const { bondFactory } = m.useModule(BondFactoryModule);

  const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
  const createBondUSTB = m.call(bondFactory, 'create', ['US Treasury Bond', 'USTB', 8, oneYearFromNow], {
    id: 'createBondUSTB',
  });
  const readBondUSTBAddress = m.readEventArgument(createBondUSTB, 'BondCreated', 'token', {
    id: 'readBondUSTBAddress',
  });
  const ustb = m.contractAt('Bond', readBondUSTBAddress, { id: 'bondUSTB' });

  return { ustb };
});

export default BondsModule;
