import { SMART_DEPLOYMENT_REGISTRY_ADDRESS } from "@/lib/contracts";
import {
  ApplicationSetupStatusSchema,
  type ApplicationSetupStatus,
} from "@/lib/queries/application-setup/application-setup-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { ResultOf } from "@settlemint/sdk-portal";
import type { Client } from "graphql-ws";
import { safeParse } from "../../utils/typebox";

const ABI_NAMES = [
  "CountryAllowListComplianceModule",
  "CountryBlockListComplianceModule",
  "SMARTCompliance",
  "SMARTDeploymentRegistry",
  "SMARTIdentity",
  "SMARTIdentityFactory",
  "SMARTIdentityImplementationAuthority",
  "SMARTIdentityRegistry",
  "SMARTIdentityRegistryStorage",
  "SMARTProxy",
  "SMARTTokenRegistry",
  "SMARTTrustedIssuersRegistry",
];

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

export async function subscribeToApplicationSetupStatus(
  client: Client,
  onStatusChange: (status: ApplicationSetupStatus) => void
) {
  const query = `subscription getContractsDeployStatus($abiNames: [String!]!) {
    getContractsDeployStatus(abiNames: $abiNames) {
      count
      records {
        createdAt
        address
        abiName
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

  for await (const result of subscription) {
    if (Array.isArray(result?.data?.getContractsDeployStatus?.records)) {
      onStatusChange(
        getApplicationStatus({
          ...result?.data,
          SMARTDeploymentRegistry: {
            areDependenciesRegistered: false, // TODO: when do we know this?
          },
        })
      );
    }
  }
}

function getApplicationStatus(
  status: NonNullable<ResultOf<typeof getApplicationStatusQuery>>
) {
  const isSetup =
    status.SMARTDeploymentRegistry?.areDependenciesRegistered ?? false;
  return safeParse(ApplicationSetupStatusSchema, {
    isSetup,
    deployedContracts: status.getContractsDeployStatus?.records ?? [],
  });
}
