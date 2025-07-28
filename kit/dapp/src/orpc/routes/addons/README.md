# Addons API

The Addons API provides endpoints for managing system addons - modular smart
contracts that extend token functionality.

## Overview

System addons are extension contracts that add capabilities to tokens:

- **Airdrops**: Distribute tokens to multiple recipients
- **Yield**: Manage yield distribution schedules
- **XVP**: Handle XVP settlement processes

## Available Endpoints

### List Addons

`GET /addons` - Retrieve a paginated list of system addons with optional
filtering.

#### Query Parameters

- `offset` (number, optional): Pagination offset (default: 0)
- `limit` (number, optional): Maximum items to return (default: no limit)
- `orderBy` (string, optional): Field to sort by (default: "id")
- `orderDirection` ("asc" | "desc", optional): Sort direction (default: "asc")
- `typeId` ("airdrops" | "yield" | "xvp", optional): Filter by addon type
- `account` (address, optional): Filter by deploying account address

#### Example Usage

```typescript
import { client } from "@/orpc/orpc-client";

// Get all addons
const allAddons = await client.addons.list.query({});

// Get only airdrop addons
const airdropAddons = await client.addons.list.query({
  typeId: "airdrops",
});

// Get addons deployed by specific account
const userAddons = await client.addons.list.query({
  account: "0x1234567890abcdef...",
});

// Paginated retrieval with sorting
const page2 = await client.addons.list.query({
  offset: 50,
  limit: 50,
  orderBy: "name",
  orderDirection: "asc",
});

// Combined filters
const filteredAddons = await client.addons.list.query({
  typeId: "yield",
  account: "0xabcdef...",
  limit: 10,
});
```

#### Response Schema

```typescript
type SystemAddon = {
  id: string; // Addon contract address
  name: string; // Display name
  typeId: "airdrops" | "yield" | "xvp";
  deployedInTransaction: string; // Transaction hash
  account: {
    id: string; // Deployer address
  };
};
```

## Implementation Details

The addons API integrates with TheGraph to query blockchain data efficiently.
All endpoints require authentication and proper permissions.

### Data Source

Addon data is indexed by TheGraph from the SystemAddonRegistry contract events.
The subgraph tracks:

- Addon deployments
- Type classifications
- Associated accounts
- Transaction history

### Authentication

All addon endpoints require valid authentication. Users can only see addons they
have permission to access based on their role and account associations.

## Future Enhancements

Planned additions to the addons API:

- `GET /addons/:id` - Detailed addon information
- `POST /addons` - Deploy new addon instances
- `PUT /addons/:id` - Update addon configuration
- `DELETE /addons/:id` - Remove addons
- Webhook support for addon events
- Batch operations for multiple addons
