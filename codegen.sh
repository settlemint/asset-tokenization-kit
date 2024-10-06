#! /bin/bash

bunx gql-tada generate-schema $SETTLEMINT_HASURA_ENDPOINT --header "x-hasura-admin-secret: $SETTLEMINT_HASURA_ADMIN_SECRET" --header "x-auth-token: $SETTLEMINT_ACCESS_TOKEN" --output ./hasura.schema.graphql
bunx gql-tada generate-schema $SETTLEMINT_THEGRAPH_SUBGRAPH_ENDPOINT_FALLBACK --header "x-auth-token: $SETTLEMINT_ACCESS_TOKEN" --output ./thegraph.schema.graphql
bunx gql-tada generate-schema $SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT --header "x-auth-token: $SETTLEMINT_ACCESS_TOKEN" --output ./portal.schema.graphql
