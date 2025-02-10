// import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

// const Transactions = theGraphGraphqlStarterkits(
//   `
// query Transactions {
//   assetEvents {
//     ... on ApprovalEvent {
//       eventName
//       timestamp
//       owner {
//         id
//       }
//       sender {
//         id
//       }
//       value
//     }
//     ... on BondMaturedEvent {
//       eventName
//       timestamp
//       sender {
//         id
//       }
//     }
//     ... on BondRedeemedEvent {
//       eventName
//       timestamp
//       sender {
//         id
//       }
//       bondAmount
//       underlyingAmount
//     }
//     ... on BurnEvent {
//       eventName
//       timestamp
//       sender {
//         id
//       }
//       value
//       from {
//         id
//       }
//     }
//     ... on CollateralUpdatedEvent {
//       timestamp
//       eventName
//       sender {
//         id
//       }
//       newAmount
//       oldAmount
//     }
//     ... on ManagementFeeCollectedEvent {
//       eventName
//       timestamp
//       amount
//       sender {
//         id
//       }
//     }
//     ... on MintEvent {
//       eventName
//       timestamp
//       sender {
//         id
//       }
//       to {
//         id
//       }
//       value
//     }
//     ... on PausedEvent {
//       eventName
//       timestamp
//       sender {
//         id
//       }
//     }
//     ... on PerformanceFeeCollectedEvent {
//       eventName
//       timestamp
//       amount
//       sender {
//         id
//       }
//     }
//     ... on RoleAdminChangedEvent {
//       eventName
//       timestamp
//       newAdminRole
//       previousAdminRole
//       sender {
//         id
//       }
//       role
//     }
//     ... on RoleGrantedEvent {
//       eventName
//       timestamp
//       role
//       sender {
//         id
//       }
//       account {
//         id
//       }
//     }
//     ... on RoleRevokedEvent {
//       eventName
//       timestamp
//       account {
//         id
//       }
//       role
//       sender {
//         id
//       }
//     }
//     ... on TokenWithdrawnEvent {
//       eventName
//       timestamp
//       amount
//       sender {
//         id
//       }
//       to {
//         id
//       }
//       token {
//         name
//         symbol
//       }
//     }
//     ... on TokensFrozenEvent {
//       eventName
//       timestamp
//       amount
//       sender {
//         id
//       }
//       user {
//         id
//       }
//     }
//     ... on TokensUnfrozenEvent {
//       eventName
//       timestamp
//       amount
//       sender {
//         id
//       }
//       user {
//         id
//       }
//     }
//     ... on TransferEvent {
//       eventName
//       timestamp
//       from {
//         id
//       }
//       to {
//         id
//       }
//       value
//       sender {
//         id
//       }
//     }
//     ... on UnpausedEvent {
//       eventName
//       timestamp
//       sender {
//         id
//       }
//     }
//     ... on UserBlockedEvent {
//       eventName
//       timestamp
//       sender {
//         id
//       }
//       user {
//         id
//       }
//     }
//     ... on UserUnblockedEvent {
//       eventName
//       timestamp
//       sender {
//         id
//       }
//       user {
//         id
//       }
//     }
//     emitter {
//       name
//       symbol
//     }
//   }
//   factoryEvents {
//     eventName
//     timestamp
//     asset {
//       name
//       symbol
//     }
//     sender {
//       id
//     }
//   }
// }
// `
// );

// export async function getTransactions() {
//   const theGraphData = await theGraphClientStarterkits.request(Transactions);

//   return [...theGraphData.assetEvents, ...theGraphData.factoryEvents];
// }
