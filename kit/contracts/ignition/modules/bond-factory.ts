import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const BondFactoryModule = buildModule('BondFactoryModule', (m) => {
  const bondFactory = m.contract('BondFactory', [], {
    id: 'bondFactory',
  });

  return { bondFactory };
});

export default BondFactoryModule;
