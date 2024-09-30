export default {
  "framework": "nextjs",
  "instance": "https://console.settlemint.com",
  "workspace": {
    "id": "settlemint-product-strategy-f4e9",
    "displayName": "SettleMint Product Strategy"
  },
  "defaultApplication": {
    "id": "starterkit-asset-tokenization-8687d",
    "displayName": "StarterKit - Asset Tokenization"
  },
  "applications": {
    "starterkit-asset-tokenization-8687d": {
      "application": {
        "id": "starterkit-asset-tokenization-8687d",
        "displayName": "StarterKit - Asset Tokenization"
      },
      "thegraphGql": "https://skat-the-graph-83c5c.gke-europe.settlemint.com/subgraphs/name/skat-empty-5fd4a",
      "subgraphName": "starterkits",
      "hasuraGql": "https://skat-hasura-ce14f.gke-europe.settlemint.com/v1/graphql",
      "nodeJsonRpc": "https://skat-lb-8fb28.gke-europe.settlemint.com/",
      "nodeJsonRpcDeploy": "https://skat-validator-9cd37.gke-europe.settlemint.com/",
      "userWallet": "skat-users-0c206"
    }
  }
};