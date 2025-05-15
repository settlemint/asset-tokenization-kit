import { SMART_DEPLOYMENT_REGISTRY_ADDRESS } from "@/lib/contracts";
import {
  ApplicationSetupStatusSchema,
  type ApplicationSetupStatus,
} from "@/lib/queries/application-setup/application-setup-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { ResultOf } from "@settlemint/sdk-portal";
import type { Client } from "graphql-ws";
import { safeParse } from "../../utils/typebox";

const CONTRACTS = [
  { abiName: "CountryAllowListComplianceModule", trackStatus: false },
  { abiName: "CountryBlockListComplianceModule", trackStatus: false },
  { abiName: "SMARTCompliance", trackStatus: true },
  { abiName: "SMARTDeploymentRegistry", trackStatus: false },
  { abiName: "SMARTIdentity", trackStatus: false },
  { abiName: "SMARTIdentityFactory", trackStatus: true },
  { abiName: "SMARTIdentityImplementationAuthority", trackStatus: false },
  { abiName: "SMARTIdentityRegistry", trackStatus: true },
  { abiName: "SMARTIdentityRegistryStorage", trackStatus: true },
  { abiName: "SMARTProxy", trackStatus: false },
  { abiName: "SMARTTokenRegistry", trackStatus: true },
  { abiName: "SMARTTrustedIssuersRegistry", trackStatus: true },
];
const ABI_NAMES = CONTRACTS.map((contract) => contract.abiName);

const getApplicationStatusQuery = portalGraphql(`
  query getApplicationStatus($smartDeploymentRegistryAddress: String!, $abiNames: [String!]!) {
    SMARTDeploymentRegistry(address: $smartDeploymentRegistryAddress) {
      areDependenciesRegistered
    }
    getContractsDeployStatus(abiNames: $abiNames) {
      count
      records {
        createdAt
        address
        abiName
        revertedAt
        deployedAt
      }
    }
  }
`);

export async function getApplicationSetupStatus() {
  const response = await portalClient.request(
    getApplicationStatusQuery,
    {
      abiNames: ABI_NAMES,
      smartDeploymentRegistryAddress: SMART_DEPLOYMENT_REGISTRY_ADDRESS,
    },
    {
      "X-GraphQL-Operation-Name": "getApplicationStatus",
      "X-GraphQL-Operation-Type": "query",
    }
  );

  return getApplicationStatus(response);
}

export function subscribeToApplicationSetupStatus(client: Client) {
  const query = `subscription getContractsDeployStatus($abiNames: [String!]!) {
    getContractsDeployStatus(abiNames: $abiNames) {
      count
      records {
        createdAt
        address
        abiName
        revertedAt
        deployedAt
      }
    }
  }` as const;
  type getContractsDeployStatusQuery = typeof portalGraphql<typeof query, []>;
  type GetContractsDeployStatusQueryResponse = ResultOf<
    ReturnType<getContractsDeployStatusQuery>
  >;

  const subscription = client.iterate<GetContractsDeployStatusQueryResponse>({
    query,
    variables: {
      abiNames: ABI_NAMES,
    },
  });

  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          let previousResult: ApplicationSetupStatus | undefined;
          const iteratorResult = await subscription.next();
          if (iteratorResult.done) {
            return { done: true, value: previousResult };
          }

          const result = iteratorResult.value;
          if (Array.isArray(result?.data?.getContractsDeployStatus?.records)) {
            const status = getApplicationStatus({
              ...result?.data,
              SMARTDeploymentRegistry: {
                areDependenciesRegistered: false, // TODO: when do we know this?
              },
            });
            previousResult = status;
            return { done: false, value: status };
          }

          return { done: false, value: previousResult };
        },
      };
    },
  };
}

function getApplicationStatus(
  status: NonNullable<ResultOf<typeof getApplicationStatusQuery>>
) {
  const isSetup =
    status.SMARTDeploymentRegistry?.areDependenciesRegistered ?? false;
  return safeParse(ApplicationSetupStatusSchema, {
    isSetup,
    contractStatus: CONTRACTS.filter((contract) => contract.trackStatus).map(
      (record) => {
        const mostRecentRecord = status.getContractsDeployStatus?.records.find(
          (record) => record.abiName === record.abiName
        );
        const isDeployed = mostRecentRecord?.deployedAt !== null;
        const isReverted = mostRecentRecord?.revertedAt !== null;
        return {
          name: record.abiName,
          status: isDeployed ? "deployed" : isReverted ? "reverted" : "pending",
        };
      }
    ),
    deployedContracts: status.getContractsDeployStatus?.records ?? [],
  });
}
