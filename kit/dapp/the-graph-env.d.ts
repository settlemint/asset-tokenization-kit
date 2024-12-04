/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
  Account: {
    kind: "OBJECT";
    name: "Account";
    fields: {
      ERC20DexBurns: {
        name: "ERC20DexBurns";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexBurn"; ofType: null } };
          };
        };
      };
      ERC20DexMints: {
        name: "ERC20DexMints";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexMint"; ofType: null } };
          };
        };
      };
      ERC20DexSwaps: {
        name: "ERC20DexSwaps";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexSwap"; ofType: null } };
          };
        };
      };
      ERC20approvalsOwner: {
        name: "ERC20approvalsOwner";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Approval"; ofType: null } };
          };
        };
      };
      ERC20approvalsSpender: {
        name: "ERC20approvalsSpender";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Approval"; ofType: null } };
          };
        };
      };
      ERC20balances: {
        name: "ERC20balances";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Balance"; ofType: null } };
          };
        };
      };
      ERC20transferFromEvent: {
        name: "ERC20transferFromEvent";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Transfer"; ofType: null } };
          };
        };
      };
      ERC20transferToEvent: {
        name: "ERC20transferToEvent";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Transfer"; ofType: null } };
          };
        };
      };
      asERC20: { name: "asERC20"; type: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
      events: {
        name: "events";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "INTERFACE"; name: "Event"; ofType: null } };
          };
        };
      };
      id: {
        name: "id";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Bytes"; ofType: null } };
      };
    };
  };
  Account_filter: {
    kind: "INPUT_OBJECT";
    name: "Account_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Bytes"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Bytes"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "id_contains"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_not_contains"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "asERC20"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asERC20_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asERC20_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asERC20_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asERC20_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asERC20_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asERC20_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "asERC20_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "asERC20_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asERC20_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asERC20_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asERC20_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asERC20_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asERC20_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asERC20_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asERC20_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asERC20_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asERC20_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asERC20_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asERC20_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "asERC20_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Contract_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "ERC20balances_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Balance_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "ERC20approvalsOwner_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Approval_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "ERC20approvalsSpender_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Approval_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "ERC20transferFromEvent_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Transfer_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "ERC20transferToEvent_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Transfer_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "ERC20DexMints_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20DexMint_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "ERC20DexBurns_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20DexBurn_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "ERC20DexSwaps_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20DexSwap_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "events_"; type: { kind: "INPUT_OBJECT"; name: "Event_filter"; ofType: null }; defaultValue: null },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: { kind: "LIST"; name: never; ofType: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null } };
        defaultValue: null;
      },
      {
        name: "or";
        type: { kind: "LIST"; name: never; ofType: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null } };
        defaultValue: null;
      },
    ];
  };
  Account_orderBy: {
    name: "Account_orderBy";
    enumValues:
      | "id"
      | "asERC20"
      | "asERC20__id"
      | "asERC20__name"
      | "asERC20__symbol"
      | "asERC20__decimals"
      | "asERC20__extraData"
      | "asERC20__totalSupply"
      | "asERC20__totalSupplyExact"
      | "ERC20balances"
      | "ERC20approvalsOwner"
      | "ERC20approvalsSpender"
      | "ERC20transferFromEvent"
      | "ERC20transferToEvent"
      | "ERC20DexMints"
      | "ERC20DexBurns"
      | "ERC20DexSwaps"
      | "events";
  };
  Aggregation_interval: { name: "Aggregation_interval"; enumValues: "hour" | "day" };
  BigDecimal: unknown;
  BigInt: unknown;
  BlockChangedFilter: {
    kind: "INPUT_OBJECT";
    name: "BlockChangedFilter";
    isOneOf: false;
    inputFields: [
      {
        name: "number_gte";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
        defaultValue: null;
      },
    ];
  };
  Block_height: {
    kind: "INPUT_OBJECT";
    name: "Block_height";
    isOneOf: false;
    inputFields: [
      { name: "hash"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "number"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "number_gte"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
    ];
  };
  Boolean: unknown;
  Bytes: unknown;
  ERC20Approval: {
    kind: "OBJECT";
    name: "ERC20Approval";
    fields: {
      contract: {
        name: "contract";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
      };
      id: { name: "id"; type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } } };
      owner: {
        name: "owner";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      spender: {
        name: "spender";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      value: {
        name: "value";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      valueExact: {
        name: "valueExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
    };
  };
  ERC20Approval_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20Approval_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "contract"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "contract_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "contract_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "contract_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "contract_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "contract_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "contract_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Contract_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "owner"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "owner_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "owner_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "owner_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "owner_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "owner_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "owner_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "owner_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "owner_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "spender"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "spender_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "spender_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "spender_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "spender_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "spender_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "spender_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "spender_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "spender_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "spender_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "spender_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "spender_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "spender_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "spender_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "spender_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "spender_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "spender_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "spender_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "spender_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "spender_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "spender_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "value"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "value_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "value_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "valueExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "valueExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "valueExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20Approval_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20Approval_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20Approval_orderBy: {
    name: "ERC20Approval_orderBy";
    enumValues:
      | "id"
      | "contract"
      | "contract__id"
      | "contract__name"
      | "contract__symbol"
      | "contract__decimals"
      | "contract__extraData"
      | "contract__totalSupply"
      | "contract__totalSupplyExact"
      | "owner"
      | "owner__id"
      | "spender"
      | "spender__id"
      | "value"
      | "valueExact";
  };
  ERC20Balance: {
    kind: "OBJECT";
    name: "ERC20Balance";
    fields: {
      account: { name: "account"; type: { kind: "OBJECT"; name: "Account"; ofType: null } };
      contract: {
        name: "contract";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
      };
      id: { name: "id"; type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } } };
      transferFromEvent: {
        name: "transferFromEvent";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Transfer"; ofType: null } };
          };
        };
      };
      transferToEvent: {
        name: "transferToEvent";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Transfer"; ofType: null } };
          };
        };
      };
      value: {
        name: "value";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      valueExact: {
        name: "valueExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
    };
  };
  ERC20Balance_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20Balance_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "contract"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "contract_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "contract_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "contract_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "contract_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "contract_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "contract_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Contract_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "account"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "account_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "account_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "account_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "account_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "account_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "account_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "account_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "account_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "account_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "account_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "account_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "value"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "value_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "value_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "valueExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "valueExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "valueExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "transferFromEvent_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Transfer_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transferToEvent_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Transfer_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20Balance_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20Balance_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20Balance_orderBy: {
    name: "ERC20Balance_orderBy";
    enumValues:
      | "id"
      | "contract"
      | "contract__id"
      | "contract__name"
      | "contract__symbol"
      | "contract__decimals"
      | "contract__extraData"
      | "contract__totalSupply"
      | "contract__totalSupplyExact"
      | "account"
      | "account__id"
      | "value"
      | "valueExact"
      | "transferFromEvent"
      | "transferToEvent";
  };
  ERC20Contract: {
    kind: "OBJECT";
    name: "ERC20Contract";
    fields: {
      approvals: {
        name: "approvals";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Approval"; ofType: null } };
          };
        };
      };
      asAccount: {
        name: "asAccount";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      balances: {
        name: "balances";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Balance"; ofType: null } };
          };
        };
      };
      decimals: {
        name: "decimals";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
      };
      extraData: { name: "extraData"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
      id: {
        name: "id";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Bytes"; ofType: null } };
      };
      name: {
        name: "name";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
      };
      pairsBaseToken: {
        name: "pairsBaseToken";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
          };
        };
      };
      pairsQuoteToken: {
        name: "pairsQuoteToken";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
          };
        };
      };
      symbol: {
        name: "symbol";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
      };
      totalSupply: {
        name: "totalSupply";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      totalSupplyExact: {
        name: "totalSupplyExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      transfers: {
        name: "transfers";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Transfer"; ofType: null } };
          };
        };
      };
    };
  };
  ERC20Contract_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20Contract_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Bytes"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Bytes"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "id_contains"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_not_contains"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "asAccount"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asAccount_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "asAccount_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "asAccount_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asAccount_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asAccount_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asAccount_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asAccount_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asAccount_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asAccount_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asAccount_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asAccount_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asAccount_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asAccount_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "name"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "name_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "name_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "name_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "name_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "name_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_not_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "symbol_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "symbol_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "symbol_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "symbol_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "symbol_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "symbol_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "symbol_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "symbol_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "decimals"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "decimals_not"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "decimals_gt"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "decimals_lt"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "decimals_gte"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "decimals_lte"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      {
        name: "decimals_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "decimals_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "extraData"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "extraData_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "extraData_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "extraData_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "extraData_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "extraData_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "extraData_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "extraData_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "extraData_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "extraData_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "extraData_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "extraData_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "extraData_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "extraData_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "extraData_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "extraData_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "extraData_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "extraData_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "extraData_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "extraData_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "totalSupply"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "totalSupply_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "totalSupply_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "totalSupplyExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "totalSupplyExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "totalSupplyExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "balances_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Balance_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "approvals_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Approval_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transfers_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Transfer_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "pairsBaseToken_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20DexPair_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "pairsQuoteToken_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20DexPair_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20Contract_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20Contract_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20Contract_orderBy: {
    name: "ERC20Contract_orderBy";
    enumValues:
      | "id"
      | "asAccount"
      | "asAccount__id"
      | "name"
      | "symbol"
      | "decimals"
      | "extraData"
      | "totalSupply"
      | "totalSupplyExact"
      | "balances"
      | "approvals"
      | "transfers"
      | "pairsBaseToken"
      | "pairsQuoteToken";
  };
  ERC20DexBurn: {
    kind: "OBJECT";
    name: "ERC20DexBurn";
    fields: {
      baseAmount: {
        name: "baseAmount";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      baseAmountExact: {
        name: "baseAmountExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      emitter: {
        name: "emitter";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      id: { name: "id"; type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } } };
      liquidity: {
        name: "liquidity";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      liquidityExact: {
        name: "liquidityExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      pair: {
        name: "pair";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
      };
      quoteAmount: {
        name: "quoteAmount";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      quoteAmountExact: {
        name: "quoteAmountExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      sender: {
        name: "sender";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      timestamp: {
        name: "timestamp";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      transaction: {
        name: "transaction";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Transaction"; ofType: null } };
      };
    };
  };
  ERC20DexBurn_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20DexBurn_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "transaction_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_";
        type: { kind: "INPUT_OBJECT"; name: "Transaction_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "emitter_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "emitter_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "timestamp"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "timestamp_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "timestamp_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "pair_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "pair_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_"; type: { kind: "INPUT_OBJECT"; name: "ERC20DexPair_filter"; ofType: null }; defaultValue: null },
      { name: "sender"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "sender_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "sender_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "sender_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "sender_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "sender_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "sender_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "sender_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "sender_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "sender_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "baseAmount"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmount_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmount_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmount_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmount_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmount_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "baseAmount_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseAmount_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseAmountExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "baseAmountExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseAmountExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteAmount"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmount_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmount_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmount_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmount_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmount_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "quoteAmount_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteAmount_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteAmountExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "quoteAmountExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteAmountExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "liquidity"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "liquidity_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "liquidity_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "liquidityExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "liquidityExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "liquidityExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexBurn_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexBurn_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20DexBurn_orderBy: {
    name: "ERC20DexBurn_orderBy";
    enumValues:
      | "id"
      | "transaction"
      | "transaction__id"
      | "transaction__timestamp"
      | "transaction__blockNumber"
      | "emitter"
      | "emitter__id"
      | "timestamp"
      | "pair"
      | "pair__id"
      | "pair__name"
      | "pair__symbol"
      | "pair__decimals"
      | "pair__baseReserve"
      | "pair__baseReserveExact"
      | "pair__quoteReserve"
      | "pair__quoteReserveExact"
      | "pair__totalSupply"
      | "pair__totalSupplyExact"
      | "pair__baseTokenPrice"
      | "pair__baseTokenPriceExact"
      | "pair__quoteTokenPrice"
      | "pair__quoteTokenPriceExact"
      | "pair__swapFee"
      | "sender"
      | "sender__id"
      | "baseAmount"
      | "baseAmountExact"
      | "quoteAmount"
      | "quoteAmountExact"
      | "liquidity"
      | "liquidityExact";
  };
  ERC20DexEmergencyWithdraw: {
    kind: "OBJECT";
    name: "ERC20DexEmergencyWithdraw";
    fields: {
      amount: {
        name: "amount";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      emitter: {
        name: "emitter";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      id: { name: "id"; type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } } };
      pair: {
        name: "pair";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
      };
      timestamp: {
        name: "timestamp";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      token: {
        name: "token";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
      };
      transaction: {
        name: "transaction";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Transaction"; ofType: null } };
      };
    };
  };
  ERC20DexEmergencyWithdraw_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20DexEmergencyWithdraw_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "transaction_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_";
        type: { kind: "INPUT_OBJECT"; name: "Transaction_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "emitter_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "emitter_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "timestamp"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "timestamp_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "timestamp_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "pair_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "pair_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_"; type: { kind: "INPUT_OBJECT"; name: "ERC20DexPair_filter"; ofType: null }; defaultValue: null },
      { name: "token"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "token_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "token_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "token_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "token_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "token_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "token_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "token_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Contract_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "amount"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "amount_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "amount_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "amount_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "amount_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "amount_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "amount_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "amount_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexEmergencyWithdraw_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexEmergencyWithdraw_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20DexEmergencyWithdraw_orderBy: {
    name: "ERC20DexEmergencyWithdraw_orderBy";
    enumValues:
      | "id"
      | "transaction"
      | "transaction__id"
      | "transaction__timestamp"
      | "transaction__blockNumber"
      | "emitter"
      | "emitter__id"
      | "timestamp"
      | "pair"
      | "pair__id"
      | "pair__name"
      | "pair__symbol"
      | "pair__decimals"
      | "pair__baseReserve"
      | "pair__baseReserveExact"
      | "pair__quoteReserve"
      | "pair__quoteReserveExact"
      | "pair__totalSupply"
      | "pair__totalSupplyExact"
      | "pair__baseTokenPrice"
      | "pair__baseTokenPriceExact"
      | "pair__quoteTokenPrice"
      | "pair__quoteTokenPriceExact"
      | "pair__swapFee"
      | "token"
      | "token__id"
      | "token__name"
      | "token__symbol"
      | "token__decimals"
      | "token__extraData"
      | "token__totalSupply"
      | "token__totalSupplyExact"
      | "amount";
  };
  ERC20DexFeeUpdate: {
    kind: "OBJECT";
    name: "ERC20DexFeeUpdate";
    fields: {
      emitter: {
        name: "emitter";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      id: { name: "id"; type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } } };
      newFee: {
        name: "newFee";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      oldFee: {
        name: "oldFee";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      pair: {
        name: "pair";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
      };
      timestamp: {
        name: "timestamp";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      transaction: {
        name: "transaction";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Transaction"; ofType: null } };
      };
    };
  };
  ERC20DexFeeUpdate_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20DexFeeUpdate_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "transaction_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_";
        type: { kind: "INPUT_OBJECT"; name: "Transaction_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "emitter_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "emitter_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "timestamp"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "timestamp_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "timestamp_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "pair_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "pair_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_"; type: { kind: "INPUT_OBJECT"; name: "ERC20DexPair_filter"; ofType: null }; defaultValue: null },
      { name: "oldFee"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "oldFee_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "oldFee_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "oldFee_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "oldFee_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "oldFee_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "oldFee_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "oldFee_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "newFee"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "newFee_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "newFee_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "newFee_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "newFee_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "newFee_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "newFee_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "newFee_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexFeeUpdate_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexFeeUpdate_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20DexFeeUpdate_orderBy: {
    name: "ERC20DexFeeUpdate_orderBy";
    enumValues:
      | "id"
      | "transaction"
      | "transaction__id"
      | "transaction__timestamp"
      | "transaction__blockNumber"
      | "emitter"
      | "emitter__id"
      | "timestamp"
      | "pair"
      | "pair__id"
      | "pair__name"
      | "pair__symbol"
      | "pair__decimals"
      | "pair__baseReserve"
      | "pair__baseReserveExact"
      | "pair__quoteReserve"
      | "pair__quoteReserveExact"
      | "pair__totalSupply"
      | "pair__totalSupplyExact"
      | "pair__baseTokenPrice"
      | "pair__baseTokenPriceExact"
      | "pair__quoteTokenPrice"
      | "pair__quoteTokenPriceExact"
      | "pair__swapFee"
      | "oldFee"
      | "newFee";
  };
  ERC20DexMint: {
    kind: "OBJECT";
    name: "ERC20DexMint";
    fields: {
      baseAmount: {
        name: "baseAmount";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      baseAmountExact: {
        name: "baseAmountExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      emitter: {
        name: "emitter";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      id: { name: "id"; type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } } };
      liquidity: {
        name: "liquidity";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      liquidityExact: {
        name: "liquidityExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      pair: {
        name: "pair";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
      };
      quoteAmount: {
        name: "quoteAmount";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      quoteAmountExact: {
        name: "quoteAmountExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      sender: {
        name: "sender";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      timestamp: {
        name: "timestamp";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      transaction: {
        name: "transaction";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Transaction"; ofType: null } };
      };
    };
  };
  ERC20DexMint_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20DexMint_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "transaction_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_";
        type: { kind: "INPUT_OBJECT"; name: "Transaction_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "emitter_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "emitter_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "timestamp"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "timestamp_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "timestamp_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "pair_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "pair_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_"; type: { kind: "INPUT_OBJECT"; name: "ERC20DexPair_filter"; ofType: null }; defaultValue: null },
      { name: "sender"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "sender_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "sender_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "sender_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "sender_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "sender_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "sender_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "sender_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "sender_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "sender_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "baseAmount"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmount_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmount_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmount_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmount_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmount_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "baseAmount_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseAmount_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseAmountExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "baseAmountExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseAmountExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteAmount"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmount_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmount_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmount_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmount_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmount_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "quoteAmount_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteAmount_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteAmountExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "quoteAmountExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteAmountExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "liquidity"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "liquidity_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "liquidity_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "liquidityExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "liquidityExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "liquidityExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexMint_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexMint_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20DexMint_orderBy: {
    name: "ERC20DexMint_orderBy";
    enumValues:
      | "id"
      | "transaction"
      | "transaction__id"
      | "transaction__timestamp"
      | "transaction__blockNumber"
      | "emitter"
      | "emitter__id"
      | "timestamp"
      | "pair"
      | "pair__id"
      | "pair__name"
      | "pair__symbol"
      | "pair__decimals"
      | "pair__baseReserve"
      | "pair__baseReserveExact"
      | "pair__quoteReserve"
      | "pair__quoteReserveExact"
      | "pair__totalSupply"
      | "pair__totalSupplyExact"
      | "pair__baseTokenPrice"
      | "pair__baseTokenPriceExact"
      | "pair__quoteTokenPrice"
      | "pair__quoteTokenPriceExact"
      | "pair__swapFee"
      | "sender"
      | "sender__id"
      | "baseAmount"
      | "baseAmountExact"
      | "quoteAmount"
      | "quoteAmountExact"
      | "liquidity"
      | "liquidityExact";
  };
  ERC20DexPair: {
    kind: "OBJECT";
    name: "ERC20DexPair";
    fields: {
      asAccount: {
        name: "asAccount";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      baseReserve: {
        name: "baseReserve";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      baseReserveExact: {
        name: "baseReserveExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      baseToken: {
        name: "baseToken";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
      };
      baseTokenPrice: {
        name: "baseTokenPrice";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      baseTokenPriceExact: {
        name: "baseTokenPriceExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      burns: {
        name: "burns";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexBurn"; ofType: null } };
          };
        };
      };
      decimals: {
        name: "decimals";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
      };
      id: {
        name: "id";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Bytes"; ofType: null } };
      };
      mints: {
        name: "mints";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexMint"; ofType: null } };
          };
        };
      };
      name: { name: "name"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
      quoteReserve: {
        name: "quoteReserve";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      quoteReserveExact: {
        name: "quoteReserveExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      quoteToken: {
        name: "quoteToken";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
      };
      quoteTokenPrice: {
        name: "quoteTokenPrice";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      quoteTokenPriceExact: {
        name: "quoteTokenPriceExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      stakes: {
        name: "stakes";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexStake"; ofType: null } };
          };
        };
      };
      swapFee: {
        name: "swapFee";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      swaps: {
        name: "swaps";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexSwap"; ofType: null } };
          };
        };
      };
      symbol: { name: "symbol"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
      totalSupply: {
        name: "totalSupply";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      totalSupplyExact: {
        name: "totalSupplyExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
    };
  };
  ERC20DexPairSnapshot: {
    kind: "OBJECT";
    name: "ERC20DexPairSnapshot";
    fields: {
      baseReserve: {
        name: "baseReserve";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      baseReserveExact: {
        name: "baseReserveExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      baseTokenPrice: {
        name: "baseTokenPrice";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      baseTokenPriceExact: {
        name: "baseTokenPriceExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      id: {
        name: "id";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int8"; ofType: null } };
      };
      liquidity: {
        name: "liquidity";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      liquidityExact: {
        name: "liquidityExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      pair: {
        name: "pair";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
      };
      quoteReserve: {
        name: "quoteReserve";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      quoteReserveExact: {
        name: "quoteReserveExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      quoteTokenPrice: {
        name: "quoteTokenPrice";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      quoteTokenPriceExact: {
        name: "quoteTokenPriceExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      timestamp: {
        name: "timestamp";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Timestamp"; ofType: null } };
      };
      totalSupply: {
        name: "totalSupply";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      totalSupplyExact: {
        name: "totalSupplyExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      txCount: {
        name: "txCount";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      volumeBaseToken: {
        name: "volumeBaseToken";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      volumeBaseTokenExact: {
        name: "volumeBaseTokenExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      volumeQuoteToken: {
        name: "volumeQuoteToken";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      volumeQuoteTokenExact: {
        name: "volumeQuoteTokenExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
    };
  };
  ERC20DexPairSnapshot_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20DexPairSnapshot_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int8"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int8"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "timestamp"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_not"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_gt"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_lt"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_gte"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_lte"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      {
        name: "timestamp_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Timestamp"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "timestamp_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Timestamp"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "pair_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "pair_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_"; type: { kind: "INPUT_OBJECT"; name: "ERC20DexPair_filter"; ofType: null }; defaultValue: null },
      { name: "baseReserve"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseReserve_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseReserve_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseReserve_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseReserve_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseReserve_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "baseReserve_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseReserve_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseReserveExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseReserveExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseReserveExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseReserveExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseReserveExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseReserveExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "baseReserveExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseReserveExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteReserve"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteReserve_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteReserve_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteReserve_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteReserve_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteReserve_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "quoteReserve_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteReserve_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteReserveExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteReserveExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteReserveExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteReserveExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteReserveExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteReserveExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "quoteReserveExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteReserveExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "totalSupply"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "totalSupply_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "totalSupply_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "totalSupplyExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "totalSupplyExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "totalSupplyExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseTokenPrice"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseTokenPrice_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseTokenPrice_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseTokenPrice_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseTokenPrice_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseTokenPrice_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "baseTokenPrice_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseTokenPrice_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseTokenPriceExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseTokenPriceExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseTokenPriceExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseTokenPriceExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseTokenPriceExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseTokenPriceExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "baseTokenPriceExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseTokenPriceExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteTokenPrice"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPrice_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPrice_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPrice_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPrice_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPrice_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "quoteTokenPrice_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteTokenPrice_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteTokenPriceExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPriceExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPriceExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPriceExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPriceExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPriceExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "quoteTokenPriceExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteTokenPriceExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "volumeBaseToken"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "volumeBaseToken_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "volumeBaseToken_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "volumeBaseToken_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "volumeBaseToken_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "volumeBaseToken_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "volumeBaseToken_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "volumeBaseToken_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "volumeBaseTokenExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volumeBaseTokenExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volumeBaseTokenExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volumeBaseTokenExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volumeBaseTokenExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volumeBaseTokenExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "volumeBaseTokenExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "volumeBaseTokenExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "volumeQuoteToken"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "volumeQuoteToken_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "volumeQuoteToken_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "volumeQuoteToken_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "volumeQuoteToken_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "volumeQuoteToken_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "volumeQuoteToken_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "volumeQuoteToken_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "volumeQuoteTokenExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volumeQuoteTokenExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volumeQuoteTokenExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volumeQuoteTokenExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volumeQuoteTokenExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volumeQuoteTokenExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "volumeQuoteTokenExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "volumeQuoteTokenExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "txCount"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "txCount_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "txCount_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "txCount_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "txCount_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "txCount_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "txCount_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "txCount_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "liquidity"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "liquidity_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "liquidity_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "liquidity_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "liquidityExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "liquidityExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "liquidityExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "liquidityExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexPairSnapshot_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexPairSnapshot_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20DexPairSnapshot_orderBy: {
    name: "ERC20DexPairSnapshot_orderBy";
    enumValues:
      | "id"
      | "timestamp"
      | "pair"
      | "pair__id"
      | "pair__name"
      | "pair__symbol"
      | "pair__decimals"
      | "pair__baseReserve"
      | "pair__baseReserveExact"
      | "pair__quoteReserve"
      | "pair__quoteReserveExact"
      | "pair__totalSupply"
      | "pair__totalSupplyExact"
      | "pair__baseTokenPrice"
      | "pair__baseTokenPriceExact"
      | "pair__quoteTokenPrice"
      | "pair__quoteTokenPriceExact"
      | "pair__swapFee"
      | "baseReserve"
      | "baseReserveExact"
      | "quoteReserve"
      | "quoteReserveExact"
      | "totalSupply"
      | "totalSupplyExact"
      | "baseTokenPrice"
      | "baseTokenPriceExact"
      | "quoteTokenPrice"
      | "quoteTokenPriceExact"
      | "volumeBaseToken"
      | "volumeBaseTokenExact"
      | "volumeQuoteToken"
      | "volumeQuoteTokenExact"
      | "txCount"
      | "liquidity"
      | "liquidityExact";
  };
  ERC20DexPairStats: {
    kind: "OBJECT";
    name: "ERC20DexPairStats";
    fields: {
      firstBasePrice: {
        name: "firstBasePrice";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      firstQuotePrice: {
        name: "firstQuotePrice";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      highestBasePrice: {
        name: "highestBasePrice";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      highestQuotePrice: {
        name: "highestQuotePrice";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      id: {
        name: "id";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int8"; ofType: null } };
      };
      lastBasePrice: {
        name: "lastBasePrice";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      lastBaseReserve: {
        name: "lastBaseReserve";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      lastQuotePrice: {
        name: "lastQuotePrice";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      lastQuoteReserve: {
        name: "lastQuoteReserve";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      lowestBasePrice: {
        name: "lowestBasePrice";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      lowestQuotePrice: {
        name: "lowestQuotePrice";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      pair: {
        name: "pair";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
      };
      timestamp: {
        name: "timestamp";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Timestamp"; ofType: null } };
      };
      totalLiquidity: {
        name: "totalLiquidity";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      totalTxCount: {
        name: "totalTxCount";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      totalVolumeBaseToken: {
        name: "totalVolumeBaseToken";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      totalVolumeQuoteToken: {
        name: "totalVolumeQuoteToken";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
    };
  };
  ERC20DexPairStats_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20DexPairStats_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int8"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "timestamp"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_gt"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_lt"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_gte"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_lte"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      {
        name: "timestamp_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Timestamp"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_"; type: { kind: "INPUT_OBJECT"; name: "ERC20DexPair_filter"; ofType: null }; defaultValue: null },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexPairStats_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexPairStats_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20DexPair_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20DexPair_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Bytes"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Bytes"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "id_contains"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "id_not_contains"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null }; defaultValue: null },
      { name: "asAccount"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asAccount_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "asAccount_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "asAccount_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "asAccount_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asAccount_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asAccount_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asAccount_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asAccount_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asAccount_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asAccount_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asAccount_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asAccount_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "asAccount_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "asAccount_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "name"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "name_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "name_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "name_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "name_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "name_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "name_not_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "symbol_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "symbol_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "symbol_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "symbol_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "symbol_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "symbol_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "symbol_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "symbol_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "symbol_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "decimals"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "decimals_not"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "decimals_gt"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "decimals_lt"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "decimals_gte"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "decimals_lte"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      {
        name: "decimals_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "decimals_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseToken"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "baseToken_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "baseToken_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "baseToken_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "baseToken_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "baseToken_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "baseToken_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseToken_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseToken_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "baseToken_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "baseToken_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "baseToken_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "baseToken_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "baseToken_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "baseToken_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "baseToken_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "baseToken_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "baseToken_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "baseToken_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "baseToken_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "baseToken_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Contract_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "quoteToken"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "quoteToken_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "quoteToken_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "quoteToken_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "quoteToken_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "quoteToken_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "quoteToken_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteToken_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteToken_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "quoteToken_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "quoteToken_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "quoteToken_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "quoteToken_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "quoteToken_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "quoteToken_not_starts_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "quoteToken_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "quoteToken_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "quoteToken_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "quoteToken_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "quoteToken_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "quoteToken_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Contract_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "baseReserve"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseReserve_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseReserve_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseReserve_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseReserve_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseReserve_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "baseReserve_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseReserve_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseReserveExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseReserveExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseReserveExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseReserveExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseReserveExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseReserveExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "baseReserveExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseReserveExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteReserve"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteReserve_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteReserve_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteReserve_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteReserve_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteReserve_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "quoteReserve_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteReserve_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteReserveExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteReserveExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteReserveExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteReserveExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteReserveExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteReserveExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "quoteReserveExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteReserveExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "totalSupply"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "totalSupply_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "totalSupply_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "totalSupply_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "totalSupplyExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "totalSupplyExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "totalSupplyExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "totalSupplyExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseTokenPrice"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseTokenPrice_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseTokenPrice_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseTokenPrice_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseTokenPrice_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseTokenPrice_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "baseTokenPrice_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseTokenPrice_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseTokenPriceExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseTokenPriceExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseTokenPriceExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseTokenPriceExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseTokenPriceExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseTokenPriceExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "baseTokenPriceExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseTokenPriceExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteTokenPrice"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPrice_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPrice_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPrice_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPrice_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPrice_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "quoteTokenPrice_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteTokenPrice_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteTokenPriceExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPriceExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPriceExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPriceExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPriceExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteTokenPriceExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "quoteTokenPriceExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteTokenPriceExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "swapFee"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "swapFee_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "swapFee_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "swapFee_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "swapFee_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "swapFee_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "swapFee_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "swapFee_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "swaps_"; type: { kind: "INPUT_OBJECT"; name: "ERC20DexSwap_filter"; ofType: null }; defaultValue: null },
      { name: "mints_"; type: { kind: "INPUT_OBJECT"; name: "ERC20DexMint_filter"; ofType: null }; defaultValue: null },
      { name: "burns_"; type: { kind: "INPUT_OBJECT"; name: "ERC20DexBurn_filter"; ofType: null }; defaultValue: null },
      {
        name: "stakes_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20DexStake_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexPair_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexPair_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20DexPair_orderBy: {
    name: "ERC20DexPair_orderBy";
    enumValues:
      | "id"
      | "asAccount"
      | "asAccount__id"
      | "name"
      | "symbol"
      | "decimals"
      | "baseToken"
      | "baseToken__id"
      | "baseToken__name"
      | "baseToken__symbol"
      | "baseToken__decimals"
      | "baseToken__extraData"
      | "baseToken__totalSupply"
      | "baseToken__totalSupplyExact"
      | "quoteToken"
      | "quoteToken__id"
      | "quoteToken__name"
      | "quoteToken__symbol"
      | "quoteToken__decimals"
      | "quoteToken__extraData"
      | "quoteToken__totalSupply"
      | "quoteToken__totalSupplyExact"
      | "baseReserve"
      | "baseReserveExact"
      | "quoteReserve"
      | "quoteReserveExact"
      | "totalSupply"
      | "totalSupplyExact"
      | "baseTokenPrice"
      | "baseTokenPriceExact"
      | "quoteTokenPrice"
      | "quoteTokenPriceExact"
      | "swapFee"
      | "swaps"
      | "mints"
      | "burns"
      | "stakes";
  };
  ERC20DexStake: {
    kind: "OBJECT";
    name: "ERC20DexStake";
    fields: {
      account: { name: "account"; type: { kind: "OBJECT"; name: "Account"; ofType: null } };
      id: { name: "id"; type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } } };
      pair: {
        name: "pair";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
      };
      value: {
        name: "value";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      valueExact: {
        name: "valueExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
    };
  };
  ERC20DexStake_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20DexStake_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "pair_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "pair_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_"; type: { kind: "INPUT_OBJECT"; name: "ERC20DexPair_filter"; ofType: null }; defaultValue: null },
      { name: "account"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "account_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "account_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "account_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "account_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "account_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "account_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "account_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "account_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "account_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "account_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "account_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "account_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "value"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "value_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "value_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "valueExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "valueExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "valueExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexStake_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexStake_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20DexStake_orderBy: {
    name: "ERC20DexStake_orderBy";
    enumValues:
      | "id"
      | "pair"
      | "pair__id"
      | "pair__name"
      | "pair__symbol"
      | "pair__decimals"
      | "pair__baseReserve"
      | "pair__baseReserveExact"
      | "pair__quoteReserve"
      | "pair__quoteReserveExact"
      | "pair__totalSupply"
      | "pair__totalSupplyExact"
      | "pair__baseTokenPrice"
      | "pair__baseTokenPriceExact"
      | "pair__quoteTokenPrice"
      | "pair__quoteTokenPriceExact"
      | "pair__swapFee"
      | "account"
      | "account__id"
      | "value"
      | "valueExact";
  };
  ERC20DexSwap: {
    kind: "OBJECT";
    name: "ERC20DexSwap";
    fields: {
      baseAmountIn: {
        name: "baseAmountIn";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      baseAmountInExact: {
        name: "baseAmountInExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      baseAmountOut: {
        name: "baseAmountOut";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      baseAmountOutExact: {
        name: "baseAmountOutExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      emitter: {
        name: "emitter";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      id: { name: "id"; type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } } };
      pair: {
        name: "pair";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
      };
      quoteAmountIn: {
        name: "quoteAmountIn";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      quoteAmountInExact: {
        name: "quoteAmountInExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      quoteAmountOut: {
        name: "quoteAmountOut";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      quoteAmountOutExact: {
        name: "quoteAmountOutExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      sender: {
        name: "sender";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      timestamp: {
        name: "timestamp";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      transaction: {
        name: "transaction";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Transaction"; ofType: null } };
      };
    };
  };
  ERC20DexSwap_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20DexSwap_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "transaction_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_";
        type: { kind: "INPUT_OBJECT"; name: "Transaction_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "emitter_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "emitter_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "timestamp"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "timestamp_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "timestamp_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "pair_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "pair_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "pair_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "pair_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_not_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "pair_"; type: { kind: "INPUT_OBJECT"; name: "ERC20DexPair_filter"; ofType: null }; defaultValue: null },
      { name: "sender"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "sender_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "sender_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "sender_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "sender_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "sender_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "sender_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "sender_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "sender_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "sender_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "sender_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "baseAmountIn"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmountIn_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmountIn_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmountIn_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmountIn_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmountIn_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "baseAmountIn_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseAmountIn_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseAmountInExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountInExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountInExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountInExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountInExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountInExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "baseAmountInExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseAmountInExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteAmountIn"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmountIn_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmountIn_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmountIn_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmountIn_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmountIn_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "quoteAmountIn_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteAmountIn_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteAmountInExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountInExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountInExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountInExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountInExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountInExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "quoteAmountInExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteAmountInExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseAmountOut"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmountOut_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmountOut_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmountOut_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmountOut_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "baseAmountOut_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "baseAmountOut_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseAmountOut_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "baseAmountOutExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountOutExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountOutExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountOutExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountOutExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "baseAmountOutExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "baseAmountOutExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "baseAmountOutExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteAmountOut"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmountOut_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmountOut_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmountOut_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmountOut_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "quoteAmountOut_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "quoteAmountOut_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteAmountOut_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "quoteAmountOutExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountOutExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountOutExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountOutExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountOutExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "quoteAmountOutExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "quoteAmountOutExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "quoteAmountOutExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexSwap_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20DexSwap_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20DexSwap_orderBy: {
    name: "ERC20DexSwap_orderBy";
    enumValues:
      | "id"
      | "transaction"
      | "transaction__id"
      | "transaction__timestamp"
      | "transaction__blockNumber"
      | "emitter"
      | "emitter__id"
      | "timestamp"
      | "pair"
      | "pair__id"
      | "pair__name"
      | "pair__symbol"
      | "pair__decimals"
      | "pair__baseReserve"
      | "pair__baseReserveExact"
      | "pair__quoteReserve"
      | "pair__quoteReserveExact"
      | "pair__totalSupply"
      | "pair__totalSupplyExact"
      | "pair__baseTokenPrice"
      | "pair__baseTokenPriceExact"
      | "pair__quoteTokenPrice"
      | "pair__quoteTokenPriceExact"
      | "pair__swapFee"
      | "sender"
      | "sender__id"
      | "baseAmountIn"
      | "baseAmountInExact"
      | "quoteAmountIn"
      | "quoteAmountInExact"
      | "baseAmountOut"
      | "baseAmountOutExact"
      | "quoteAmountOut"
      | "quoteAmountOutExact";
  };
  ERC20TokenVolume: {
    kind: "OBJECT";
    name: "ERC20TokenVolume";
    fields: {
      id: {
        name: "id";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int8"; ofType: null } };
      };
      timestamp: {
        name: "timestamp";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Timestamp"; ofType: null } };
      };
      token: {
        name: "token";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
      };
      transferCount: {
        name: "transferCount";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
      };
      volume: {
        name: "volume";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
    };
  };
  ERC20TokenVolumeStats: {
    kind: "OBJECT";
    name: "ERC20TokenVolumeStats";
    fields: {
      id: {
        name: "id";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int8"; ofType: null } };
      };
      timestamp: {
        name: "timestamp";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Timestamp"; ofType: null } };
      };
      token: {
        name: "token";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
      };
      totalTransfers: {
        name: "totalTransfers";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
      };
      totalVolume: {
        name: "totalVolume";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
    };
  };
  ERC20TokenVolumeStats_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20TokenVolumeStats_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int8"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "timestamp"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_gt"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_lt"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_gte"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_lte"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      {
        name: "timestamp_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Timestamp"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "token"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "token_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Contract_filter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20TokenVolumeStats_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20TokenVolumeStats_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20TokenVolume_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20TokenVolume_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "Int8"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int8"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int8"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "timestamp"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_not"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_gt"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_lt"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_gte"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      { name: "timestamp_lte"; type: { kind: "SCALAR"; name: "Timestamp"; ofType: null }; defaultValue: null },
      {
        name: "timestamp_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Timestamp"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "timestamp_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Timestamp"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "token"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "token_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "token_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "token_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "token_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "token_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "token_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "token_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "token_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Contract_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "transferCount"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "transferCount_not"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "transferCount_gt"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "transferCount_lt"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "transferCount_gte"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      { name: "transferCount_lte"; type: { kind: "SCALAR"; name: "Int"; ofType: null }; defaultValue: null },
      {
        name: "transferCount_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "transferCount_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "volume"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volume_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volume_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volume_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volume_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "volume_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "volume_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "volume_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20TokenVolume_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20TokenVolume_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20TokenVolume_orderBy: {
    name: "ERC20TokenVolume_orderBy";
    enumValues:
      | "id"
      | "timestamp"
      | "token"
      | "token__id"
      | "token__name"
      | "token__symbol"
      | "token__decimals"
      | "token__extraData"
      | "token__totalSupply"
      | "token__totalSupplyExact"
      | "transferCount"
      | "volume";
  };
  ERC20Transfer: {
    kind: "OBJECT";
    name: "ERC20Transfer";
    fields: {
      contract: {
        name: "contract";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
      };
      emitter: {
        name: "emitter";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      from: { name: "from"; type: { kind: "OBJECT"; name: "Account"; ofType: null } };
      fromBalance: { name: "fromBalance"; type: { kind: "OBJECT"; name: "ERC20Balance"; ofType: null } };
      id: { name: "id"; type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } } };
      timestamp: {
        name: "timestamp";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      to: { name: "to"; type: { kind: "OBJECT"; name: "Account"; ofType: null } };
      toBalance: { name: "toBalance"; type: { kind: "OBJECT"; name: "ERC20Balance"; ofType: null } };
      transaction: {
        name: "transaction";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Transaction"; ofType: null } };
      };
      value: {
        name: "value";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
      };
      valueExact: {
        name: "valueExact";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
    };
  };
  ERC20Transfer_filter: {
    kind: "INPUT_OBJECT";
    name: "ERC20Transfer_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "emitter"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "emitter_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "emitter_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "transaction"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "transaction_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_";
        type: { kind: "INPUT_OBJECT"; name: "Transaction_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "timestamp"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "timestamp_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "timestamp_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "contract"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "contract_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "contract_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "contract_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "contract_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "contract_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "contract_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "contract_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "contract_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Contract_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "from"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "from_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "from_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "from_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "from_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "from_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_not_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "from_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "fromBalance"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "fromBalance_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "fromBalance_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "fromBalance_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "fromBalance_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "fromBalance_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "fromBalance_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "fromBalance_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "fromBalance_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "fromBalance_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "fromBalance_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "fromBalance_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "fromBalance_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "fromBalance_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "fromBalance_not_starts_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "fromBalance_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "fromBalance_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "fromBalance_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "fromBalance_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "fromBalance_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "fromBalance_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Balance_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "to"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "to_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "to_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "to_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_not_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_not_starts_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_not_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "to_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "toBalance"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "toBalance_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "toBalance_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "toBalance_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "toBalance_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "toBalance_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "toBalance_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "toBalance_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "toBalance_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "toBalance_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "toBalance_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "toBalance_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "toBalance_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "toBalance_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "toBalance_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "toBalance_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "toBalance_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "toBalance_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "toBalance_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "toBalance_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "toBalance_";
        type: { kind: "INPUT_OBJECT"; name: "ERC20Balance_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "value"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_not"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_gt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_lt"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_gte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      { name: "value_lte"; type: { kind: "SCALAR"; name: "BigDecimal"; ofType: null }; defaultValue: null },
      {
        name: "value_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "value_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigDecimal"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "valueExact"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "valueExact_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "valueExact_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "valueExact_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20Transfer_filter"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "or";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ERC20Transfer_filter"; ofType: null };
        };
        defaultValue: null;
      },
    ];
  };
  ERC20Transfer_orderBy: {
    name: "ERC20Transfer_orderBy";
    enumValues:
      | "id"
      | "emitter"
      | "emitter__id"
      | "transaction"
      | "transaction__id"
      | "transaction__timestamp"
      | "transaction__blockNumber"
      | "timestamp"
      | "contract"
      | "contract__id"
      | "contract__name"
      | "contract__symbol"
      | "contract__decimals"
      | "contract__extraData"
      | "contract__totalSupply"
      | "contract__totalSupplyExact"
      | "from"
      | "from__id"
      | "fromBalance"
      | "fromBalance__id"
      | "fromBalance__value"
      | "fromBalance__valueExact"
      | "to"
      | "to__id"
      | "toBalance"
      | "toBalance__id"
      | "toBalance__value"
      | "toBalance__valueExact"
      | "value"
      | "valueExact";
  };
  Event: {
    kind: "INTERFACE";
    name: "Event";
    fields: {
      emitter: {
        name: "emitter";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
      };
      id: { name: "id"; type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } } };
      timestamp: {
        name: "timestamp";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      transaction: {
        name: "transaction";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Transaction"; ofType: null } };
      };
    };
    possibleTypes:
      | "ERC20DexBurn"
      | "ERC20DexEmergencyWithdraw"
      | "ERC20DexFeeUpdate"
      | "ERC20DexMint"
      | "ERC20DexSwap"
      | "ERC20Transfer";
  };
  Event_filter: {
    kind: "INPUT_OBJECT";
    name: "Event_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "transaction_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "transaction_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "transaction_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "transaction_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "transaction_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "transaction_";
        type: { kind: "INPUT_OBJECT"; name: "Transaction_filter"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lt"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_gte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_lte"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "emitter_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "emitter_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_contains_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_contains"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_contains_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_not_starts_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_starts_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_ends_with_nocase"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      { name: "emitter_not_ends_with"; type: { kind: "SCALAR"; name: "String"; ofType: null }; defaultValue: null },
      {
        name: "emitter_not_ends_with_nocase";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      { name: "emitter_"; type: { kind: "INPUT_OBJECT"; name: "Account_filter"; ofType: null }; defaultValue: null },
      { name: "timestamp"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "timestamp_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "timestamp_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: { kind: "LIST"; name: never; ofType: { kind: "INPUT_OBJECT"; name: "Event_filter"; ofType: null } };
        defaultValue: null;
      },
      {
        name: "or";
        type: { kind: "LIST"; name: never; ofType: { kind: "INPUT_OBJECT"; name: "Event_filter"; ofType: null } };
        defaultValue: null;
      },
    ];
  };
  Event_orderBy: {
    name: "Event_orderBy";
    enumValues:
      | "id"
      | "transaction"
      | "transaction__id"
      | "transaction__timestamp"
      | "transaction__blockNumber"
      | "emitter"
      | "emitter__id"
      | "timestamp";
  };
  ID: unknown;
  Int: unknown;
  Int8: unknown;
  OrderDirection: { name: "OrderDirection"; enumValues: "asc" | "desc" };
  Query: {
    kind: "OBJECT";
    name: "Query";
    fields: {
      _meta: { name: "_meta"; type: { kind: "OBJECT"; name: "_Meta_"; ofType: null } };
      account: { name: "account"; type: { kind: "OBJECT"; name: "Account"; ofType: null } };
      accounts: {
        name: "accounts";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
          };
        };
      };
      erc20Approval: { name: "erc20Approval"; type: { kind: "OBJECT"; name: "ERC20Approval"; ofType: null } };
      erc20Approvals: {
        name: "erc20Approvals";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Approval"; ofType: null } };
          };
        };
      };
      erc20Balance: { name: "erc20Balance"; type: { kind: "OBJECT"; name: "ERC20Balance"; ofType: null } };
      erc20Balances: {
        name: "erc20Balances";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Balance"; ofType: null } };
          };
        };
      };
      erc20Contract: { name: "erc20Contract"; type: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
      erc20Contracts: {
        name: "erc20Contracts";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
          };
        };
      };
      erc20DexBurn: { name: "erc20DexBurn"; type: { kind: "OBJECT"; name: "ERC20DexBurn"; ofType: null } };
      erc20DexBurns: {
        name: "erc20DexBurns";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexBurn"; ofType: null } };
          };
        };
      };
      erc20DexEmergencyWithdraw: {
        name: "erc20DexEmergencyWithdraw";
        type: { kind: "OBJECT"; name: "ERC20DexEmergencyWithdraw"; ofType: null };
      };
      erc20DexEmergencyWithdraws: {
        name: "erc20DexEmergencyWithdraws";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ERC20DexEmergencyWithdraw"; ofType: null };
            };
          };
        };
      };
      erc20DexFeeUpdate: {
        name: "erc20DexFeeUpdate";
        type: { kind: "OBJECT"; name: "ERC20DexFeeUpdate"; ofType: null };
      };
      erc20DexFeeUpdates: {
        name: "erc20DexFeeUpdates";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ERC20DexFeeUpdate"; ofType: null };
            };
          };
        };
      };
      erc20DexMint: { name: "erc20DexMint"; type: { kind: "OBJECT"; name: "ERC20DexMint"; ofType: null } };
      erc20DexMints: {
        name: "erc20DexMints";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexMint"; ofType: null } };
          };
        };
      };
      erc20DexPair: { name: "erc20DexPair"; type: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
      erc20DexPairSnapshot: {
        name: "erc20DexPairSnapshot";
        type: { kind: "OBJECT"; name: "ERC20DexPairSnapshot"; ofType: null };
      };
      erc20DexPairSnapshots: {
        name: "erc20DexPairSnapshots";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ERC20DexPairSnapshot"; ofType: null };
            };
          };
        };
      };
      erc20DexPairStats_collection: {
        name: "erc20DexPairStats_collection";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ERC20DexPairStats"; ofType: null };
            };
          };
        };
      };
      erc20DexPairs: {
        name: "erc20DexPairs";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
          };
        };
      };
      erc20DexStake: { name: "erc20DexStake"; type: { kind: "OBJECT"; name: "ERC20DexStake"; ofType: null } };
      erc20DexStakes: {
        name: "erc20DexStakes";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexStake"; ofType: null } };
          };
        };
      };
      erc20DexSwap: { name: "erc20DexSwap"; type: { kind: "OBJECT"; name: "ERC20DexSwap"; ofType: null } };
      erc20DexSwaps: {
        name: "erc20DexSwaps";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexSwap"; ofType: null } };
          };
        };
      };
      erc20TokenVolume: { name: "erc20TokenVolume"; type: { kind: "OBJECT"; name: "ERC20TokenVolume"; ofType: null } };
      erc20TokenVolumeStats_collection: {
        name: "erc20TokenVolumeStats_collection";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ERC20TokenVolumeStats"; ofType: null };
            };
          };
        };
      };
      erc20TokenVolumes: {
        name: "erc20TokenVolumes";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ERC20TokenVolume"; ofType: null };
            };
          };
        };
      };
      erc20Transfer: { name: "erc20Transfer"; type: { kind: "OBJECT"; name: "ERC20Transfer"; ofType: null } };
      erc20Transfers: {
        name: "erc20Transfers";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Transfer"; ofType: null } };
          };
        };
      };
      event: { name: "event"; type: { kind: "INTERFACE"; name: "Event"; ofType: null } };
      events: {
        name: "events";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "INTERFACE"; name: "Event"; ofType: null } };
          };
        };
      };
      transaction: { name: "transaction"; type: { kind: "OBJECT"; name: "Transaction"; ofType: null } };
      transactions: {
        name: "transactions";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Transaction"; ofType: null } };
          };
        };
      };
    };
  };
  String: unknown;
  Subscription: {
    kind: "OBJECT";
    name: "Subscription";
    fields: {
      _meta: { name: "_meta"; type: { kind: "OBJECT"; name: "_Meta_"; ofType: null } };
      account: { name: "account"; type: { kind: "OBJECT"; name: "Account"; ofType: null } };
      accounts: {
        name: "accounts";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Account"; ofType: null } };
          };
        };
      };
      erc20Approval: { name: "erc20Approval"; type: { kind: "OBJECT"; name: "ERC20Approval"; ofType: null } };
      erc20Approvals: {
        name: "erc20Approvals";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Approval"; ofType: null } };
          };
        };
      };
      erc20Balance: { name: "erc20Balance"; type: { kind: "OBJECT"; name: "ERC20Balance"; ofType: null } };
      erc20Balances: {
        name: "erc20Balances";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Balance"; ofType: null } };
          };
        };
      };
      erc20Contract: { name: "erc20Contract"; type: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
      erc20Contracts: {
        name: "erc20Contracts";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Contract"; ofType: null } };
          };
        };
      };
      erc20DexBurn: { name: "erc20DexBurn"; type: { kind: "OBJECT"; name: "ERC20DexBurn"; ofType: null } };
      erc20DexBurns: {
        name: "erc20DexBurns";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexBurn"; ofType: null } };
          };
        };
      };
      erc20DexEmergencyWithdraw: {
        name: "erc20DexEmergencyWithdraw";
        type: { kind: "OBJECT"; name: "ERC20DexEmergencyWithdraw"; ofType: null };
      };
      erc20DexEmergencyWithdraws: {
        name: "erc20DexEmergencyWithdraws";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ERC20DexEmergencyWithdraw"; ofType: null };
            };
          };
        };
      };
      erc20DexFeeUpdate: {
        name: "erc20DexFeeUpdate";
        type: { kind: "OBJECT"; name: "ERC20DexFeeUpdate"; ofType: null };
      };
      erc20DexFeeUpdates: {
        name: "erc20DexFeeUpdates";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ERC20DexFeeUpdate"; ofType: null };
            };
          };
        };
      };
      erc20DexMint: { name: "erc20DexMint"; type: { kind: "OBJECT"; name: "ERC20DexMint"; ofType: null } };
      erc20DexMints: {
        name: "erc20DexMints";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexMint"; ofType: null } };
          };
        };
      };
      erc20DexPair: { name: "erc20DexPair"; type: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
      erc20DexPairSnapshot: {
        name: "erc20DexPairSnapshot";
        type: { kind: "OBJECT"; name: "ERC20DexPairSnapshot"; ofType: null };
      };
      erc20DexPairSnapshots: {
        name: "erc20DexPairSnapshots";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ERC20DexPairSnapshot"; ofType: null };
            };
          };
        };
      };
      erc20DexPairStats_collection: {
        name: "erc20DexPairStats_collection";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ERC20DexPairStats"; ofType: null };
            };
          };
        };
      };
      erc20DexPairs: {
        name: "erc20DexPairs";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexPair"; ofType: null } };
          };
        };
      };
      erc20DexStake: { name: "erc20DexStake"; type: { kind: "OBJECT"; name: "ERC20DexStake"; ofType: null } };
      erc20DexStakes: {
        name: "erc20DexStakes";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexStake"; ofType: null } };
          };
        };
      };
      erc20DexSwap: { name: "erc20DexSwap"; type: { kind: "OBJECT"; name: "ERC20DexSwap"; ofType: null } };
      erc20DexSwaps: {
        name: "erc20DexSwaps";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20DexSwap"; ofType: null } };
          };
        };
      };
      erc20TokenVolume: { name: "erc20TokenVolume"; type: { kind: "OBJECT"; name: "ERC20TokenVolume"; ofType: null } };
      erc20TokenVolumeStats_collection: {
        name: "erc20TokenVolumeStats_collection";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ERC20TokenVolumeStats"; ofType: null };
            };
          };
        };
      };
      erc20TokenVolumes: {
        name: "erc20TokenVolumes";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ERC20TokenVolume"; ofType: null };
            };
          };
        };
      };
      erc20Transfer: { name: "erc20Transfer"; type: { kind: "OBJECT"; name: "ERC20Transfer"; ofType: null } };
      erc20Transfers: {
        name: "erc20Transfers";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "ERC20Transfer"; ofType: null } };
          };
        };
      };
      event: { name: "event"; type: { kind: "INTERFACE"; name: "Event"; ofType: null } };
      events: {
        name: "events";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "INTERFACE"; name: "Event"; ofType: null } };
          };
        };
      };
      transaction: { name: "transaction"; type: { kind: "OBJECT"; name: "Transaction"; ofType: null } };
      transactions: {
        name: "transactions";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Transaction"; ofType: null } };
          };
        };
      };
    };
  };
  Timestamp: unknown;
  Transaction: {
    kind: "OBJECT";
    name: "Transaction";
    fields: {
      blockNumber: {
        name: "blockNumber";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
      events: {
        name: "events";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "INTERFACE"; name: "Event"; ofType: null } };
          };
        };
      };
      id: { name: "id"; type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } } };
      timestamp: {
        name: "timestamp";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
      };
    };
  };
  Transaction_filter: {
    kind: "INPUT_OBJECT";
    name: "Transaction_filter";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_not"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lt"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_gte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      { name: "id_lte"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
      {
        name: "id_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "id_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "timestamp"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "timestamp_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "timestamp_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "timestamp_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "blockNumber"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "blockNumber_not"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "blockNumber_gt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "blockNumber_lt"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "blockNumber_gte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      { name: "blockNumber_lte"; type: { kind: "SCALAR"; name: "BigInt"; ofType: null }; defaultValue: null },
      {
        name: "blockNumber_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      {
        name: "blockNumber_not_in";
        type: {
          kind: "LIST";
          name: never;
          ofType: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "BigInt"; ofType: null } };
        };
        defaultValue: null;
      },
      { name: "events_"; type: { kind: "INPUT_OBJECT"; name: "Event_filter"; ofType: null }; defaultValue: null },
      {
        name: "_change_block";
        type: { kind: "INPUT_OBJECT"; name: "BlockChangedFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "and";
        type: { kind: "LIST"; name: never; ofType: { kind: "INPUT_OBJECT"; name: "Transaction_filter"; ofType: null } };
        defaultValue: null;
      },
      {
        name: "or";
        type: { kind: "LIST"; name: never; ofType: { kind: "INPUT_OBJECT"; name: "Transaction_filter"; ofType: null } };
        defaultValue: null;
      },
    ];
  };
  Transaction_orderBy: { name: "Transaction_orderBy"; enumValues: "id" | "timestamp" | "blockNumber" | "events" };
  _Block_: {
    kind: "OBJECT";
    name: "_Block_";
    fields: {
      hash: { name: "hash"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null } };
      number: {
        name: "number";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
      };
      parentHash: { name: "parentHash"; type: { kind: "SCALAR"; name: "Bytes"; ofType: null } };
      timestamp: { name: "timestamp"; type: { kind: "SCALAR"; name: "Int"; ofType: null } };
    };
  };
  _Meta_: {
    kind: "OBJECT";
    name: "_Meta_";
    fields: {
      block: {
        name: "block";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "_Block_"; ofType: null } };
      };
      deployment: {
        name: "deployment";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
      };
      hasIndexingErrors: {
        name: "hasIndexingErrors";
        type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Boolean"; ofType: null } };
      };
    };
  };
  _SubgraphErrorPolicy_: { name: "_SubgraphErrorPolicy_"; enumValues: "allow" | "deny" };
};

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  name: "thegraph";
  query: "Query";
  mutation: never;
  subscription: "Subscription";
  types: introspection_types;
};

import * as gqlTada from "gql.tada";
