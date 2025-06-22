/* eslint-disable */
/* prettier-ignore */
import type { TadaDocumentNode, $tada } from 'gql.tada';

declare module 'gql.tada' {
 interface setupCache {
    "\n  mutation CreateAccountMutation($keyVaultId: String!, $userId: String!) {\n    createWallet(keyVaultId: $keyVaultId, walletInfo: {name: $userId}) {\n      address\n    }\n  }\n":
      TadaDocumentNode<{ createWallet: { address: string | null; } | null; }, { userId: string; keyVaultId: string; }, void>;
    "\n  query GetTransaction($transactionHash: String!) {\n    getTransaction(transactionHash: $transactionHash) {\n      receipt {\n        status\n        revertReasonDecoded\n        revertReason\n        blockNumber\n      }\n    }\n  }\n":
      TadaDocumentNode<{ getTransaction: { receipt: { status: "Reverted" | "Success"; revertReasonDecoded: string | null; revertReason: string | null; blockNumber: string; } | null; } | null; }, { transactionHash: string; }, void>;
    "\n  mutation CreateSystemMutation($address: String!, $from: String!) {\n    ATKSystemFactoryCreateSystem(\n      address: $address\n      from: $from\n    ) {\n      transactionHash\n    }\n  }\n":
      TadaDocumentNode<{ ATKSystemFactoryCreateSystem: { transactionHash: string | null; } | null; }, { from: string; address: string; }, void>;
    "\n  mutation BootstrapSystemMutation($address: String!, $from: String!) {\n    IATKSystemBootstrap(\n      address: $address\n      from: $from\n    ) {\n      transactionHash\n    }\n  }\n":
      TadaDocumentNode<{ IATKSystemBootstrap: { transactionHash: string | null; } | null; }, { from: string; address: string; }, void>;
    "\n  mutation CreateTokenFactory(\n    $address: String!\n    $from: String!\n    $factoryImplementation: String!\n    $tokenImplementation: String!\n    $name: String!\n  ) {\n    IATKTokenFactoryRegistryRegisterTokenFactory(\n      address: $address\n      from: $from\n      input: {\n        factoryImplementation: $factoryImplementation\n        name: $name\n        tokenImplementation: $tokenImplementation\n      }\n    ) {\n      transactionHash\n    }\n  }\n":
      TadaDocumentNode<{ IATKTokenFactoryRegistryRegisterTokenFactory: { transactionHash: string | null; } | null; }, { name: string; tokenImplementation: string; factoryImplementation: string; from: string; address: string; }, void>;
  }
}
